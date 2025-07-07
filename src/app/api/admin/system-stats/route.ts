import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    try {
      // Get database stats
      const authDb = client.db("pegasus_auth");
      const ticketsDb = client.db("pegasus_tickets");
      const pluginsDb = client.db("pegasus_dev");
      
      // Get user count
      const totalUsers = await authDb.collection('user').countDocuments();
      
      // Get ticket count
      const totalTickets = await ticketsDb.collection('tickets').countDocuments();
      
      // Get plugin count (count unique plugin names)
      const uniquePlugins = await pluginsDb.collection('projects').distinct('pluginName');
      const totalPlugins = uniquePlugins.length;
      
      // Get server count (if you have a servers collection)
      let activeServers = 0;
      try {
        const serversDb = client.db("pegasus_servers");
        activeServers = await serversDb.collection('servers').countDocuments({ status: 'active' });
      } catch (serversError) {
        // If servers collection doesn't exist, use a default value
        console.warn('Servers collection not found:', serversError);
        activeServers = 0;
      }
      
      // Get system stats (you can implement actual monitoring later)
      const systemStats = {
        totalUsers,
        totalTickets,
        activeServers,
        totalPlugins,
        systemUptime: "99.9%", // You can implement real uptime monitoring
        memoryUsage: Math.floor(Math.random() * 30) + 40, // Simulated for now
        cpuUsage: Math.floor(Math.random() * 20) + 10, // Simulated for now
        diskUsage: Math.floor(Math.random() * 40) + 30, // Simulated for now
        lastUpdated: new Date().toISOString()
      };

      return NextResponse.json(systemStats);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
