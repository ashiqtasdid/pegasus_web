import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session from the server side
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    return NextResponse.json({ 
      session: session ? {
        user: session.user,
        sessionId: session.session?.id,
        expiresAt: session.session?.expiresAt
      } : null,
      hasSession: !!session,
      cookies: request.headers.get('cookie'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check session',
      session: null,
      hasSession: false,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
