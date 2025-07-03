import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');
    const clientApiKey = searchParams.get('clientApiKey');

    if (!file) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    if (!clientApiKey) {
      return NextResponse.json(
        { error: 'Client API key is required for file operations' },
        { status: 400 }
      );
    }

    const externalApiUrl = getExternalApiUrl();
    const url = `${externalApiUrl}/pterodactyl/server/${serverId}/files/contents?file=${encodeURIComponent(file)}&clientApiKey=${encodeURIComponent(clientApiKey)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to read file: ${response.status}` },
        { status: response.status }
      );
    }

    const content = await response.text();
    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });

  } catch (error) {
    console.error('File read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
