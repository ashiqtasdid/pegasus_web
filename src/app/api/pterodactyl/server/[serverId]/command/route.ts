import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const body = await request.json();
    const { command, clientApiKey } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }

    const externalApiUrl = getExternalApiUrl();
    const response = await fetch(`${externalApiUrl}/pterodactyl/server/${serverId}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command, clientApiKey })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to send command: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server command error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
