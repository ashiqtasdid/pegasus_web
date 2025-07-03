import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { MongoClient, ObjectId } from 'mongodb';

// Get user admin status and management capabilities
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = session.user;

    return NextResponse.json({
      userId: user.id,
      isAdmin: user.isAdmin || false,
      canManageUsers: user.isAdmin || false,
      canManageTokens: user.isAdmin || false,
      canBanUsers: user.isAdmin || false,
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user admin status (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = session.user;

    // Only admins can modify admin status
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, isAdmin } = await request.json();

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Update user admin status directly in MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    // Try to update by ObjectId first, then by string id
    let result;
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Attempting to update admin status for ObjectId: ${userId}`);
      result = await db.collection('user').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            isAdmin,
            updatedAt: new Date()
          }
        }
      );
      console.log(`ObjectId admin update result:`, result);
    }
    
    // If not found and not an ObjectId, try updating by id field
    if (!result || result.matchedCount === 0) {
      console.log(`Attempting to update admin status for string ID: ${userId}`);
      result = await db.collection('user').updateOne(
        { id: userId },
        { 
          $set: { 
            isAdmin,
            updatedAt: new Date()
          }
        }
      );
      console.log(`String ID admin update result:`, result);
    }

    await client.close();

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User admin status updated to ${isAdmin}`,
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
