import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';
import { auth } from '@/lib/auth';

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

    // Get user's plugin statistics
    const stats = await pluginService.getUserPluginStats(userId);

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching plugin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
