import { NextResponse } from 'next/server';

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const backendUrl = process.env.BACKEND_URL;
  const testUrl = backendUrl || apiBase;
  
  try {
    console.log(`NEXT_PUBLIC_API_BASE_URL: ${apiBase}`);
    console.log(`BACKEND_URL: ${backendUrl}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    
    if (!testUrl || testUrl.includes('your-backend-service')) {
      return NextResponse.json({
        error: 'Backend URL not configured',
        configured: false,
        NEXT_PUBLIC_API_BASE_URL: apiBase || 'Not set',
        BACKEND_URL: backendUrl || 'Not set'
      });
    }

    console.log(`Testing connection to: ${testUrl}`);
    
    // Test basic connectivity
    const response = await fetch(`${testUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log(`Backend response status: ${response.status}`);

    if (response.ok) {
      const data = await response.text(); // Use text() first to avoid JSON parsing errors
      return NextResponse.json({
        success: true,
        status: response.status,
        backend_url: testUrl,
        backend_response: data.substring(0, 200)
      });
    } else {
      return NextResponse.json({
        success: false,
        status: response.status,
        backend_url: testUrl,
        error: `Backend returned ${response.status}`
      });
    }

  } catch (error) {
    console.error('Backend test error:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json({
      success: false,
      backend_url: testUrl || 'Not configured',
      BACKEND_URL: process.env.BACKEND_URL || 'Not set',
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown'
    }, { status: 500 });
  }
}
