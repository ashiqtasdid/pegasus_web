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
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Escalation reason is required' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    
    // Get ticket to check if it exists
    const ticket = await ticketService.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const success = await ticketService.escalateTicket(
      id,
      session.user.id,
      reason
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to escalate ticket' }, { status: 500 });
    }

    // Create notification for escalation
    await ticketService.createNotification({
      ticketId: ticket._id,
      userId: 'admin', // Broadcast to all admins
      type: 'escalation',
      title: 'Ticket Escalated',
      message: `Ticket #${ticket.ticketNumber} has been escalated: ${reason}`,
      read: false
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error escalating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
