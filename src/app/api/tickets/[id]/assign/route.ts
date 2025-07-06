import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { assignedTo, assignedToName } = body;

    if (!assignedTo || !assignedToName) {
      return NextResponse.json({ error: 'assignedTo and assignedToName are required' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    
    // Get ticket to check if it exists
    const ticket = await ticketService.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const success = await ticketService.assignTicket(
      id,
      assignedTo,
      assignedToName,
      session.user.id,
      session.user.name || ''
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to assign ticket' }, { status: 500 });
    }

    // Create notification for assignment
    await ticketService.createNotification({
      ticketId: ticket._id,
      userId: assignedTo,
      type: 'assignment',
      title: 'Ticket Assigned',
      message: `You have been assigned to ticket #${ticket.ticketNumber}`,
      read: false
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning ticket:', error);
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
    const success = await ticketService.unassignTicket(id);

    if (!success) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unassigning ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
