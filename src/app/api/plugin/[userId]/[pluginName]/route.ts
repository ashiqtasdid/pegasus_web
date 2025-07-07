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

    // Security check: ensure user can only access their own plugins
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only access your own plugins'
      }, { status: 403 });
    }

    // Get plugin details from backend API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        error: 'Backend API not configured'
      }, { status: 500 });
    }

    const backendUrl = `${apiBase}/plugin/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Getting plugin details from backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (response.ok) {
        const plugin = await response.json();
        
        // Normalize the plugin data for JAR dashboard
        const normalizedPlugin = {
          _id: plugin._id || plugin.id || `${userId}-${pluginName}`,
          userId: plugin.userId || userId,
          pluginName: plugin.pluginName || pluginName,
          description: plugin.description || 'No description available',
          minecraftVersion: plugin.minecraftVersion || '1.20.1',
          jarFileName: plugin.jarFileName || `${pluginName}.jar`,
          jarFileSize: plugin.jarFileSize || 0,
          jarCompiledAt: plugin.jarCompiledAt || plugin.lastModified || new Date().toISOString(),
          lastSyncedAt: plugin.lastSyncedAt || plugin.updatedAt || new Date().toISOString(),
          totalFiles: plugin.totalFiles || (plugin.files ? plugin.files.length : 0),
          totalSize: plugin.totalSize || 0,
          createdAt: plugin.createdAt || new Date().toISOString(),
          updatedAt: plugin.updatedAt || new Date().toISOString(),
          // Additional metadata
          metadata: plugin.metadata || {},
          dependencies: plugin.dependencies || [],
          files: plugin.files || []
        };

        return NextResponse.json(normalizedPlugin);
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({
          error: errorData.error || `Plugin not found or backend returned ${response.status}`
        }, { status: response.status });
      }
    } catch (fetchError) {
      console.error('Error getting plugin details:', fetchError);
      
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
    console.error('Error getting plugin details:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
