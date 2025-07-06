import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userId, pluginName, options = {} } = body;

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only generate tokens for their own plugins
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only generate tokens for your own plugins'
      }, { status: 403 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expirationHours = options.expirationHours || 24;
    const maxDownloads = options.maxDownloads || 1;
    const expiresAt = new Date(Date.now() + (expirationHours * 60 * 60 * 1000));

    // In a real implementation, you would store this token in a database
    // For now, we'll create a simple token that encodes the information
    const tokenData = {
      token,
      userId,
      pluginName,
      expiresAt: expiresAt.toISOString(),
      maxDownloads,
      downloadCount: 0,
      ipRestrictions: options.ipRestrictions || []
    };

    // In production, store this in Redis or database
    // For now, we'll encode it in the token itself (not recommended for production)
    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    return NextResponse.json({
      success: true,
      token: encodedToken,
      expiresAt: expiresAt.toISOString(),
      maxDownloads
    });

  } catch (error) {
    console.error('Error generating download token:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
