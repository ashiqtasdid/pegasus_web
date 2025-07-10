import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get the session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user || !session?.session) {
      return NextResponse.json({ 
        valid: false, 
        user: null, 
        session: null,
        reason: 'No session found'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      valid: true, 
      user: session.user, 
      session: session.session,
      validated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      valid: false, 
      user: null, 
      session: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 401 });
  }
}
