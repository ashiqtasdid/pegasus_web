import { NextResponse } from 'next/server';
import { connectTicketService } from '@/lib/ticket-service';

export async function GET() {
  try {
    const ticketService = await connectTicketService();
    
    // Test basic connection and query
    const testResult = await ticketService.searchTickets({}, 1, 1);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Ticket service is working',
      totalTickets: testResult.total
    });
  } catch (error) {
    console.error('Ticket service test failed:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Ticket service failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
