import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pluginName } = body;

    if (!userId || !pluginName) {
      return NextResponse.json({
        projectExists: false,
        error: 'userId and pluginName are required'
      }, { status: 400 });
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
