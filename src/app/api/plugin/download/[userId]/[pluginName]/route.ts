import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    userId: string;
    pluginName: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId, pluginName } = params;
    
    // Get the info query parameter to check if this is an info request
    const url = new URL(request.url);
    const isInfoRequest = url.searchParams.get('info') === 'true';
    
    // Get the external API URL from environment variable
    const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.moonlitservers.com';
    
    // Construct the download URL for the external API
    const downloadUrl = `${externalApiUrl}/download?userId=${encodeURIComponent(userId)}&pluginName=${encodeURIComponent(pluginName)}${isInfoRequest ? '&info=true' : ''}`;
    
    console.log(`Proxying download request to: ${downloadUrl}`);
    
    // Make the request to the external API with proper headers
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Pegasus-Web-Proxy/1.0',
        'Accept': isInfoRequest ? 'application/json' : 'application/octet-stream',
      },
    });
    
    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `External API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // If this is an info request, return JSON
    if (isInfoRequest) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // For file downloads, stream the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const contentDisposition = response.headers.get('content-disposition') || `attachment; filename="${pluginName}.jar"`;
    
    // Create headers for the response
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': contentDisposition,
    });
    
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    
    // Stream the file data
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error('Download proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
