import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { MongoClient, ObjectId } from 'mongodb';
import { getUserTokenInfo } from '@/lib/user-management';

// Get user management dashboard data (admin only)
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

    const currentUser = session.user;

    // Only admins can access user management
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    // Build search query
    const searchQuery: Record<string, unknown> = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const totalUsers = await db.collection('user').countDocuments(searchQuery);
    
    // Get users with pagination
    const users = await db.collection('user')
      .find(searchQuery)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    await client.close();

    // Format user data for response and get token usage from new structure
    const formattedUsers = await Promise.all(users.map(async (user) => {
      // Get token info from new structure
      const tokenInfo = await getUserTokenInfo(user.id || user._id.toString());
      
      return {
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
        isBanned: user.isBanned || false,
        bannedAt: user.bannedAt || null,
        banReason: user.banReason || null,
        tokensUsed: tokenInfo?.tokensUsed || 0,
        tokenLimit: tokenInfo?.tokenLimit || 10000,
        tokensRemaining: tokenInfo?.tokensRemaining || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt || null,
      };
    }));

    // Calculate stats based on actual token usage
    const totalTokensUsed = formattedUsers.reduce((sum, user) => sum + user.tokensUsed, 0);
    const averageTokensUsed = formattedUsers.length > 0 ? totalTokensUsed / formattedUsers.length : 0;

    const statsData = {
      totalUsers,
      totalAdmins: formattedUsers.filter(user => user.isAdmin).length,
      totalBanned: formattedUsers.filter(user => user.isBanned).length,
      totalTokensUsed,
      averageTokensUsed,
    };

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        hasNext: page < Math.ceil(totalUsers / limit),
        hasPrev: page > 1,
      },
      stats: statsData,
    });
  } catch (error) {
    console.error('Error fetching user management data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk user operations (admin only)
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

    // Only admins can perform bulk operations
    if (!currentUser.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { action, userIds, data } = await request.json();

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("pegasus_auth");
    
    
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    switch (action) {
      case 'ban':
        updateData.isBanned = true;
        updateData.bannedAt = new Date();
        if (data?.banReason) {
          updateData.banReason = data.banReason;
        }
        
        // Handle ban updates individually to support both ObjectId and string id formats
        let banSuccessCount = 0;
        const banErrors = [];
        
        for (const userId of userIds) {
          try {
            let userResult;
            console.log(`Attempting to ban user: ${userId}`);
            
            // Try to find and update by ObjectId first
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
              console.log(`User ID ${userId} looks like ObjectId`);
              userResult = await db.collection('user').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
              );
              console.log(`ObjectId ban update result for ${userId}:`, userResult);
            }
            
            // If not found and not an ObjectId, try updating by id field
            if (!userResult || userResult.matchedCount === 0) {
              console.log(`Trying string ID ban update for ${userId}`);
              userResult = await db.collection('user').updateOne(
                { id: userId },
                { $set: updateData }
              );
              console.log(`String ID ban update result for ${userId}:`, userResult);
            }
            
            if (userResult && userResult.matchedCount > 0) {
              banSuccessCount++;
              console.log(`✅ Successfully banned user ${userId}`);
            } else {
              banErrors.push(`User ${userId} not found`);
              console.log(`❌ Failed to ban user ${userId} - not found`);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error banning user ${userId}:`, err);
            banErrors.push(`Error banning user ${userId}: ${errorMessage}`);
          }
        }
        
        await client.close();
        return NextResponse.json({
          success: true,
          message: `Banned ${banSuccessCount} out of ${userIds.length} users`,
          affectedUsers: banSuccessCount,
          requestedUsers: userIds.length,
          errors: banErrors.length > 0 ? banErrors : undefined,
        });
      
      case 'unban':
        updateData.isBanned = false;
        updateData.bannedAt = null;
        updateData.banReason = null;
        
        // Handle unban updates individually to support both ObjectId and string id formats
        let unbanSuccessCount = 0;
        const unbanErrors = [];
        
        for (const userId of userIds) {
          try {
            let userResult;
            console.log(`Attempting to unban user: ${userId}`);
            
            // Try to find and update by ObjectId first
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
              console.log(`User ID ${userId} looks like ObjectId`);
              userResult = await db.collection('user').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
              );
              console.log(`ObjectId unban update result for ${userId}:`, userResult);
            }
            
            // If not found and not an ObjectId, try updating by id field
            if (!userResult || userResult.matchedCount === 0) {
              console.log(`Trying string ID unban update for ${userId}`);
              userResult = await db.collection('user').updateOne(
                { id: userId },
                { $set: updateData }
              );
              console.log(`String ID unban update result for ${userId}:`, userResult);
            }
            
            if (userResult && userResult.matchedCount > 0) {
              unbanSuccessCount++;
              console.log(`✅ Successfully unbanned user ${userId}`);
            } else {
              unbanErrors.push(`User ${userId} not found`);
              console.log(`❌ Failed to unban user ${userId} - not found`);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error unbanning user ${userId}:`, err);
            unbanErrors.push(`Error unbanning user ${userId}: ${errorMessage}`);
          }
        }
        
        await client.close();
        return NextResponse.json({
          success: true,
          message: `Unbanned ${unbanSuccessCount} out of ${userIds.length} users`,
          affectedUsers: unbanSuccessCount,
          requestedUsers: userIds.length,
          errors: unbanErrors.length > 0 ? unbanErrors : undefined,
        });
      
      case 'setAdmin':
        updateData.isAdmin = true;
        
        // Handle admin updates individually to support both ObjectId and string id formats
        let setAdminSuccessCount = 0;
        const setAdminErrors = [];
        
        for (const userId of userIds) {
          try {
            let userResult;
            console.log(`Attempting to set admin for user: ${userId}`);
            
            // Try to find and update by ObjectId first
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
              userResult = await db.collection('user').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
              );
            }
            
            // If not found and not an ObjectId, try updating by id field
            if (!userResult || userResult.matchedCount === 0) {
              userResult = await db.collection('user').updateOne(
                { id: userId },
                { $set: updateData }
              );
            }
            
            if (userResult && userResult.matchedCount > 0) {
              setAdminSuccessCount++;
            } else {
              setAdminErrors.push(`User ${userId} not found`);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error setting admin for user ${userId}:`, err);
            setAdminErrors.push(`Error setting admin for user ${userId}: ${errorMessage}`);
          }
        }
        
        await client.close();
        return NextResponse.json({
          success: true,
          message: `Set admin for ${setAdminSuccessCount} out of ${userIds.length} users`,
          affectedUsers: setAdminSuccessCount,
          requestedUsers: userIds.length,
          errors: setAdminErrors.length > 0 ? setAdminErrors : undefined,
        });
      
      case 'removeAdmin':
        updateData.isAdmin = false;
        
        // Handle admin removal individually to support both ObjectId and string id formats
        let removeAdminSuccessCount = 0;
        const removeAdminErrors = [];
        
        for (const userId of userIds) {
          try {
            let userResult;
            console.log(`Attempting to remove admin for user: ${userId}`);
            
            // Try to find and update by ObjectId first
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
              userResult = await db.collection('user').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
              );
            }
            
            // If not found and not an ObjectId, try updating by id field
            if (!userResult || userResult.matchedCount === 0) {
              userResult = await db.collection('user').updateOne(
                { id: userId },
                { $set: updateData }
              );
            }
            
            if (userResult && userResult.matchedCount > 0) {
              removeAdminSuccessCount++;
            } else {
              removeAdminErrors.push(`User ${userId} not found`);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error removing admin for user ${userId}:`, err);
            removeAdminErrors.push(`Error removing admin for user ${userId}: ${errorMessage}`);
          }
        }
        
        await client.close();
        return NextResponse.json({
          success: true,
          message: `Removed admin for ${removeAdminSuccessCount} out of ${userIds.length} users`,
          affectedUsers: removeAdminSuccessCount,
          requestedUsers: userIds.length,
          errors: removeAdminErrors.length > 0 ? removeAdminErrors : undefined,
        });
      
      case 'resetTokens':
        updateData.tokensUsed = 0;
        
        // Handle token reset individually to support both ObjectId and string id formats
        let resetTokensSuccessCount = 0;
        const resetTokensErrors = [];
        
        for (const userId of userIds) {
          try {
            let userResult;
            console.log(`Attempting to reset tokens for user: ${userId}`);
            
            // Try to find and update by ObjectId first
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
              userResult = await db.collection('user').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updateData }
              );
            }
            
            // If not found and not an ObjectId, try updating by id field
            if (!userResult || userResult.matchedCount === 0) {
              userResult = await db.collection('user').updateOne(
                { id: userId },
                { $set: updateData }
              );
            }
            
            if (userResult && userResult.matchedCount > 0) {
              resetTokensSuccessCount++;
            } else {
              resetTokensErrors.push(`User ${userId} not found`);
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error(`Error resetting tokens for user ${userId}:`, err);
            resetTokensErrors.push(`Error resetting tokens for user ${userId}: ${errorMessage}`);
          }
        }
        
        await client.close();
        return NextResponse.json({
          success: true,
          message: `Reset tokens for ${resetTokensSuccessCount} out of ${userIds.length} users`,
          affectedUsers: resetTokensSuccessCount,
          requestedUsers: userIds.length,
          errors: resetTokensErrors.length > 0 ? resetTokensErrors : undefined,
        });
        break;
      
      case 'setTokenLimit':
        if (typeof data?.tokenLimit === 'number' && data.tokenLimit >= 0) {
          // Handle token limit updates individually since we need to check ObjectId vs string id
          let successCount = 0;
          const errors = [];
          
          for (const userId of userIds) {
            try {
              let userResult;
              console.log(`Attempting to update token limit for user: ${userId}`);
              
              // Try to find and update by ObjectId first
              if (userId.match(/^[0-9a-fA-F]{24}$/)) {
                console.log(`User ID ${userId} looks like ObjectId`);
                userResult = await db.collection('user').updateOne(
                  { _id: new ObjectId(userId) },
                  { $set: { tokenLimit: data.tokenLimit, updatedAt: new Date() } }
                );
                console.log(`ObjectId update result for ${userId}:`, userResult);
              }
              
              // If not found and not an ObjectId, try updating by id field
              if (!userResult || userResult.matchedCount === 0) {
                console.log(`Trying string ID update for ${userId}`);
                userResult = await db.collection('user').updateOne(
                  { id: userId },
                  { $set: { tokenLimit: data.tokenLimit, updatedAt: new Date() } }
                );
                console.log(`String ID update result for ${userId}:`, userResult);
              }
              
              if (userResult && userResult.matchedCount > 0) {
                successCount++;
                console.log(`✅ Successfully updated token limit for user ${userId}`);
              } else {
                errors.push(`User ${userId} not found`);
                console.log(`❌ Failed to update token limit for user ${userId} - not found`);
              }
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              console.error(`Error updating token limit for user ${userId}:`, err);
              errors.push(`Error updating user ${userId}: ${errorMessage}`);
            }
          }
          
          await client.close();
          return NextResponse.json({
            success: true,
            message: `Token limit updated for ${successCount} out of ${userIds.length} users`,
            affectedUsers: successCount,
            requestedUsers: userIds.length,
            errors: errors.length > 0 ? errors : undefined,
          });
        } else {
          await client.close();
          return NextResponse.json(
            { error: 'Invalid token limit' },
            { status: 400 }
          );
        }
        break;
      
      default:
        await client.close();
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing bulk user operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
