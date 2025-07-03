import { MongoClient, ObjectId } from 'mongodb';

export interface UserTokenInfo {
  userId: string;
  tokensUsed: number;
  tokenLimit: number;
  tokensRemaining: number;
  usagePercentage: number;
  canUseTokens: boolean;
}

export interface UserBanInfo {
  userId: string;
  isBanned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
}

export interface UserPermissions {
  userId: string;
  isAdmin: boolean;
  isBanned: boolean;
  canUseTokens: boolean;
  canAccessFeatures: boolean;
}

/**
 * Get user token information
 */
export async function getUserTokenInfo(userId: string): Promise<UserTokenInfo | null> {
  try {
    console.log(`Getting token info for userId: ${userId}`);
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    // Get user info with token limit from pegasus_auth database
    const pegasusAuthDb = client.db("pegasus_auth");
    
    // Try to find user by ObjectId first, then by string id
    let user = null;
    if (ObjectId.isValid(userId)) {
      console.log(`Searching for user by ObjectId: ${userId}`);
      user = await pegasusAuthDb.collection('user').findOne({ _id: new ObjectId(userId) });
      console.log('User found by ObjectId:', user ? 'Yes' : 'No');
    }
    
    // If not found and not an ObjectId, try finding by id field
    if (!user) {
      console.log(`Searching for user by id field: ${userId}`);
      user = await pegasusAuthDb.collection('user').findOne({ id: userId });
      console.log('User found by id field:', user ? 'Yes' : 'No');
    }
    
    // Get token usage from test database
    const testDb = client.db("test");
    console.log(`Searching for token usage for userId: ${userId}`);
    const tokenUsage = await testDb.collection('user_token_usage').findOne({ userId: userId });
    console.log('Token usage found:', tokenUsage ? 'Yes' : 'No');
    if (tokenUsage) {
      console.log('Token usage data:', tokenUsage);
    }
    
    await client.close();

    if (!user) {
      console.log(`User not found in pegasus_auth.user collection: ${userId}`);
      return null;
    }

    const tokensUsed = tokenUsage?.totalTokens || 0;
    const tokenLimit = user.tokenLimit || 100000; // Default 100k tokens if not set
    const tokensRemaining = Math.max(0, tokenLimit - tokensUsed);
    const isBanned = user.isBanned || false;

    console.log(`Token info for user ${userId}:`, {
      tokensUsed,
      tokenLimit,
      tokensRemaining,
      isBanned
    });

    return {
      userId,
      tokensUsed,
      tokenLimit,
      tokensRemaining,
      usagePercentage: tokenLimit > 0 ? (tokensUsed / tokenLimit) * 100 : 0,
      canUseTokens: tokensRemaining > 0 && !isBanned,
    };
  } catch (error) {
    console.error('Error getting user token info:', error);
    return null;
  }
}

/**
 * Get user ban information
 */
export async function getUserBanInfo(userId: string): Promise<UserBanInfo | null> {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const user = await db.collection('user').findOne({ id: userId });
    await client.close();

    if (!user) {
      return null;
    }

    return {
      userId,
      isBanned: user.isBanned || false,
      bannedAt: user.bannedAt || null,
      banReason: user.banReason || null,
    };
  } catch (error) {
    console.error('Error getting user ban info:', error);
    return null;
  }
}

/**
 * Get user permissions (admin status, ban status, etc.)
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const user = await db.collection('user').findOne({ id: userId });
    await client.close();

    if (!user) {
      return null;
    }

    const tokensUsed = user.tokensUsed || 0;
    const tokenLimit = user.tokenLimit || 10000;
    const tokensRemaining = Math.max(0, tokenLimit - tokensUsed);
    const isBanned = user.isBanned || false;
    const isAdmin = user.isAdmin || false;

    return {
      userId,
      isAdmin,
      isBanned,
      canUseTokens: tokensRemaining > 0 && !isBanned,
      canAccessFeatures: !isBanned,
    };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
}

/**
 * Check if user can use tokens (not banned and has tokens remaining)
 */
export async function canUserUseTokens(userId: string, tokensNeeded: number = 1): Promise<boolean> {
  try {
    const tokenInfo = await getUserTokenInfo(userId);
    if (!tokenInfo) {
      return false;
    }

    return tokenInfo.canUseTokens && tokenInfo.tokensRemaining >= tokensNeeded;
  } catch (error) {
    console.error('Error checking if user can use tokens:', error);
    return false;
  }
}

/**
 * Increment user token usage
 */
export async function incrementUserTokenUsage(userId: string, tokensToAdd: number): Promise<boolean> {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    // First check if user exists and get current usage
    const user = await db.collection('user').findOne({ id: userId });
    
    if (!user) {
      await client.close();
      return false;
    }

    const currentUsage = user.tokensUsed || 0;
    const tokenLimit = user.tokenLimit || 10000;
    const newUsage = currentUsage + tokensToAdd;

    // Check if user would exceed limit or is banned
    if (newUsage > tokenLimit || user.isBanned) {
      await client.close();
      return false;
    }

    // Update token usage
    const result = await db.collection('user').updateOne(
      { id: userId },
      { 
        $set: {
          tokensUsed: newUsage,
          updatedAt: new Date()
        }
      }
    );

    await client.close();
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error incrementing user token usage:', error);
    return false;
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const user = await db.collection('user').findOne({ id: userId });
    await client.close();

    return user?.isAdmin || false;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
}

/**
 * Check if user is banned
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    const user = await db.collection('user').findOne({ id: userId });
    await client.close();

    return user?.isBanned || false;
  } catch (error) {
    console.error('Error checking if user is banned:', error);
    return false;
  }
}

/**
 * Middleware helper to check user permissions
 */
export async function checkUserPermissions(userId: string, requiredPermissions: {
  requireAdmin?: boolean;
  requireTokens?: number;
  allowBanned?: boolean;
}): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const permissions = await getUserPermissions(userId);
    
    if (!permissions) {
      return { allowed: false, reason: 'User not found' };
    }

    if (requiredPermissions.requireAdmin && !permissions.isAdmin) {
      return { allowed: false, reason: 'Admin access required' };
    }

    if (!requiredPermissions.allowBanned && permissions.isBanned) {
      return { allowed: false, reason: 'User is banned' };
    }

    if (requiredPermissions.requireTokens) {
      const tokenInfo = await getUserTokenInfo(userId);
      if (!tokenInfo || tokenInfo.tokensRemaining < requiredPermissions.requireTokens) {
        return { allowed: false, reason: 'Insufficient tokens' };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return { allowed: false, reason: 'Internal error' };
  }
}
