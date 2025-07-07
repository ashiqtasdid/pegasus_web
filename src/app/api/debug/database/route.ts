import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    const db = client.db("pegasus_auth");
    
    // List all collections
    const collections = await db.listCollections().toArray();
    
    // Check plugins collection
    const pluginsCollection = db.collection('plugins');
    const pluginCount = await pluginsCollection.countDocuments();
    const samplePlugins = await pluginsCollection.find({}).limit(5).toArray();
    
    // Also check if there might be other collections with JAR data
    const results: Record<string, unknown> = {
      collections: collections.map(c => c.name),
      pluginCount,
      samplePlugins: samplePlugins.map(p => ({
        _id: p._id?.toString() || '',
        userId: p.userId || '',
        pluginName: p.pluginName || '',
        hasJarFile: !!p.jarFile,
        jarFileName: p.jarFileName || '',
        jarFileSize: p.jarFileSize || 0,
        isActive: p.isActive || false
      }))
    };
    
    // Check other possible collections
    for (const collection of collections) {
      if (collection.name !== 'plugins') {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        results[`${collection.name}_count`] = count;
        
        if (count > 0 && count < 100) {
          // Get sample documents from smaller collections
          const samples = await coll.find({}).limit(3).toArray();
          results[`${collection.name}_samples`] = samples.map(doc => {
            const { jarFile, ...rest } = doc;
            return {
              ...rest,
              hasJarFile: !!jarFile
            };
          });
        }
      }
    }
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
