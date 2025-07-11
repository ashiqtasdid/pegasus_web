import { NextResponse } from 'next/server';

/**
 * CORS configuration for API routes
 */
export const corsConfig = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Add CORS headers to a response
 */
export function withCors(response: NextResponse): NextResponse {
  Object.entries(corsConfig).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleCorsPreflightRequest(): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  return withCors(response);
}

/**
 * Create a JSON response with CORS headers
 */
export function corsResponse(data: unknown, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return withCors(response);
}

/**
 * Get allowed origins from environment
 */
export function getAllowedOrigins(): string[] {
  const origins = process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
  return origins.split(',').map(origin => origin.trim());
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}
