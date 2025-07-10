import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get current session info
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check database state
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const sessionCollection = db.collection('session');
    
    let dbSessionExists = false;
    let dbSessionExpired = false;
    let totalActiveSessions = 0;
    let userActiveSessions = 0;
    
    if (session?.session?.id) {
      const dbSession = await sessionCollection.findOne({
        id: session.session.id
      });
      
      dbSessionExists = !!dbSession;
      dbSessionExpired = dbSession ? dbSession.expiresAt < new Date() : false;
      
      if (session.user?.id) {
        userActiveSessions = await sessionCollection.countDocuments({
          userId: session.user.id,
          expiresAt: { $gt: new Date() }
        });
      }
    }
    
    totalActiveSessions = await sessionCollection.countDocuments({
      expiresAt: { $gt: new Date() }
    });
    
    await client.close();

    return NextResponse.json({
      sessionFromAuth: {
        hasSession: !!session?.session,
        sessionId: session?.session?.id || null,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null
      },
      sessionFromDatabase: {
        exists: dbSessionExists,
        expired: dbSessionExpired
      },
      sessionCounts: {
        totalActiveSessions,
        userActiveSessions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      // Clean up expired sessions
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db("pegasus_auth");
      
      const sessionCollection = db.collection('session');
      const result = await sessionCollection.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      await client.close();
      
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        action: 'cleanup'
      });
    }

    if (action === 'invalidate-user-sessions') {
      // Invalidate all sessions for current user
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user?.id) {
        return NextResponse.json({
          success: false,
          error: 'No user session found'
        }, { status: 401 });
      }

      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db("pegasus_auth");
      
      const sessionCollection = db.collection('session');
      const result = await sessionCollection.deleteMany({
        userId: session.user.id
      });
      
      await client.close();
      
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        action: 'invalidate-user-sessions'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });

  } catch (error) {
    console.error('Session debug action error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
