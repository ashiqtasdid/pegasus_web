import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    let plugin;
    
    // Check if id is a valid ObjectId (24 character hex string)
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      plugin = await pluginService.getPlugin(id);
    } else {
      // If not ObjectId, treat as plugin name
      plugin = await pluginService.getPluginByName(userId, id);
    }

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    // Check if user owns this plugin (skip in development mode)
    if (!isDevelopmentMode && plugin.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      plugin,
    });

  } catch (error) {
    console.error('Error fetching plugin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    const body = await request.json();
    
    // Get existing plugin to verify ownership
    const existingPlugin = await pluginService.getPlugin(id);
    if (!existingPlugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    if (!isDevelopmentMode && existingPlugin.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update plugin
    const updatedPlugin = await pluginService.updatePlugin(id, body);

    return NextResponse.json({
      success: true,
      plugin: updatedPlugin,
      message: 'Plugin updated successfully'
    });

  } catch (error) {
    console.error('Error updating plugin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use session user ID or default test user ID for development
    const userId = session?.user?.id || 'testuser';

    // Get existing plugin to verify ownership
    const existingPlugin = await pluginService.getPlugin(id);
    if (!existingPlugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    if (!isDevelopmentMode && existingPlugin.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete plugin (soft delete)
    const success = await pluginService.deletePlugin(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Plugin deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete plugin' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting plugin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
