import { NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function GET() {
  try {
    const externalApiUrl = getExternalApiUrl();
    
    // Test various common API endpoints to see what's available
    const testEndpoints = [
      '/health',
      '/api/health', 
      '/plugin/generate',
      '/api/plugin/generate',
      '/'
    ];

    const results = [];
    
    for (const endpoint of testEndpoints) {
      const testUrl = `${externalApiUrl}${endpoint}`;
      console.log(`🧪 Testing endpoint: ${testUrl}`);
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout per test
        });
        
        results.push({
          endpoint,
          url: testUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          accessible: true
        });
        
      } catch (error) {
        results.push({
          endpoint,
          url: testUrl,
          error: error instanceof Error ? error.message : String(error),
          accessible: false
        });
      }
    }

    return withCors(NextResponse.json({
      externalApiUrl,
      testResults: results,
      summary: {
        totalTests: testEndpoints.length,
        successful: results.filter(r => r.accessible).length,
        failed: results.filter(r => !r.accessible).length
      }
    }));

  } catch (error) {
    console.error('🧪 API test error:', error);
    
    return withCors(NextResponse.json({
      error: 'Failed to run API tests',
      message: error instanceof Error ? error.message : String(error),
      externalApiUrl: getExternalApiUrl()
    }, { status: 500 }));
  }
}
