import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log('=== COOKIE SYNC DEBUG ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Get the current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('Session from auth.api.getSession:', session);

    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Create a response that will set the session cookie
    const response = NextResponse.json({ 
      success: true, 
      session: session,
      message: 'Session cookie synchronized',
      debug: {
        sessionToken: session.session?.token,
        userId: session.user?.id,
        domain: request.headers.get('host'),
      }
    });

    // Try multiple cookie names and formats that Better Auth might use
    const cookieNames = [
      'better-auth.session_token',
      'better-auth.session',
      'authjs.session-token',
      'session_token'
    ];

    const sessionToken = session.session?.token;
    const host = request.headers.get('host') || 'moonlitservers.com';
    const isProduction = process.env.NODE_ENV === 'production';

    if (sessionToken) {
      console.log('Setting cookies with token:', sessionToken);
      
      // Set multiple cookie variations to ensure one works
      cookieNames.forEach(cookieName => {
        const cookieValue = sessionToken;
        
        if (isProduction) {
          // Production cookie settings
          response.headers.append('Set-Cookie', 
            `${cookieName}=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.${host}; Max-Age=604800`
          );
          // Also try without the domain prefix
          response.headers.append('Set-Cookie', 
            `${cookieName}=${cookieValue}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=${host}; Max-Age=604800`
          );
        } else {
          // Development cookie settings
          response.headers.append('Set-Cookie', 
            `${cookieName}=${cookieValue}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`
          );
        }
      });

      console.log('Response headers being set:', response.headers.getSetCookie());
    } else {
      console.log('No session token found in session object');
    }

    return response;
  } catch (error) {
    console.error('Cookie sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync session cookie',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
