import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 1];
    
    console.log(`Attempting to fetch automation status from: ${BACKEND_URL}/pterodactyl/automation-status/${userId}`);
    console.log(`Environment BACKEND_URL: ${process.env.BACKEND_URL}`);
    console.log(`Resolved BACKEND_URL: ${BACKEND_URL}`);
    
    const response = await fetch(`${BACKEND_URL}/pterodactyl/automation-status/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000),
    });

    console.log(`Backend response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Backend returned non-JSON response:', textResponse.substring(0, 200));
      return NextResponse.json(
        { success: false, error: 'Backend service unavailable or returned invalid response' },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Automation status API error:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('BACKEND_URL used:', BACKEND_URL);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Backend communication failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: BACKEND_URL,
        errorType: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}
