import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST() {
  try {
    // This endpoint helps clean up expired and orphaned sessions
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const sessionCollection = db.collection('session');
    
    // Delete all expired sessions
    const expiredResult = await sessionCollection.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    // Get count of remaining active sessions
    const activeSessionsCount = await sessionCollection.countDocuments({
      expiresAt: { $gt: new Date() }
    });
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      expiredSessionsDeleted: expiredResult.deletedCount,
      activeSessionsRemaining: activeSessionsCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
