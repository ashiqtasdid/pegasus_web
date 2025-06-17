import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pluginName } = body;

    if (!userId || !pluginName) {
      return NextResponse.json({
        success: false,
        error: 'userId and pluginName are required'
      }, { status: 400 });
    }    // Check if external backend is configured
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    console.log('Plugin files API called:', { userId, pluginName, apiBase });
    
    if (!apiBase || apiBase.includes('your-backend-service')) {
      console.error('Backend API not configured');
      return NextResponse.json({
        success: false,
        error: 'Backend API not configured. Please set NEXT_PUBLIC_API_BASE_URL environment variable.'
      }, { status: 503 });
    }    try {
      // Forward request to external backend
      const backendUrl = `${apiBase}/plugin/files`;
      console.log('Calling backend API:', backendUrl);
      
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          pluginName
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', backendResponse.status);
      const data = await backendResponse.json();
      console.log('Backend response data:', data);

      if (backendResponse.ok) {
        // Return the backend response as-is (should match the expected format)
        return NextResponse.json(data);
      } else {
        console.error('Backend API error:', backendResponse.status, data);
        return NextResponse.json({
          success: false,
          error: data.error || `Backend API returned ${backendResponse.status}: ${backendResponse.statusText}`
        }, { status: backendResponse.status });
      }

    } catch (error) {
      console.error('Error calling backend API:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Request timeout - backend took too long to respond'
        }, { status: 504 });
      }

      return NextResponse.json({
        success: false,
        error: `Failed to connect to backend service: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Plugin files API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
