import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; pluginName: string }> }
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

    const { userId, pluginName } = await params;

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only check their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only check your own plugin files'
      }, { status: 403 });
    }

    // Check backend API for JAR existence
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        exists: false,
        error: 'Backend API not configured'
      }, { status: 500 });
    }

    const backendUrl = `${apiBase}/plugin/jar-exists/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Checking JAR existence at backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          exists: data.exists || false,
          fileName: data.fileName || `${pluginName}.jar`,
          fileSize: data.fileSize || 0,
          lastModified: data.lastModified || new Date().toISOString()
        });
      } else {
        return NextResponse.json({
          exists: false,
          error: `Backend returned ${response.status}`
        });
      }
    } catch (fetchError) {
      console.error('Error checking JAR existence:', fetchError);
      return NextResponse.json({
        exists: false,
        error: 'Backend unavailable'
      });
    }

  } catch (error) {
    console.error('Error checking JAR existence:', error);
    return NextResponse.json({
      exists: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
