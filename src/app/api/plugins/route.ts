import { NextRequest, NextResponse } from 'next/server';
import { pluginService, CreatePluginData } from '@/lib/plugin-service';
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
    }    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';
    const userName = session?.user?.name || session?.user?.email || 'Test User';

    const body = await request.json();
    const { pluginName, description, minecraftVersion, dependencies, files, metadata } = body;

    // Validate required fields
    if (!pluginName) {
      return NextResponse.json(
        { error: 'Plugin name is required' },
        { status: 400 }
      );    }

    // Check if plugin name already exists for this user
    const nameExists = await pluginService.pluginNameExists(userId, pluginName);
    if (nameExists) {
      return NextResponse.json(
        { error: 'A plugin with this name already exists' },
        { status: 409 }
      );
    }    // Create plugin data
    const pluginData: CreatePluginData = {
      userId: userId,
      pluginName,
      description,
      minecraftVersion,
      dependencies,
      files,
      metadata: {
        author: userName,
        version: '1.0.0',
        ...metadata
      }
    };

    console.log('Creating plugin with data:', {
      userId,
      pluginName,
      filesCount: files?.length || 0,
      files: files?.map((f: any) => ({ path: f.path, contentLength: f.content?.length || 0 })) || []
    });

    // Save plugin to database
    const plugin = await pluginService.createPlugin(pluginData);

    return NextResponse.json({
      success: true,
      plugin,
      message: 'Plugin created successfully'
    });

  } catch (error) {
    console.error('Error creating plugin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    }    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    // Get user's plugins
    const plugins = await pluginService.getPluginsByUserId(userId);

    return NextResponse.json({
      success: true,
      plugins,
    });

  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
