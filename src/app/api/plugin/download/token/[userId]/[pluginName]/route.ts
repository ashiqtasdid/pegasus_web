import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(
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

    // Security check: ensure user can only generate tokens for their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only generate download tokens for your own plugins'
      }, { status: 403 });
    }

    // Parse request body for token options
    const body = await request.json().catch(() => ({}));
    const {
      expiresIn = 5 * 60 * 1000, // 5 minutes by default
      maxDownloads = 1,
      ipRestrictions = []
    } = body;

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresIn);

    // Create token data
    const tokenData = {
      token,
      userId,
      pluginName,
      expiresAt: expiresAt.toISOString(),
      maxDownloads,
      downloadCount: 0,
      ipRestrictions,
      createdAt: new Date().toISOString(),
      createdBy: sessionUserId
    };

    // Encode token data
    const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Create download URLs
    const downloadUrl = `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}?token=${encodeURIComponent(encodedToken)}`;

    const response = {
      token: encodedToken,
      expiresAt: expiresAt.toISOString(),
      downloadUrl,
      maxDownloads,
      ipRestrictions,
      // Additional security info
      issuedAt: new Date().toISOString(),
      issuedBy: sessionUserId,
      validFor: `${Math.floor(expiresIn / 60000)} minutes`
    };

    console.log('Generated download token for:', { userId, pluginName, expiresAt });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating download token:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
