// types/ticket.ts
export type TicketStatus = 'open' | 'in-progress' | 'pending-user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type TicketCategory = 'bug' | 'feature-request' | 'support' | 'billing' | 'account' | 'technical' | 'other';
export type TicketType = 'public' | 'internal' | 'escalated';

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorRole: 'user' | 'admin' | 'agent' | 'system';
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt?: string;
  attachments?: TicketAttachment[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    systemGenerated?: boolean;
  };
}

export interface TicketTag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TicketAssignment {
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  assignedToName: string;
  assignedByName: string;
}

export interface TicketSLA {
  firstResponseTime?: number; // minutes
  resolutionTime?: number; // minutes
  firstResponseDue?: string;
  resolutionDue?: string;
  breached: boolean;
}

export interface TicketCustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  value: string | number | boolean | string[];
  required: boolean;
  options?: string[]; // for select/multiselect fields
}

export interface Ticket {
  _id: string;
  ticketNumber: string; // Auto-generated unique identifier (e.g., "TKT-001234")
  
  // Basic Information
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  type: TicketType;
  
  // User Information
  userId: string;
  userEmail: string;
  userName: string;
  
  // Assignment & Ownership
  assignedTo?: string;
  assignedToName?: string;
  assignment?: TicketAssignment;
  
  // Tags & Classification
  tags: TicketTag[];
  
  // Messages & Communication
  messages: TicketMessage[];
  messageCount: number;
  lastMessageAt?: string;
  lastMessageBy?: string;
  
  // Timing & SLA
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  firstResponseAt?: string;
  sla: TicketSLA;
  
  // Metadata
  attachments: TicketAttachment[];
  customFields: TicketCustomField[];
  metadata: {
    source: 'web' | 'email' | 'api' | 'phone' | 'chat';
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    location?: string;
    deviceInfo?: string;
  };
  
  // Admin Features
  isEscalated: boolean;
  escalatedAt?: string;
  escalatedBy?: string;
  escalationReason?: string;
  
  // Analytics & Tracking
  viewCount: number;
  lastViewedAt?: string;
  timespent: number; // in minutes
  
  // Satisfaction & Rating
  satisfactionRating?: number; // 1-5 stars
  satisfactionFeedback?: string;
  ratedAt?: string;
}

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
  userId?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  pendingUser: number;
  resolved: number;
  closed: number;
  byPriority: Record<TicketPriority, number>;
  byCategory: Record<TicketCategory, number>;
  averageResolutionTime: number; // in hours
  firstResponseTime: number; // in hours
  satisfactionAverage: number;
  slaBreaches: number;
  topAgents: Array<{
    agentId: string;
    agentName: string;
    ticketCount: number;
    avgResolutionTime: number;
    satisfactionRating: number;
  }>;
}

export interface TicketCreateRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  attachments?: File[];
  customFields?: Record<string, string | number | boolean>;
}

export interface TicketUpdateRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedTo?: string;
  tags?: string[];
  customFields?: Record<string, string | number | boolean>;
}

export interface TicketMessageRequest {
  content: string;
  isInternal?: boolean;
  attachments?: File[];
}

export interface TicketSearchResult {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketNotification {
  id: string;
  ticketId: string;
  userId: string;
  type: 'new-ticket' | 'status-change' | 'new-message' | 'assignment' | 'escalation' | 'sla-breach';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  category: TicketCategory;
  title: string;
  content: string;
  tags: string[];
  customFields: TicketCustomField[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  usage: number;
}

export interface TicketAutomation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    event: 'ticket-created' | 'status-changed' | 'priority-changed' | 'time-based' | 'message-added';
    conditions: Record<string, string | number | boolean>;
  };
  actions: Array<{
    type: 'assign' | 'change-status' | 'change-priority' | 'add-tag' | 'send-email' | 'create-task';
    parameters: Record<string, string | number | boolean>;
  }>;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}
