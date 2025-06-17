import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; pluginName: string } }
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

    const { userId, pluginName } = params;
    
    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
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
    
    console.log('Downloading JAR from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(60000) // 60 second timeout for file downloads
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

    // Return the file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/java-archive',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading JAR file:', error);
    
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
