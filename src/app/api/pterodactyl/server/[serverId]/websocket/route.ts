import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { serverId } = params;
    const { searchParams } = new URL(request.url);
    const clientApiKey = searchParams.get('clientApiKey');

    if (!clientApiKey) {
      return NextResponse.json(
        { error: 'Client API key is required for WebSocket access' },
        { status: 400 }
      );
    }

    const externalApiUrl = getExternalApiUrl();
    const url = `${externalApiUrl}/pterodactyl/server/${serverId}/websocket?clientApiKey=${encodeURIComponent(clientApiKey)}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to get WebSocket auth: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('WebSocket auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
