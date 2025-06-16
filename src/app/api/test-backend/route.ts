import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase || apiBase.includes('your-backend-service')) {
      return NextResponse.json({
        error: 'Backend URL not configured',
        configured: false,
        url: apiBase || 'Not set'
      });
    }

    console.log(`Testing connection to: ${apiBase}`);
    
    // Test basic connectivity
    const response = await fetch(`${apiBase}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        status: response.status,
        backend_url: apiBase,
        backend_response: data
      });
    } else {
      return NextResponse.json({
        success: false,
        status: response.status,
        backend_url: apiBase,
        error: `Backend returned ${response.status}`
      });
    }

  } catch (error) {
    console.error('Backend test error:', error);
    return NextResponse.json({
      success: false,
      backend_url: process.env.NEXT_PUBLIC_API_BASE_URL,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
