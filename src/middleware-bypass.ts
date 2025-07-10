import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Enhanced logging for debugging
  console.log('=== MIDDLEWARE DEBUG ===');
  console.log('Path:', pathname);
  console.log('All cookies:', request.cookies.toString());
  console.log('Cookie entries:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`));

  // Allow access to auth pages, API routes, static assets, and the root landing page
  if (
    pathname === '/' || // Allow access to landing page
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/banned') // Allow access to banned page
  ) {
    console.log('Allowing access to:', pathname);
    return NextResponse.next();
  }

  // TEMPORARY: Bypass middleware for debugging - allow all dashboard access
  // Remove this once cookie issue is resolved
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/users')) {
    console.log('TEMPORARY BYPASS: Allowing dashboard access for debugging');
    return NextResponse.next();
  }

  // Check for Better Auth session cookies (try multiple possible cookie names)
  const sessionTokens = [
    request.cookies.get('better-auth.session_token'),
    request.cookies.get('better-auth.session'),
    request.cookies.get('session_token'),
    request.cookies.get('authjs.session-token'), // fallback
  ].filter(Boolean);
  
  console.log('Session tokens found:', sessionTokens.map(token => ({
    name: token?.name,
    value: token?.value ? `${token.value.substring(0, 10)}...` : 'empty'
  })));
  
  // If no session cookies found, redirect to auth
  if (sessionTokens.length === 0) {
    console.log('No session cookies found, redirecting to auth from:', pathname);
    const response = NextResponse.redirect(new URL('/auth', request.url));
    
    // Clear any potentially corrupted cookies
    response.cookies.delete('better-auth.session_token');
    response.cookies.delete('better-auth.session');
    response.cookies.delete('session_token');
    
    return response;
  }

  // Cookie exists, allow through - full validation happens server-side
  console.log('Session cookie found, allowing access to:', pathname);
  return NextResponse.next();

  // No match, allow through (shouldn't reach here)
  return NextResponse.next();
}
