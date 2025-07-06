import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

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
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required for secure downloads' },
        { status: 400 }
      );
    }

    // Validate token
    try {
      const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired
      if (new Date(tokenData.expiresAt) <= new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' },
          { status: 401 }
        );
      }

      // Check if token is for the correct user and plugin
      if (tokenData.userId !== userId || tokenData.pluginName !== pluginName) {
        return NextResponse.json(
          { error: 'Invalid token for this plugin' },
          { status: 401 }
        );
      }

      // Check download count
      if (tokenData.downloadCount >= tokenData.maxDownloads) {
        return NextResponse.json(
          { error: 'Token download limit exceeded' },
          { status: 401 }
        );
      }

      // Check IP restrictions if any
      if (tokenData.ipRestrictions && tokenData.ipRestrictions.length > 0) {
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        
        if (!tokenData.ipRestrictions.includes(clientIP)) {
          return NextResponse.json(
            { error: 'IP address not authorized' },
            { status: 403 }
          );
        }
      }

    } catch {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only download their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only download your own plugin files'
      }, { status: 403 });
    }

    // Forward request to backend API
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      );
    }

    const backendUrl = `${apiBase}/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Secure download from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(60000), // 60 second timeout for file downloads
      headers: {
        'Range': request.headers.get('range') || '', // Support resume downloads
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend download error:', response.status, errorText);
      return NextResponse.json(
        { error: `Download failed: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // Get the file content
    const buffer = await response.arrayBuffer();
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = `${pluginName}.jar`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Return the file with enhanced security headers
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': 'application/java-archive',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Accept-Ranges': 'bytes',
        'Content-Security-Policy': "default-src 'none'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error in secure download:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Download timeout - file too large or backend unavailable' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
