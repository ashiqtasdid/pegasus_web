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
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - installHook (development files)
     * - .js.map (source maps)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.js\\.map|installHook).*)',
  ]
};
