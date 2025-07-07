import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jarStorageService } from '@/lib/jar-storage-service';

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

    // Security check: ensure user can only download their own files
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only download your own plugin files'
      }, { status: 403 });
    }

    console.log('Downloading JAR from database:', { userId, pluginName });
    
    // Get JAR file directly from MongoDB
    const jarFile = await jarStorageService.downloadJarFile(userId, pluginName);
    
    if (!jarFile) {
      console.log('JAR file not found in database:', { userId, pluginName });
      return NextResponse.json(
        { error: 'JAR file not found. Please compile your plugin first.' },
        { status: 404 }
      );
    }

    console.log('JAR file found in database:', {
      fileName: jarFile.fileName,
      fileSize: jarFile.fileSize,
      contentType: jarFile.contentType
    });

    // Return the file with enhanced headers for download support
    return new NextResponse(jarFile.buffer, {
      status: 200,
      headers: {
        'Content-Type': jarFile.contentType,
        'Content-Disposition': `attachment; filename="${jarFile.fileName}"`,
        'Content-Length': jarFile.fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Buffer.from(jarFile.fileName).toString('base64')}"`,
        // Add CORS headers for better browser compatibility
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Disposition',
      },
    });

  } catch (error) {
    console.error('Error downloading JAR file from database:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Download timeout - file too large or database unavailable' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
