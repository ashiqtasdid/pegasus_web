import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { MongoClient, ObjectId } from 'mongodb';
import { getUserTokenInfo } from '@/lib/user-management';

// Get user token limits and usage
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

    // If no userId provided, return current user's token limits
    const targetUserId = userId || session.user.id;

    // Only admins can check other users' token limits
    if (userId && userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get token information from the new structure
    const tokenInfo = await getUserTokenInfo(targetUserId);

    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: targetUserId,
      tokensUsed: tokenInfo.tokensUsed,
      tokenLimit: tokenInfo.tokenLimit,
      tokensRemaining: tokenInfo.tokensRemaining,
      usagePercentage: tokenInfo.usagePercentage,
      canUseTokens: tokenInfo.canUseTokens,
    });
  } catch (error) {
    console.error('Error checking token limits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user token limits (admin only)
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

    // Only admins can modify token limits
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { userId, tokenLimit, tokensUsed, action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'setLimit' && typeof tokenLimit === 'number' && tokenLimit >= 0) {
      // Update token limit in pegasus_auth.user collection
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db("pegasus_auth");
      
      // Try to find user by ObjectId first, then by string id
      let userUpdateResult;
      if (ObjectId.isValid(userId)) {
        userUpdateResult = await db.collection('user').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { tokenLimit, updatedAt: new Date() } }
        );
      }
      
      // If not found and not an ObjectId, try finding by id field
      if (!userUpdateResult || userUpdateResult.matchedCount === 0) {
        userUpdateResult = await db.collection('user').updateOne(
          { id: userId },
          { $set: { tokenLimit, updatedAt: new Date() } }
        );
      }

      await client.close();

      if (userUpdateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Token limit set to ${tokenLimit} successfully`,
        data: { tokenLimit },
      });
    } else if (action === 'setUsage' && typeof tokensUsed === 'number' && tokensUsed >= 0) {
      // Update token usage in test.user_token_usage collection
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const testDb = client.db("test");
      
      await testDb.collection('user_token_usage').updateOne(
        { userId },
        { $set: { totalTokens: tokensUsed } },
        { upsert: true }
      );

      await client.close();

      return NextResponse.json({
        success: true,
        message: `Token usage set to ${tokensUsed} successfully`,
        data: { tokensUsed },
      });
    } else if (action === 'resetUsage') {
      // Reset token usage in test.user_token_usage collection
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const testDb = client.db("test");
      
      await testDb.collection('user_token_usage').updateOne(
        { userId },
        { $set: { totalTokens: 0 } },
        { upsert: true }
      );

      await client.close();

      return NextResponse.json({
        success: true,
        message: `Token usage reset successfully`,
        data: { tokensUsed: 0 },
      });
    } else if (action === 'addTokens' && typeof tokenLimit === 'number' && tokenLimit > 0) {
      // Add tokens to current limit in pegasus_auth.user collection
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db("pegasus_auth");
      
      // Try to find user by ObjectId first, then by string id
      let user = null;
      if (ObjectId.isValid(userId)) {
        user = await db.collection('user').findOne({ _id: new ObjectId(userId) });
      }
      
      // If not found and not an ObjectId, try finding by id field
      if (!user) {
        user = await db.collection('user').findOne({ id: userId });
      }
      
      if (!user) {
        await client.close();
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      const currentLimit = user.tokenLimit || 100000;
      const newLimit = currentLimit + tokenLimit;
      
      // Update using the same pattern
      let result;
      if (ObjectId.isValid(userId)) {
        result = await db.collection('user').updateOne(
          { _id: new ObjectId(userId) },
          { $set: { tokenLimit: newLimit, updatedAt: new Date() } }
        );
      }
      
      // If not found and not an ObjectId, try updating by id field
      if (!result || result.matchedCount === 0) {
        result = await db.collection('user').updateOne(
          { id: userId },
          { $set: { tokenLimit: newLimit, updatedAt: new Date() } }
        );
      }

      await client.close();

      return NextResponse.json({
        success: true,
        message: `Added ${tokenLimit} tokens to limit successfully`,
        data: { tokenLimit: newLimit },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action or parameters' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating token limits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Increment token usage (for internal use)
export async function PATCH(request: NextRequest) {
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

    const { userId, tokensToAdd } = await request.json();
    const targetUserId = userId || session.user.id;

    // Users can only increment their own tokens, admins can increment anyone's
    if (targetUserId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Can only update your own token usage' },
        { status: 403 }
      );
    }

    if (!tokensToAdd || typeof tokensToAdd !== 'number' || tokensToAdd <= 0) {
      return NextResponse.json(
        { error: 'Invalid tokens to add' },
        { status: 400 }
      );
    }

    // Get current token info using the new structure
    const tokenInfo = await getUserTokenInfo(targetUserId);
    
    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const newUsage = tokenInfo.tokensUsed + tokensToAdd;

    // Check if user would exceed limit
    if (newUsage > tokenInfo.tokenLimit) {
      return NextResponse.json(
        { 
          error: 'Token limit exceeded',
          currentUsage: tokenInfo.tokensUsed,
          tokenLimit: tokenInfo.tokenLimit,
          tokensToAdd,
          wouldExceedBy: newUsage - tokenInfo.tokenLimit
        },
        { status: 429 }
      );
    }

    // Update token usage in test.user_token_usage collection
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const testDb = client.db("test");
    
    await testDb.collection('user_token_usage').updateOne(
      { userId: targetUserId },
      { 
        $set: {
          totalTokens: newUsage,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    await client.close();

    return NextResponse.json({
      success: true,
      message: 'Token usage updated successfully',
      data: {
        userId: targetUserId,
        previousUsage: tokenInfo.tokensUsed,
        tokensAdded: tokensToAdd,
        newUsage,
        tokenLimit: tokenInfo.tokenLimit,
        tokensRemaining: tokenInfo.tokenLimit - newUsage,
      }
    });
  } catch (error) {
    console.error('Error incrementing token usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
