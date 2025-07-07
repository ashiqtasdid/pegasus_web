import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only access their own plugins
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only access your own plugins'
      }, { status: 403 });
    }

    // Get plugin list from backend API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        error: 'Backend API not configured'
      }, { status: 500 });
    }

    const backendUrl = `${apiBase}/plugin/list/${encodeURIComponent(userId)}`;
    
    console.log('Getting plugin list from backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        const plugins = await response.json();
        
        // Ensure each plugin has required fields for JAR dashboard
        const normalizedPlugins = plugins.map((plugin: Record<string, unknown>) => ({
          _id: plugin._id || plugin.id || `${userId}-${plugin.pluginName}`,
          userId: plugin.userId || userId,
          pluginName: plugin.pluginName || plugin.name || 'Unknown',
          description: plugin.description || 'No description available',
          minecraftVersion: plugin.minecraftVersion || '1.20.1',
          jarFileName: plugin.jarFileName || `${plugin.pluginName || 'plugin'}.jar`,
          jarFileSize: plugin.jarFileSize || 0,
          jarCompiledAt: plugin.jarCompiledAt || plugin.lastModified || new Date().toISOString(),
          lastSyncedAt: plugin.lastSyncedAt || plugin.updatedAt || new Date().toISOString(),
          totalFiles: plugin.totalFiles || (Array.isArray(plugin.files) ? plugin.files.length : 0),
          totalSize: plugin.totalSize || 0,
          createdAt: plugin.createdAt || new Date().toISOString(),
          updatedAt: plugin.updatedAt || new Date().toISOString()
        }));

        return NextResponse.json(normalizedPlugins);
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          error: errorData.error || `Backend returned ${response.status}`
        }, { status: response.status });
      }
    } catch (fetchError) {
      console.error('Error getting plugin list:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timed out'
        }, { status: 408 });
      }
      
      return NextResponse.json({
        error: 'Backend unavailable'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Error getting plugin list:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
