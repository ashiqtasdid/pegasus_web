import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function POST(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const body = await request.json();
    const { signal, clientApiKey } = body;

    if (!signal || !['start', 'stop', 'restart', 'kill'].includes(signal)) {
      return NextResponse.json(
        { error: 'Invalid power signal. Must be: start, stop, restart, or kill' },
        { status: 400 }
      );
    }

    const externalApiUrl = getExternalApiUrl();
    let url = `${externalApiUrl}/pterodactyl/server/${serverId}/power`;
    
    if (clientApiKey) {
      url += `?clientApiKey=${encodeURIComponent(clientApiKey)}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signal })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to ${signal} server: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server power control error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
