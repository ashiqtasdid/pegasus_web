import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticketId');
    
    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId parameter required' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    const ticket = await ticketService.getTicket(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ticket: {
        _id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        userId: ticket.userId,
        userEmail: ticket.userEmail,
        userName: ticket.userName,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      },
      debug: {
        canUpdate: session.user.isAdmin || ticket.userId === session.user.id,
        userRole: session.user.isAdmin ? 'admin' : 'user',
        sessionUserId: session.user.id,
        ticketUserId: ticket.userId
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
