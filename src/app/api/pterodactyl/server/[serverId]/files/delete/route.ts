import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function POST(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const body = await request.json();
    const { root, files, clientApiKey } = body;

    if (!root || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Root directory and files array are required' },
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
    const response = await fetch(`${externalApiUrl}/pterodactyl/server/${serverId}/files/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ root, files, clientApiKey })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete files: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('File delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
