import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!isDevelopmentMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, pluginName, userId } = body;

    // Validate that the user can only generate code for themselves
    const sessionUserId = session?.user?.id || 'testuser';
    const actualUserId = isDevelopmentMode ? (userId || sessionUserId) : sessionUserId;
    
    if (!isDevelopmentMode && userId && userId !== sessionUserId) {
      return NextResponse.json({ 
        error: 'Access denied: You can only generate code for your own account' 
      }, { status: 403 });
    }

    if (!prompt || !pluginName) {
      return NextResponse.json(
        { success: false, error: "Prompt and pluginName are required" },
        { status: 400 }
      );
    }

    // Call external API for code generation (without compilation)
    const externalApiUrl = getExternalApiUrl();
    console.log('Calling external API:', `${externalApiUrl}/ai/generate-code`);
    console.log('Request data:', { prompt, pluginName, userId: actualUserId });
    
    const response = await fetch(`${externalApiUrl}/ai/generate-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        pluginName,
        userId: actualUserId
      })
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json(
        { success: false, error: `Failed to generate code from external API: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();
    console.log('Code generation successful for user:', actualUserId);
    
    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
