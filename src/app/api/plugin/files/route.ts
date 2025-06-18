import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { auth } from '@/lib/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

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
        success: false,
        error: 'userId and pluginName are required'
      }, { status: 400 });
    }

    // Security check: ensure user can only access their own files (unless in development mode)
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied: You can only access your own plugin files'
      }, { status: 403 });
    }

    console.log('Plugin files API called:', { userId, pluginName });

    // Connect to MongoDB and fetch plugin files
    const client = new MongoClient(MONGODB_URI);
    
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('plugins'); // Adjust collection name if needed
      
      // Find the plugin document by userId and pluginName
      const plugin = await collection.findOne({
        userId: userId,
        pluginName: pluginName,
        isActive: true
      });
      
      if (plugin && plugin.files && plugin.files.length > 0) {
        console.log('Found plugin in MongoDB:', plugin.pluginName, 'with', plugin.files.length, 'files');
          // Convert MongoDB format to API format
        const files: Record<string, string> = {};
        plugin.files.forEach((file: { path: string; content: string }) => {
          files[file.path] = file.content;
        });
        
        return NextResponse.json({
          success: true,
          files,
          metadata: {
            pluginName: plugin.pluginName,
            minecraftVersion: plugin.minecraftVersion,
            dependencies: plugin.dependencies,
            totalFiles: plugin.metadata?.totalFiles || plugin.files.length,
            totalSize: plugin.metadata?.totalSize || 0,
            lastSyncedAt: plugin.metadata?.lastSyncedAt,
            updatedAt: plugin.updatedAt
          }
        });
      } else {
        console.log('Plugin not found in MongoDB or has no files');
        return NextResponse.json({
          success: false,
          error: 'Plugin not found in MongoDB'
        }, { status: 404 });
      }
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
    console.error('Plugin files API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
