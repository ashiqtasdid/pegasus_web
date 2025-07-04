import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { serverId } = await params;
    const { searchParams } = new URL(request.url);
    const clientApiKey = searchParams.get('clientApiKey');

    const externalApiUrl = getExternalApiUrl();
    let url = `${externalApiUrl}/pterodactyl/server/${serverId}/resources`;
    
    if (clientApiKey) {
      url += `?clientApiKey=${encodeURIComponent(clientApiKey)}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch server resources: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server resources error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
