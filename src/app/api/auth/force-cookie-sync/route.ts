import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Create a response that will set the session cookie
    const response = NextResponse.json({ 
      success: true, 
      session: session,
      message: 'Session cookie synchronized'
    });

    // Manually set the session cookie with proper options for production
    const cookieName = 'better-auth.session_token';
    const cookieValue = session.session.token;
    
    const cookieOptions = process.env.NODE_ENV === 'production' 
      ? 'HttpOnly; Secure; SameSite=Lax; Path=/; Domain=moonlitservers.com; Max-Age=604800'
      : 'HttpOnly; SameSite=Lax; Path=/; Max-Age=604800';

    response.headers.set('Set-Cookie', `${cookieName}=${cookieValue}; ${cookieOptions}`);

    return response;
  } catch (error) {
    console.error('Cookie sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync session cookie',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
