import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';
import { TicketStatus, TicketPriority, TicketCategory } from '@/types/ticket';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status')?.split(',') as TicketStatus[] | undefined;
    const priority = url.searchParams.get('priority')?.split(',') as TicketPriority[] | undefined;
    const category = url.searchParams.get('category')?.split(',') as TicketCategory[] | undefined;
    const search = url.searchParams.get('search') || undefined;
    const assignedTo = url.searchParams.get('assignedTo')?.split(',') || undefined;
    const userId = url.searchParams.get('userId') || undefined;

    const filter = {
      status,
      priority,
      category,
      search,
      assignedTo,
      // Only admins can see all tickets or specify userId filter
      // Non-admins can only see their own tickets
      userId: session.user.isAdmin ? userId : session.user.id
    };

    const ticketService = await connectTicketService();
    const result = await ticketService.searchTickets(filter, page, pageSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, category, customFields } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const ticketService = await connectTicketService();
    const ticket = await ticketService.createTicket(
      { title, description, priority, category, customFields },
      session.user.id,
      session.user.email || '',
      session.user.name || ''
    );

    // Create notification for admins
    await ticketService.createNotification({
      ticketId: ticket._id,
      userId: 'admin', // Broadcast to all admins
      type: 'new-ticket',
      title: 'New Ticket Created',
      message: `New ticket #${ticket.ticketNumber}: ${ticket.title}`,
      read: false
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
