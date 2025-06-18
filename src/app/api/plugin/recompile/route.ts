import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, pluginName, maxFixAttempts = 5 } = await request.json();
    
    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Forward request to backend API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    const backendUrl = `${apiBase}/plugin/recompile`;
    
    console.log('Forwarding recompile request to backend:', backendUrl);
    console.log('Request data:', { userId, pluginName, maxFixAttempts });
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        pluginName,
        maxFixAttempts
      }),
      signal: AbortSignal.timeout(120000) // 2 minute timeout for compilation
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Backend recompile error:', response.status, data);
      return NextResponse.json(
        { 
          success: false,
          error: data.error || `Backend returned ${response.status}`,
          details: data
        },
        { status: response.status }
      );
    }

    console.log('Recompile response from backend:', data);
    
    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error('Error in recompile API:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Recompilation timed out. The process may still be running in the background.',
          timeout: true
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during recompilation'
      },
      { status: 500 }
    );
  }
}
