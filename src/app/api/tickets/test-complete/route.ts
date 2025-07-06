import { NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';

export async function GET() {
  try {
    const ticketService = await connectTicketService();
    
    // Test 1: Create a user ticket
    const userTicket = await ticketService.createTicket(
      {
        title: 'User Support Request',
        description: 'I need help with my account settings.',
        priority: 'normal',
        category: 'account',
        customFields: {}
      },
      'user-123',
      'user@example.com',
      'John Doe'
    );
    
    // Test 2: Admin replies to the ticket
    const adminReply = await ticketService.addMessage(
      userTicket._id,
      {
        content: 'Hello! I can help you with your account settings. What specifically would you like to change?',
        isInternal: false
      },
      'admin-456',
      'Admin Sarah',
      'admin@example.com',
      'admin'
    );
    
    // Test 3: User replies back
    const userReply = await ticketService.addMessage(
      userTicket._id,
      {
        content: 'I want to change my email address and update my password.',
        isInternal: false
      },
      'user-123',
      'John Doe',
      'user@example.com',
      'user'
    );
    
    // Test 4: Admin adds internal note
    const internalNote = await ticketService.addMessage(
      userTicket._id,
      {
        content: 'User seems to need help with basic account management. Should be straightforward.',
        isInternal: true
      },
      'admin-456',
      'Admin Sarah',
      'admin@example.com',
      'admin'
    );
    
    // Test 5: Admin resolves ticket
    const resolvedTicket = await ticketService.updateTicket(userTicket._id, {
      status: 'resolved'
    });
    
    // Test 6: Get all messages
    const allMessages = await ticketService.getMessages(userTicket._id, true);
    const publicMessages = await ticketService.getMessages(userTicket._id, false);
    
    // Test 7: Get user notifications
    const userNotifications = await ticketService.getNotifications('user-123');
    
    // Test 8: Get ticket stats
    const stats = await ticketService.getTicketStats();
    
    // Test 9: Search tickets
    const searchResults = await ticketService.searchTickets({
      status: ['resolved']
    }, 1, 10);
    
    return NextResponse.json({
      success: true,
      message: 'Complete ticket system test successful',
      tests: {
        userTicket: {
          id: userTicket._id,
          ticketNumber: userTicket.ticketNumber,
          title: userTicket.title,
          status: userTicket.status
        },
        adminReply: {
          id: adminReply.id,
          content: adminReply.content,
          authorRole: adminReply.authorRole
        },
        userReply: {
          id: userReply.id,
          content: userReply.content,
          authorRole: userReply.authorRole
        },
        internalNote: {
          id: internalNote.id,
          content: internalNote.content,
          isInternal: internalNote.isInternal
        },
        resolvedTicket: resolvedTicket ? {
          id: resolvedTicket._id,
          status: resolvedTicket.status
        } : null,
        messageCount: {
          allMessages: allMessages.length,
          publicMessages: publicMessages.length
        },
        userNotifications: userNotifications.length,
        stats: stats,
        searchResults: searchResults.total
      }
    });
  } catch (error) {
    console.error('Error in complete ticket system test:', error);
    return NextResponse.json({ 
      error: 'Failed to test complete ticket system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
