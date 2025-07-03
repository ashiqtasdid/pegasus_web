import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { MongoClient, ObjectId } from 'mongodb';

// Get user ban status
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If no userId provided, return current user's ban status
    const targetUserId = userId || session.user.id;

    // Only admins can check other users' ban status
    if (userId && userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    // Try to find user by ObjectId first, then by string id
    let user = null;
    if (targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await db.collection('user').findOne({ _id: new ObjectId(targetUserId) });
    }
    
    // If not found and not an ObjectId, try finding by id field
    if (!user) {
      user = await db.collection('user').findOne({ id: targetUserId });
    }
    
    await client.close();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: targetUserId,
      isBanned: user.isBanned || false,
      bannedAt: user.bannedAt || null,
      banReason: user.banReason || null,
    });
  } catch (error) {
    console.error('Error checking ban status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user ban status (admin only)
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

    // Only admins can modify ban status
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, isBanned, banReason } = await request.json();

    if (!userId || typeof isBanned !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      isBanned,
      updatedAt: new Date()
    };

    if (isBanned) {
      updateData.bannedAt = new Date();
      if (banReason) {
        updateData.banReason = banReason;
      }
    } else {
      // When unbanning, clear ban-related fields
      updateData.bannedAt = null;
      updateData.banReason = null;
    }

    // Update user ban status directly in MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    // Try to update by ObjectId first, then by string id
    let updateResult;
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`Attempting to update ban status for ObjectId: ${userId}`);
      updateResult = await db.collection('user').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
      console.log(`ObjectId update result:`, updateResult);
    }
    
    // If not found and not an ObjectId, try updating by id field
    if (!updateResult || updateResult.matchedCount === 0) {
      console.log(`Attempting to update ban status for string ID: ${userId}`);
      updateResult = await db.collection('user').updateOne(
        { id: userId },
        { $set: updateData }
      );
      console.log(`String ID update result:`, updateResult);
    }

    await client.close();

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
      data: {
        userId,
        isBanned,
        bannedAt: updateData.bannedAt,
        banReason: updateData.banReason,
      }
    });
  } catch (error) {
    console.error('Error updating ban status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
