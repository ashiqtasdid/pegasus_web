import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth pages, API routes, static assets, and the root landing page
  if (
    pathname === '/' || // Allow access to landing page
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/banned') // Allow access to banned page
  ) {
    return NextResponse.next();
  }

  // Simple cookie-based check (Edge Runtime compatible)
  // This only checks for session cookie presence, not validity
  // Full session validation happens in server components and API routes
  const sessionCookie = request.cookies.get('better-auth.session_token');
  
  if (!sessionCookie || !sessionCookie.value) {
    console.log('No session cookie found, redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Cookie exists, allow through - full validation happens server-side
  // Server components and API routes will handle proper session validation
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
