import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pluginName, username } = body;

    if (!pluginName || !username) {
      return NextResponse.json(
        { success: false, error: "Plugin name and username are required" },
        { status: 400 }
      );
    }

    // Call external API to remove user plugin
    const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
    const response = await fetch(`${externalApiUrl}/chat/remove-user-plugin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pluginName,
        username
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to remove user plugin from external API" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Remove user plugin error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
