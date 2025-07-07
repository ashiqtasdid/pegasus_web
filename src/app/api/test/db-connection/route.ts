import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    console.log('Connected to MongoDB successfully');
    
    // Check test database
    const testDb = client.db("test");
    const testCollections = await testDb.listCollections().toArray();
    console.log('Collections in test database:', testCollections.map(col => col.name));
    
    // Check if there are any plugins in test database
    const testPluginsCollection = testDb.collection('plugins');
    const testPluginCount = await testPluginsCollection.countDocuments({});
    console.log('Total plugins in test.plugins:', testPluginCount);
    
    if (testPluginCount > 0) {
      // Find the specific plugin in test database
      const plugin = await testPluginsCollection.findOne({ 
        userId: "6866de3e6195a41293a4f7ec",
        pluginName: "Greet"
      });
      
      if (plugin) {
        console.log('Plugin found in test database!');
        return NextResponse.json({
          success: true,
          message: 'Plugin found in test database',
          database: 'test',
          plugin: {
            id: plugin._id,
            userId: plugin.userId,
            pluginName: plugin.pluginName,
            hasJarFile: !!plugin.jarFile,
            jarFileName: plugin.jarFileName,
            jarFileSize: plugin.jarFileSize,
            jarCompiledAt: plugin.jarCompiledAt,
            jarFileType: plugin.jarFile ? typeof plugin.jarFile : 'null'
          }
        });
      }
    }
    
    // Also check other databases for plugins collections
    const databases = ['pegasus_tickets'];
    const results: Record<string, {
      collections: string[];
      hasPlugins: boolean;
      pluginCount?: number;
      samplePlugin?: {
        id: string;
        userId: string;
        pluginName: string;
        hasJarFile: boolean;
      } | null;
    }> = {};
    
    for (const dbName of databases) {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      results[dbName] = {
        collections: collections.map(col => col.name),
        hasPlugins: collections.some(col => col.name === 'plugins')
      };
      
      if (results[dbName].hasPlugins) {
        const pluginsCollection = db.collection('plugins');
        const count = await pluginsCollection.countDocuments({});
        results[dbName].pluginCount = count;
        
        if (count > 0) {
          const samplePlugin = await pluginsCollection.findOne({});
          results[dbName].samplePlugin = samplePlugin ? {
            id: samplePlugin._id?.toString() || '',
            userId: samplePlugin.userId || '',
            pluginName: samplePlugin.pluginName || '',
            hasJarFile: !!samplePlugin.jarFile
          } : null;
        }
      }
    }
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      message: 'Database exploration complete',
      testDatabase: {
        collections: testCollections.map(col => col.name),
        pluginCount: testPluginCount
      },
      otherDatabases: results
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
