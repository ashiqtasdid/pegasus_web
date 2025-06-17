import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, WithId, Document } from 'mongodb';

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
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'testuser';

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
