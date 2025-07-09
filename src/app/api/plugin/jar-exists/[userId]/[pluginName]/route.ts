import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getJarInfo } from '@/lib/jar-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; pluginName: string }> }
) {
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

    const { userId, pluginName } = await params;

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only check their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only check your own plugin files'
      }, { status: 403 });
    }

    console.log('Checking JAR existence using external API:', { userId, pluginName });
    
    // Check JAR existence using external API
    try {
      const jarInfo = await getJarInfo(userId, pluginName);
      const exists = jarInfo.available;
      
      console.log('JAR existence check result:', { userId, pluginName, exists });

      return NextResponse.json({ exists });
    } catch {
      // If the external API call fails, assume the JAR doesn't exist
      console.log('JAR not found via external API:', { userId, pluginName });
      return NextResponse.json({ exists: false });
    }

  } catch (error) {
    console.error('Error checking JAR existence:', error);
    
    return NextResponse.json({
      exists: false,
      error: 'Failed to check JAR existence'
    }, { status: 500 });
  }
}
