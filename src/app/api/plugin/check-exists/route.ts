import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pluginName } = body;

    if (!userId || !pluginName) {
      return NextResponse.json(
        { success: false, error: "UserId and pluginName are required" },
        { status: 400 }
      );
    }

    // Call external API to check if plugin exists
    const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
    const response = await fetch(`${externalApiUrl}/plugin/check-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        pluginName
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to check plugin existence from external API" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Check plugin exists error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
