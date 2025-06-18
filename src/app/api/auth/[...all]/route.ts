import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handlers = toNextJsHandler(auth);

// Get the allowed origin based on environment and request
const getAllowedOrigin = (request?: NextRequest) => {
  if (process.env.NODE_ENV === 'production') {
    return 'http://37.114.41.124:3000';
  }
    // In development, use the request's origin if available, fallback to localhost:3001
  if (request) {
    const origin = request.headers.get('origin');
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return origin;
    }
  }
  
  return 'http://localhost:3001';
};

// Add CORS headers to response
const addCorsHeaders = (response: Response) => {
  const allowedOrigin = getAllowedOrigin();
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
};

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);
  return addCorsHeaders(response);
}

export async function POST(request: NextRequest) {
  const response = await handlers.POST(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const allowedOrigin = getAllowedOrigin();
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
