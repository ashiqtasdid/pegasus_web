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
    }    // Return current files from database (no backend sync)
    console.log('Returning current files from database for plugin:', pluginName);
    console.log('Current plugin files count:', plugin.files?.length || 0);
    
    return NextResponse.json({
      success: true,
      plugin: plugin,
      filesCount: plugin.files?.length || 0,
      message: 'Plugin files retrieved from local database'
    });

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
