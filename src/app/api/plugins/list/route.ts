import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';
import { auth } from '@/lib/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

interface PluginDocument extends Document {
  userId: string;
  pluginName: string;
  description: string;
  minecraftVersion: string;
  dependencies: string[];
  files?: { path: string; content: string }[];
  metadata?: {
    totalSize?: number;
    lastSyncedAt?: Date;
    diskPath?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
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

    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get('userId');
    const sessionUserId = session?.user?.id || 'testuser';

    // Use session user ID, or validate requested user ID matches session
    const userId = requestedUserId || sessionUserId;
    
    // Security check: ensure user can only list their own plugins
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only list your own plugins'
      }, { status: 403 });
    }

    console.log('Plugin list API called for userId:', userId);

    // Connect to MongoDB and fetch plugins
    const client = new MongoClient(MONGODB_URI);
    
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('plugins');
        // Find all plugins for the user
      const plugins = await collection.find({
        userId: userId,
        isActive: true
      }).sort({ updatedAt: -1 }).toArray() as WithId<PluginDocument>[];
      
      console.log('Found', plugins.length, 'plugins in MongoDB for user:', userId);
      
      const pluginList = plugins.map((plugin: WithId<PluginDocument>) => ({
        id: plugin._id,
        pluginName: plugin.pluginName,
        description: plugin.description,
        minecraftVersion: plugin.minecraftVersion,
        dependencies: plugin.dependencies,
        filesCount: plugin.files?.length || 0,
        totalSize: plugin.metadata?.totalSize || 0,
        createdAt: plugin.createdAt,
        updatedAt: plugin.updatedAt,
        lastSyncedAt: plugin.metadata?.lastSyncedAt,
        diskPath: plugin.metadata?.diskPath
      }));
      
      return NextResponse.json({
        success: true,
        plugins: pluginList,
        count: pluginList.length
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
    console.error('Plugin list API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
