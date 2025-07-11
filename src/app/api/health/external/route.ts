import { NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function GET() {
  try {
    const externalApiUrl = getExternalApiUrl();
    console.log('🏥 Health check - External API URL:', externalApiUrl);

    // Test basic connectivity
    const healthUrl = `${externalApiUrl}/health`;
    console.log('🏥 Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log('🏥 Health check response status:', response.status);
    console.log('🏥 Health check response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      return withCors(NextResponse.json({
        status: 'error',
        message: `External API health check failed: ${response.status} ${response.statusText}`,
        details: errorText,
        externalApiUrl
      }, { status: 500 }));
    }

    const healthData = await response.json();
    return withCors(NextResponse.json({
      status: 'healthy',
      message: 'External API is accessible',
      externalApiUrl,
      healthData
    }));

  } catch (error) {
    console.error('🏥 Health check error:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
        errorMessage = 'Cannot reach external API - DNS resolution failed or server unreachable';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - external API server may be down';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - external API is not responding';
      } else {
        errorMessage = error.message;
      }
    }

    return withCors(NextResponse.json({
      status: 'error',
      message: 'External API health check failed',
      error: errorMessage,
      externalApiUrl: getExternalApiUrl()
    }, { status: 500 }));
  }
}
