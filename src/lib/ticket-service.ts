import { MongoClient, ObjectId } from 'mongodb';
import { 
  Ticket, 
  TicketMessage, 
  TicketStats, 
  TicketFilter, 
  TicketSearchResult,
  TicketCreateRequest,
  TicketUpdateRequest,
  TicketMessageRequest,
  TicketPriority,
  TicketCategory,
  TicketNotification,
  TicketTemplate,
  TicketAutomation
} from '../types/ticket';

export class TicketService {
  private client: MongoClient;
  private dbName: string;

  constructor(mongoUri: string, dbName: string = 'pegasus_tickets') {
    this.client = new MongoClient(mongoUri);
    this.dbName = dbName;
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.close();
  }

  private get db() {
    return this.client.db(this.dbName);
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `TKT-${timestamp}${random}`;
  }

  // Ticket CRUD Operations
  async createTicket(request: TicketCreateRequest, userId: string, userEmail: string, userName: string): Promise<Ticket> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const ticket: Omit<Ticket, '_id'> = {
      ticketNumber: this.generateTicketNumber(),
      title: request.title,
      description: request.description,
      status: 'open',
      priority: request.priority,
      category: request.category,
      type: 'public',
      userId,
      userEmail,
      userName,
      tags: [],
      messages: [],
      messageCount: 0,
      attachments: [],
      customFields: request.customFields ? Object.entries(request.customFields).map(([key, value]) => ({
        id: key,
        name: key,
        type: 'text' as const,
        value,
        required: false
      })) : [],
      metadata: {
        source: 'web',
        ipAddress: undefined,
        userAgent: undefined
      },
      isEscalated: false,
      viewCount: 0,
      timespent: 0,
      sla: {
        breached: false
      },
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(ticket);
    return { ...ticket, _id: result.insertedId.toString() };
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    const collection = this.db.collection('tickets');
    const ticket = await collection.findOne({ 
      $or: [
        { _id: new ObjectId(ticketId) },
        { ticketNumber: ticketId }
      ]
    });
    
    if (!ticket) return null;
    
    return { ...ticket, _id: ticket._id.toString() } as Ticket;
  }

  async updateTicket(ticketId: string, request: TicketUpdateRequest): Promise<Ticket | null> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const updateData: Record<string, unknown> = {
      ...request,
      updatedAt: now
    };

    // Handle status changes
    if (request.status) {
      if (request.status === 'resolved') {
        updateData.resolvedAt = now;
      } else if (request.status === 'closed') {
        updateData.closedAt = now;
      }
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(ticketId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) return null;
    return { ...result, _id: result._id.toString() } as Ticket;
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const result = await collection.deleteOne({ _id: new ObjectId(ticketId) });
    return result.deletedCount > 0;
  }

  // Message Operations
  async addMessage(ticketId: string, message: TicketMessageRequest, authorId: string, authorName: string, authorEmail: string, authorRole: 'user' | 'admin' | 'agent' = 'user'): Promise<TicketMessage> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const ticketMessage: TicketMessage = {
      id: new ObjectId().toString(),
      ticketId,
      authorId,
      authorName,
      authorEmail,
      authorRole,
      content: message.content,
      isInternal: message.isInternal || false,
      createdAt: now,
      attachments: [],
      metadata: {}
    };

    // Check if this is the first admin response
    const ticket = await collection.findOne({ _id: new ObjectId(ticketId) });
    const isFirstAdminResponse = authorRole === 'admin' && ticket && !ticket.firstResponseAt;

    const updateData: Record<string, unknown> = {
      $push: { messages: ticketMessage as unknown },
      $inc: { messageCount: 1 },
      $set: { 
        lastMessageAt: now,
        lastMessageBy: authorId,
        updatedAt: now
      }
    };

    // Set first response time if this is the first admin response
    if (isFirstAdminResponse) {
      (updateData.$set as Record<string, unknown>).firstResponseAt = now;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      updateData
    );

    if (result.modifiedCount === 0) {
      throw new Error('Ticket not found');
    }

    // Create notification for the recipient
    if (ticket && !message.isInternal) {
      const recipientId = authorRole === 'admin' ? ticket.userId : ticket.assignedTo;
      if (recipientId && recipientId !== authorId) {
        await this.createNotification({
          ticketId,
          userId: recipientId,
          type: 'new-message',
          title: `New message on ticket #${ticket.ticketNumber}`,
          message: `${authorName} has replied to your ticket: ${ticket.title}`,
          read: false
        });
      }
    }

    return ticketMessage;
  }

  async getMessages(ticketId: string, includeInternal: boolean = false): Promise<TicketMessage[]> {
    const collection = this.db.collection('tickets');
    const ticket = await collection.findOne({ _id: new ObjectId(ticketId) });
    
    if (!ticket) return [];
    
    const messages = ticket.messages || [];
    return includeInternal ? messages : messages.filter((msg: TicketMessage) => !msg.isInternal);
  }

  // Search and Filter Operations
  async searchTickets(filter: TicketFilter, page: number = 1, pageSize: number = 10): Promise<TicketSearchResult> {
    const collection = this.db.collection('tickets');
    const skip = (page - 1) * pageSize;
    
    // Build query
    const query: Record<string, unknown> = {};
    
    if (filter.status?.length) {
      query.status = { $in: filter.status };
    }
    
    if (filter.priority?.length) {
      query.priority = { $in: filter.priority };
    }
    
    if (filter.category?.length) {
      query.category = { $in: filter.category };
    }
    
    if (filter.assignedTo?.length) {
      query.assignedTo = { $in: filter.assignedTo };
    }
    
    if (filter.userId) {
      query.userId = filter.userId;
    }
    
    if (filter.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { ticketNumber: { $regex: filter.search, $options: 'i' } }
      ];
    }
    
    if (filter.dateRange) {
      query.createdAt = {
        $gte: filter.dateRange.from,
        $lte: filter.dateRange.to
      };
    }

    const [tickets, total] = await Promise.all([
      collection.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      collection.countDocuments(query)
    ]);

    return {
      tickets: tickets.map(ticket => ({ ...ticket, _id: ticket._id.toString() })) as Ticket[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  // Assignment Operations
  async assignTicket(ticketId: string, assignedTo: string, assignedToName: string, assignedBy: string, assignedByName: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $set: {
          assignedTo,
          assignedToName,
          assignment: {
            assignedTo,
            assignedBy,
            assignedAt: now,
            assignedToName,
            assignedByName
          },
          updatedAt: now
        }
      }
    );

    return result.modifiedCount > 0;
  }

  async unassignTicket(ticketId: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $unset: {
          assignedTo: "",
          assignedToName: "",
          assignment: ""
        },
        $set: {
          updatedAt: now
        }
      }
    );

    return result.modifiedCount > 0;
  }

  // Statistics and Analytics
  async getTicketStats(filter?: Partial<TicketFilter>): Promise<TicketStats> {
    const collection = this.db.collection('tickets');
    
    // Build base query
    const baseQuery: Record<string, unknown> = {};
    if (filter?.userId) baseQuery.userId = filter.userId;
    if (filter?.assignedTo?.length) baseQuery.assignedTo = { $in: filter.assignedTo };
    
    const [
      statusCounts,
      priorityCounts,
      categoryCounts,
      avgResolutionTime,
      avgFirstResponse,
      satisfactionData,
      slaBreaches
    ] = await Promise.all([
      // Status counts
      collection.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Priority counts
      collection.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Category counts
      collection.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Average resolution time
      collection.aggregate([
        { $match: { ...baseQuery, resolvedAt: { $exists: true } } },
        { 
          $project: {
            resolutionTime: {
              $divide: [
                { $subtract: [{ $dateFromString: { dateString: '$resolvedAt' } }, { $dateFromString: { dateString: '$createdAt' } }] },
                3600000 // Convert to hours
              ]
            }
          }
        },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }
      ]).toArray(),
      
      // Average first response time
      collection.aggregate([
        { $match: { ...baseQuery, firstResponseAt: { $exists: true } } },
        { 
          $project: {
            firstResponseTime: {
              $divide: [
                { $subtract: [{ $dateFromString: { dateString: '$firstResponseAt' } }, { $dateFromString: { dateString: '$createdAt' } }] },
                3600000 // Convert to hours
              ]
            }
          }
        },
        { $group: { _id: null, avg: { $avg: '$firstResponseTime' } } }
      ]).toArray(),
      
      // Satisfaction data
      collection.aggregate([
        { $match: { ...baseQuery, satisfactionRating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$satisfactionRating' } } }
      ]).toArray(),
      
      // SLA breaches
      collection.countDocuments({ ...baseQuery, 'sla.breached': true })
    ]);

    // Process results
    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const priorityMap = priorityCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const categoryMap = categoryCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      total: statusCounts.reduce((sum, item) => sum + item.count, 0),
      open: statusMap.open || 0,
      inProgress: statusMap['in-progress'] || 0,
      pendingUser: statusMap['pending-user'] || 0,
      resolved: statusMap.resolved || 0,
      closed: statusMap.closed || 0,
      byPriority: priorityMap as Record<TicketPriority, number>,
      byCategory: categoryMap as Record<TicketCategory, number>,
      averageResolutionTime: avgResolutionTime[0]?.avg || 0,
      firstResponseTime: avgFirstResponse[0]?.avg || 0,
      satisfactionAverage: satisfactionData[0]?.avg || 0,
      slaBreaches,
      topAgents: [] // TODO: Implement agent statistics
    };
  }

  // Escalation Operations
  async escalateTicket(ticketId: string, escalatedBy: string, reason: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $set: {
          isEscalated: true,
          escalatedAt: now,
          escalatedBy,
          escalationReason: reason,
          priority: 'high', // Auto-escalate priority
          updatedAt: now
        }
      }
    );

    return result.modifiedCount > 0;
  }

  // Notification Operations
  async createNotification(notification: Omit<TicketNotification, 'id' | 'createdAt'>): Promise<TicketNotification> {
    const collection = this.db.collection('notifications');
    const now = new Date().toISOString();
    
    const fullNotification: TicketNotification = {
      ...notification,
      id: new ObjectId().toString(),
      createdAt: now
    };

    await collection.insertOne(fullNotification);
    return fullNotification;
  }

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<TicketNotification[]> {
    const collection = this.db.collection('notifications');
    const query: { userId: string; read?: boolean } = { userId };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    const notifications = await collection.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    return notifications.map(notif => ({ ...notif, id: notif._id.toString() })) as unknown as TicketNotification[];
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const collection = this.db.collection('notifications');
    const result = await collection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { read: true } }
    );
    
    return result.modifiedCount > 0;
  }

  // Template Operations
  async createTemplate(template: Omit<TicketTemplate, 'id' | 'createdAt' | 'usage'>): Promise<TicketTemplate> {
    const collection = this.db.collection('templates');
    const now = new Date().toISOString();
    
    const fullTemplate: TicketTemplate = {
      ...template,
      id: new ObjectId().toString(),
      createdAt: now,
      usage: 0
    };

    await collection.insertOne(fullTemplate);
    return fullTemplate;
  }

  async getTemplates(isActive: boolean = true): Promise<TicketTemplate[]> {
    const collection = this.db.collection('templates');
    const templates = await collection.find({ isActive }).toArray();
    
    return templates.map(template => ({ ...template, id: template._id.toString() })) as unknown as TicketTemplate[];
  }

  // Automation Operations
  async createAutomation(automation: Omit<TicketAutomation, 'id' | 'createdAt' | 'triggerCount'>): Promise<TicketAutomation> {
    const collection = this.db.collection('automations');
    const now = new Date().toISOString();
    
    const fullAutomation: TicketAutomation = {
      ...automation,
      id: new ObjectId().toString(),
      createdAt: now,
      triggerCount: 0
    };

    await collection.insertOne(fullAutomation);
    return fullAutomation;
  }

  async getActiveAutomations(): Promise<TicketAutomation[]> {
    const collection = this.db.collection('automations');
    const automations = await collection.find({ isActive: true }).toArray();
    
    return automations.map(automation => ({ ...automation, id: automation._id.toString() })) as unknown as TicketAutomation[];
  }

  async triggerAutomation(automationId: string): Promise<boolean> {
    const collection = this.db.collection('automations');
    const now = new Date().toISOString();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(automationId) },
      { 
        $set: { lastTriggered: now },
        $inc: { triggerCount: 1 }
      }
    );

    return result.modifiedCount > 0;
  }

  // Utility Operations
  async incrementViewCount(ticketId: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { 
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: now }
      }
    );

    return result.modifiedCount > 0;
  }

  async updateSatisfactionRating(ticketId: string, rating: number, feedback?: string): Promise<boolean> {
    const collection = this.db.collection('tickets');
    const now = new Date().toISOString();
    
    const updateData: Record<string, unknown> = {
      satisfactionRating: rating,
      ratedAt: now,
      updatedAt: now
    };

    if (feedback) {
      updateData.satisfactionFeedback = feedback;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  }
}

// Export singleton instance
let ticketService: TicketService | null = null;

export function getTicketService(): TicketService {
  if (!ticketService) {
    ticketService = new TicketService(process.env.MONGODB_URI!);
  }
  return ticketService;
}

export async function connectTicketService(): Promise<TicketService> {
  const service = getTicketService();
  await service.connect();
  return service;
}
