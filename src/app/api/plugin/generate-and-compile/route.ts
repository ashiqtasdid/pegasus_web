import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, userId, name, autoCompile = true, complexity = 5 } = body;

    if (!prompt || !userId) {
      return NextResponse.json(
        { success: false, error: "Prompt and userId are required" },
        { status: 400 }
      );
    }

    // Call external API for plugin generation and compilation
    const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001';
    const response = await fetch(`${externalApiUrl}/plugin/generate-and-compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userId,
        name,
        compile: autoCompile,
        complexity
      })
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to generate and compile plugin from external API" },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Generate and compile plugin error:', error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
