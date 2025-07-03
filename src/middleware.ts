import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth pages, API routes, and static assets
  if (
    pathname.startsWith('/auth') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/banned') // Allow access to banned page
  ) {
    return NextResponse.next();
  }

  // Check for session cookie for all other routes
  const sessionCookie = getSessionCookie(request);

  // If no session cookie, redirect to auth
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // For now, let the request through
  // Ban checking will be handled by individual pages/components
  // since Edge Runtime doesn't support MongoDB's Node.js dependencies
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
