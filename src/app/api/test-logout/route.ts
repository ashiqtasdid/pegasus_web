import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Clear the session using better-auth
    await auth.api.signOut({
      headers: request.headers,
    });
    
    // Create a response that clears all auth-related cookies
    const logoutResponse = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });
    
    // Clear all possible auth cookies
    const cookiesToClear = [
      'better-auth.session_token',
      'better-auth.csrf_token', 
      'session',
      'authToken',
      'better-auth.session',
      'auth-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      logoutResponse.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return logoutResponse;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to logout',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
