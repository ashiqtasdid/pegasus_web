import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    const db = client.db("pegasus_auth");
    const collection = db.collection('plugins');
    
    // Get the specific plugin document
    const plugin = await collection.findOne({ 
      userId: '6866de3e6195a41293a4f7ec',
      pluginName: 'Greet'
    });
    
    if (plugin) {
      // Check what fields exist
      const fields = Object.keys(plugin);
      console.log('Plugin fields:', fields);
      
      return NextResponse.json({
        found: true,
        fields: fields,
        hasJarFile: !!plugin.jarFile,
        jarFileType: typeof plugin.jarFile,
        jarFileName: plugin.jarFileName,
        jarFileSize: plugin.jarFileSize,
        isActive: plugin.isActive,
        // Don't return the actual jarFile data as it's binary
        pluginInfo: {
          userId: plugin.userId,
          pluginName: plugin.pluginName,
          description: plugin.description,
          isActive: plugin.isActive,
          jarCompiledAt: plugin.jarCompiledAt,
          jarFileName: plugin.jarFileName,
          jarFileSize: plugin.jarFileSize,
          jarFileChecksum: plugin.jarFileChecksum
        }
      });
    } else {
      // Check if there are any plugins for this user
      const userPlugins = await collection.find({ userId: '6866de3e6195a41293a4f7ec' }).toArray();
      
      return NextResponse.json({
        found: false,
        userPluginsCount: userPlugins.length,
        userPlugins: userPlugins.map(p => ({
          pluginName: p.pluginName,
          isActive: p.isActive,
          hasJarFile: !!p.jarFile
        }))
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
