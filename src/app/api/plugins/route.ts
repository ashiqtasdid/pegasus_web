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
    };    console.log('Creating plugin with data:', {
      userId,
      pluginName,
      filesCount: files?.length || 0,
      files: files?.map((f: { path: string; content: string; type: string }) => ({ 
        path: f.path, 
        contentLength: f.content?.length || 0 
      })) || []
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
    }    
    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';
    
    console.log('Plugins list API called for userId:', userId);

    // Connect to MongoDB and get user's plugins
    const { MongoClient } = await import('mongodb');
    const MONGODB_URI = process.env.MONGODB_URI!;
    const client = new MongoClient(MONGODB_URI);
    
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('plugins');
      
      // Find all plugins for the user
      const plugins = await collection.find({
        userId: userId,
        isActive: true
      }).sort({ updatedAt: -1 }).toArray();
      
      console.log('Found', plugins.length, 'plugins for user:', userId);
      
      // Transform to match expected format
      const transformedPlugins = plugins.map(plugin => ({
        _id: plugin._id.toString(),
        userId: plugin.userId,
        pluginName: plugin.pluginName,
        description: plugin.description,
        minecraftVersion: plugin.minecraftVersion,
        dependencies: plugin.dependencies,
        files: plugin.files || [],
        metadata: plugin.metadata,
        createdAt: plugin.createdAt,
        updatedAt: plugin.updatedAt,
        isActive: plugin.isActive
      }));

      return NextResponse.json({
        success: true,
        plugins: transformedPlugins,
        count: transformedPlugins.length,
        userId
      });
      
    } catch (dbError) {
      console.error('MongoDB error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error occurred'
      }, { status: 500 });
    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
