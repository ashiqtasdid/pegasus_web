import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get the current session first
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    let sessionCleared = false;

    // If there's a session, invalidate it properly
    if (session?.session) {
      // Step 1: Use Better Auth's signOut
      await auth.api.signOut({
        headers: request.headers,
      });

      // Step 2: Manually invalidate the session in the database
      try {
        const client = new MongoClient(process.env.MONGODB_URI!);
        await client.connect();
        const db = client.db("pegasus_auth");
        
        // Delete the session from the database
        const sessionCollection = db.collection('session');
        const deleteResult = await sessionCollection.deleteOne({
          id: session.session.id
        });
        
        // Also delete any expired sessions for this user to clean up
        await sessionCollection.deleteMany({
          userId: session.user.id,
          expiresAt: { $lt: new Date() }
        });
        
        await client.close();
        
        sessionCleared = deleteResult.deletedCount > 0;
        console.log(`Session invalidation: deleted ${deleteResult.deletedCount} sessions`);
        
      } catch (dbError) {
        console.error('Database session cleanup error:', dbError);
        // Continue anyway - cookie clearing is still important
      }
    }
    
    // Create a response that clears all possible auth-related cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully',
      sessionCleared,
      sessionId: session?.session?.id || null,
      timestamp: new Date().toISOString()
    });
    
    // List of all possible auth cookie names to clear
    const cookiesToClear = [
      'better-auth.session_token',
      'better-auth.csrf_token', 
      'better-auth.session',
      'better-auth.token',
      'session',
      'authToken',
      'auth-token',
      'sessionToken',
      '__Secure-authjs.session-token',
      '__Host-authjs.csrf-token',
      'auth.session-token',
      'next-auth.session-token',
      'next-auth.csrf-token'
    ];
    
    // Clear all auth cookies with various configurations
    cookiesToClear.forEach(cookieName => {
      // Clear for root domain
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Also clear for subdomain if any
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : 'localhost',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
  } catch (error) {
    console.error('Complete logout error:', error);
    
    // Even if signOut fails, still clear cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared (with errors)',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    // Force clear cookies anyway
    const cookiesToClear = [
      'better-auth.session_token',
      'better-auth.csrf_token', 
      'better-auth.session',
      'session',
      'authToken'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    return response;
  }
}
