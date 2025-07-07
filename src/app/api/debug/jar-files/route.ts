import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    const db = client.db("pegasus_auth");
    const jarCollection = db.collection('jar_files');
    
    // Get all jar files
    const jarFiles = await jarCollection.find({}).toArray();
    
    const result = {
      count: jarFiles.length,
      jarFiles: jarFiles.map(jar => {
        const { jarData, ...rest } = jar;
        return {
          ...rest,
          hasJarData: !!jarData,
          jarDataSize: jarData ? jarData.length : 0
        };
      })
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('JAR files debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
