import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { auth } from '@/lib/auth';

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } 
    
    const userId = session?.user?.id || 'testuser';
    
    console.log('Plugin stats API called for userId:', userId);

    // Connect to MongoDB and get user statistics
    const client = new MongoClient(MONGODB_URI);
    
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('plugins');
      
      // Get total plugin count for user
      const totalPlugins = await collection.countDocuments({
        userId: userId,
        isActive: true
      });
      
      // Get recent plugins (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentPlugins = await collection.find({
        userId: userId,
        isActive: true,
        createdAt: { $gte: sevenDaysAgo }
      }).sort({ createdAt: -1 }).limit(5).toArray();
      
      // Get Minecraft version distribution
      const versionAggregation = await collection.aggregate([
        { $match: { userId: userId, isActive: true } },
        { $group: { _id: '$minecraftVersion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]).toArray();
      
      const favoriteMinecraftVersions = versionAggregation.map(v => v._id).filter(Boolean);
      
      const stats = {
        totalPlugins,
        recentPlugins: recentPlugins.length,
        favoriteMinecraftVersions,
        recentPluginsList: recentPlugins.map(plugin => ({
          id: plugin._id,
          pluginName: plugin.pluginName,
          description: plugin.description,
          minecraftVersion: plugin.minecraftVersion,
          createdAt: plugin.createdAt,
          filesCount: plugin.files?.length || 0
        }))
      };

      console.log('User plugin stats:', stats);
      
      return NextResponse.json({
        success: true,
        stats,
        userId
      });
      
    } catch (dbError) {
      console.error('MongoDB error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error occurred'
      }, { status: 500 });
    } finally {
      await client.close();
    }

  } catch (error) {
    console.error('Error fetching plugin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
