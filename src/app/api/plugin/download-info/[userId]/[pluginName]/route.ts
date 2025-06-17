import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; pluginName: string } }
) {
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

    const { userId, pluginName } = params;
    
    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Check backend API for download availability
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        available: false,
        error: 'Backend API URL not configured'
      });
    }

    const backendUrl = `${apiBase}/plugin/download-info/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Checking JAR availability at backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        return NextResponse.json({
          available: false,
          error: `Backend returned ${response.status}`
        });
      }
    } catch (fetchError) {
      console.error('Error checking JAR availability:', fetchError);
      return NextResponse.json({
        available: false,
        error: 'Backend unavailable'
      });
    }

  } catch (error) {
    console.error('Error checking JAR availability:', error);
    return NextResponse.json({
      available: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
