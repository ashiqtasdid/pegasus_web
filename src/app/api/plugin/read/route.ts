import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';
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

    const body = await request.json();
    const { userId, pluginName } = body;

    if (!userId || !pluginName) {
      return NextResponse.json({
        projectExists: false,
        error: 'userId and pluginName are required'
      }, { status: 400 });
    }

    // Security check: ensure user can only access their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        projectExists: false,
        error: 'Access denied: You can only access your own plugin files'
      }, { status: 403 });
    }

    // Get plugin from database
    const plugin = await pluginService.getPluginByName(userId, pluginName);

    if (!plugin || !plugin.files || plugin.files.length === 0) {
      return NextResponse.json({
        projectExists: false,
        message: 'No project files found'
      });
    }

    // Convert our database format to the expected format
    const projectData = {
      projectExists: true,
      pluginProject: {
        projectName: plugin.pluginName,
        minecraftVersion: plugin.minecraftVersion || '1.20.1',
        dependencies: plugin.dependencies || [],
        files: plugin.files.map(file => ({
          path: file.path,
          content: file.content
        }))
      }
    };

    return NextResponse.json(projectData);

  } catch (error) {
    console.error('Error reading plugin files:', error);
    return NextResponse.json({
      projectExists: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
