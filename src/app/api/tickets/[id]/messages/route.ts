import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketService = await connectTicketService();
    
    // Get ticket to check permissions
    const ticket = await ticketService.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can access this ticket (own ticket or admin)
    if (ticket.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await ticketService.getMessages(id, !!session.user.isAdmin);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, isInternal } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    
    // Get ticket to check permissions
    const ticket = await ticketService.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can add messages to this ticket (own ticket or admin)
    if (ticket.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only admins can create internal messages
    const messageIsInternal = isInternal && session.user.isAdmin;
    
    const message = await ticketService.addMessage(
      id,
      { content, isInternal: messageIsInternal },
      session.user.id,
      session.user.name || '',
      session.user.email || '',
      session.user.isAdmin ? 'admin' : 'user'
    );

    // Update first response time if this is the first admin response
    if (session.user.isAdmin && !ticket.firstResponseAt) {
      await ticketService.updateTicket(id, {
        status: ticket.status // Keep existing status, just trigger update
      });
      // Note: firstResponseAt is updated in the service layer
    }

    // Create notification for new message
    // For admin replies, notify the ticket owner
    // For user replies, notify all admins (we'll need to implement admin user retrieval)
    if (session.user.isAdmin && !messageIsInternal) {
      // Admin reply - notify the ticket owner
      await ticketService.createNotification({
        ticketId: ticket._id,
        userId: ticket.userId,
        type: 'new-message',
        title: `Admin Reply on Ticket #${ticket.ticketNumber}`,
        message: `An admin has replied to your ticket: ${ticket.title}`,
        read: false
      });
    }
    // Note: User replies to admins will be handled in the service layer based on assignedTo field

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
