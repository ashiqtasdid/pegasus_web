import { NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';

export async function GET() {
  try {
    const ticketService = await connectTicketService();
    
    // Create a test ticket
    const testTicket = await ticketService.createTicket(
      {
        title: 'Test Admin Reply System',
        description: 'This is a test ticket to verify the admin reply and notification system is working properly.',
        priority: 'normal',
        category: 'support',
        customFields: {}
      },
      'test-user-id',
      'test@example.com',
      'Test User'
    );
    
    // Add a test message from admin
    const testMessage = await ticketService.addMessage(
      testTicket._id,
      {
        content: 'This is a test admin reply. The user should receive a notification.',
        isInternal: false
      },
      'admin-user-id',
      'Admin User',
      'admin@example.com',
      'admin'
    );
    
    // Get notifications for the test user
    const notifications = await ticketService.getNotifications('test-user-id');
    
    return NextResponse.json({
      success: true,
      message: 'Test ticket and admin reply system working',
      data: {
        ticket: testTicket,
        message: testMessage,
        notifications: notifications
      }
    });
  } catch (error) {
    console.error('Error in test ticket system:', error);
    return NextResponse.json({ 
      error: 'Failed to test ticket system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
