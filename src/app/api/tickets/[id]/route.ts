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
    const ticket = await ticketService.getTicket(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can access this ticket (own ticket or admin)
    if (ticket.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Increment view count
    await ticketService.incrementViewCount(ticket._id);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const ticketService = await connectTicketService();
    
    // Get existing ticket to check permissions
    const existingTicket = await ticketService.getTicket(id);
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can update this ticket (own ticket or admin)
    if (existingTicket.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Users can only update certain fields, admins can update everything
    const allowedFields = session.user.isAdmin 
      ? ['title', 'description', 'status', 'priority', 'category', 'assignedTo', 'tags', 'customFields']
      : ['title', 'description', 'category', 'customFields'];

    const updateData = Object.keys(body).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = body[key];
      }
      return acc;
    }, {} as Record<string, unknown>);

    const updatedTicket = await ticketService.updateTicket(id, updateData);

    if (!updatedTicket) {
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Create notification for status changes
    if (body.status && body.status !== existingTicket.status) {
      await ticketService.createNotification({
        ticketId: updatedTicket._id,
        userId: existingTicket.userId,
        type: 'status-change',
        title: 'Ticket Status Updated',
        message: `Ticket #${updatedTicket.ticketNumber} status changed to ${body.status}`,
        read: false
      });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ticketService = await connectTicketService();
    const success = await ticketService.deleteTicket(id);

    if (!success) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
