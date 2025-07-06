import { NextRequest, NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const assignedTo = url.searchParams.get('assignedTo')?.split(',') || undefined;
    const userId = url.searchParams.get('userId') || undefined;

    const ticketService = await connectTicketService();
    const stats = await ticketService.getTicketStats({
      assignedTo,
      userId
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
