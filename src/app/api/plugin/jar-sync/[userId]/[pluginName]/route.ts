import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PUT(
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

    // Security check: ensure user can only sync their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only sync your own plugin files'
      }, { status: 403 });
    }

    // Forward sync request to backend API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        success: false,
        error: 'Backend API not configured'
      }, { status: 500 });
    }

    const backendUrl = `${apiBase}/plugin/jar-sync/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Syncing JAR to database via backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(60000) // 60 second timeout for sync operations
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: data.success || true,
          message: data.message || 'JAR file synced successfully',
          fileSize: data.fileSize || 0,
          lastModified: data.lastModified || new Date().toISOString(),
          checksum: data.checksum || null
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          success: false,
          error: errorData.error || `Backend returned ${response.status}`
        }, { status: response.status });
      }
    } catch (fetchError) {
      console.error('Error syncing JAR to database:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          success: false,
          error: 'Sync operation timed out'
        }, { status: 408 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Backend unavailable'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error syncing JAR to database:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
