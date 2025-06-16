import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';
import { auth } from '@/lib/auth';

interface BackendFile {
  path: string;
  content: string;
}

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

    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    const body = await request.json();
    const { pluginName } = body;

    if (!pluginName) {
      return NextResponse.json(
        { error: 'Plugin name is required' },
        { status: 400 }
      );
    }

    // Get the plugin from database
    const plugin = await pluginService.getPluginByName(userId, pluginName);
    
    if (!plugin) {
      return NextResponse.json(
        { error: 'Plugin not found' },
        { status: 404 }
      );
    }    // Fetch latest files from the backend plugin generation service
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      console.log('Environment check:');
    console.log('- NEXT_PUBLIC_API_BASE_URL:', apiBase);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    if (!apiBase) {
      return NextResponse.json(
        { error: 'Backend API URL not configured. Please set NEXT_PUBLIC_API_BASE_URL in .env.local' },
        { status: 500 }
      );
    }
    
    try {
      console.log(`Fetching files from backend: ${apiBase}/plugin/read for plugin: ${pluginName}`);
        const response = await fetch(`${apiBase}/plugin/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ userId: 'testuser', pluginName }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', response.status);
      console.log('Backend response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Backend error response:', errorText);
        return NextResponse.json(
          { error: `Backend API error: ${response.status} - ${errorText}` },
          { status: 500 }
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.log('Backend returned non-JSON response:', responseText.substring(0, 200));
        return NextResponse.json(
          { error: 'Backend API returned non-JSON response' },
          { status: 500 }
        );
      }      const projectData = await response.json();
      console.log('Backend project data:', projectData);
      console.log('Files received from backend:', projectData.pluginProject?.files?.length);
      
      // Log first file for debugging
      if (projectData.pluginProject?.files?.length > 0) {
        console.log('Sample file structure:', {
          path: projectData.pluginProject.files[0].path,
          contentLength: projectData.pluginProject.files[0].content?.length || 0,
          hasContent: !!projectData.pluginProject.files[0].content
        });
      }
      
      if (projectData.projectExists && projectData.pluginProject?.files) {        // Convert backend files to our format
        const updatedFiles = projectData.pluginProject.files.map((file: BackendFile) => ({
          path: file.path,
          content: file.content,
          type: file.path.endsWith('.java') ? 'java' : 
                file.path.endsWith('.yml') ? 'yaml' : 
                file.path.endsWith('.xml') ? 'xml' : 
                file.path.endsWith('.json') ? 'json' : 'text'
        }));          console.log('Converted files for database:', updatedFiles.map((f: BackendFile & { type: string }) => ({
          path: f.path,
          type: f.type,
          contentLength: f.content?.length || 0
        })));

        // Update plugin in database with latest files
        const updatedPlugin = await pluginService.updatePlugin(plugin._id?.toString() || '', {
          files: updatedFiles,
          updatedAt: new Date()
        });

        console.log('Plugin updated in database with', updatedFiles.length, 'files');

        return NextResponse.json({
          success: true,
          plugin: updatedPlugin,
          filesCount: updatedFiles.length,
          message: 'Plugin files synchronized successfully'
        });
      } else {
        return NextResponse.json(
          { error: 'No files found in backend for this plugin' },
          { status: 404 }
        );
      }    } catch (backendError) {
      console.error('Backend fetch error:', backendError);
      
      // Check if it's a timeout or connection error
      if (backendError instanceof Error && 
          (backendError.name === 'AbortError' || 
           backendError.message.includes('fetch failed') ||
           backendError.message.includes('ECONNREFUSED'))) {
        
        // Fallback: return current files from database with a warning
        console.log('Backend unavailable, returning current files from database');
        return NextResponse.json({
          success: true,
          plugin: plugin,
          filesCount: plugin.files?.length || 0,
          message: 'Backend unavailable - showing current files from database'
        });
      }
      
      return NextResponse.json(
        { error: `Backend service error: ${backendError instanceof Error ? backendError.message : 'Unknown error'}` },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Error syncing plugin files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET(request: NextRequest) {
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

    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    const url = new URL(request.url);
    const pluginName = url.searchParams.get('pluginName');

    if (!pluginName) {
      return NextResponse.json(
        { error: 'Plugin name is required' },
        { status: 400 }
      );
    }

    // Get the plugin from database
    const plugin = await pluginService.getPluginByName(userId, pluginName);
    
    if (!plugin) {
      return NextResponse.json(
        { error: 'Plugin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plugin: {
        id: plugin._id,
        name: plugin.pluginName,
        lastSync: plugin.updatedAt,
        filesCount: plugin.files?.length || 0,
        files: plugin.files?.map(f => ({
          path: f.path,
          type: f.type,
          size: f.content?.length || 0
        })) || []
      }
    });

  } catch (error) {
    console.error('Error getting plugin sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
