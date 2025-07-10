import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log('=== BETTER AUTH COOKIE SYNC ===');
    
    // Try to use Better Auth's own cookie setting mechanism
    const response = await auth.handler(request);
    
    console.log('Better Auth handler response status:', response.status);
    console.log('Better Auth handler response headers:', Object.fromEntries(response.headers.entries()));
    
    // If successful, return the response with Better Auth's cookies
    if (response.ok) {
      // Clone the response to modify it
      const data = await response.json();
      const newResponse = NextResponse.json({
        success: true,
        message: 'Better Auth cookie sync completed',
        data: data,
        debug: {
          originalStatus: response.status,
          cookiesSet: response.headers.getSetCookie?.() || 'No cookies header',
        }
      });
      
      // Copy all cookies from Better Auth response
      const cookies = response.headers.getSetCookie?.();
      if (cookies) {
        cookies.forEach(cookie => {
          newResponse.headers.append('Set-Cookie', cookie);
        });
      }
      
      return newResponse;
    } else {
      return NextResponse.json({
        error: 'Better Auth handler failed',
        status: response.status,
        statusText: response.statusText
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('Better Auth cookie sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync via Better Auth',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
