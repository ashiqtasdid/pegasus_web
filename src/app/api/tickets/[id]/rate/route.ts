import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';

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
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    
    // Get ticket to check permissions
    const ticket = await ticketService.getTicket(id);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user can rate this ticket (own ticket only)
    if (ticket.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if ticket is resolved or closed
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return NextResponse.json({ error: 'Can only rate resolved or closed tickets' }, { status: 400 });
    }

    const success = await ticketService.updateSatisfactionRating(
      id,
      rating,
      feedback
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating satisfaction rating:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
