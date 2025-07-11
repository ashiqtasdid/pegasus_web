import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { auth } from '@/lib/auth';
import { withCors, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS() {
  return handleCorsPreflightRequest();
}

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = process.env.DEVELOP === 'true';
    
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!isDevelopmentMode && !session) {
      return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const body = await request.json();
    const { prompt, pluginName, name, userId, email, autoCompile = true, complexity = 5 } = body;

    // Validate that the user can only generate plugins for themselves
    const sessionUserId = session?.user?.id || 'testuser';
    const actualUserId = isDevelopmentMode ? (userId || sessionUserId) : sessionUserId;
    
    if (!isDevelopmentMode && userId && userId !== sessionUserId) {
      return withCors(NextResponse.json({ 
        error: 'Access denied: You can only generate plugins for your own account' 
      }, { status: 403 }));
    }

    if (!prompt) {
      return withCors(NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      ));
    }

    // Call external API for plugin generation
    const externalApiUrl = getExternalApiUrl();
    console.log('🔗 External API URL configured:', externalApiUrl);
    console.log('🚀 Making request to:', `${externalApiUrl}/plugin/generate`);
    console.log('📝 Request data:', { prompt, userId: actualUserId, name: pluginName || name, autoCompile, complexity });
    
    const response = await fetch(`${externalApiUrl}/plugin/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userId: actualUserId,
        email: email || session?.user?.email,
        name: pluginName || name,
        autoCompile,
        complexity
      })
    });

    console.log('📡 External API response status:', response.status);
    console.log('📡 External API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ External API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error details:', errorText);
      return withCors(NextResponse.json(
        { success: false, error: `Failed to generate plugin from external API: ${response.status} ${response.statusText}` },
        { status: response.status }
      ));
    }

    // Parse JSON response from external API which should include both result and tokenUsage
    const apiResponse = await response.json();
    console.log('Plugin generation successful for user:', actualUserId);
    console.log('API Response keys:', Object.keys(apiResponse));
    
    // Return the complete response including token usage analytics
    return withCors(NextResponse.json(apiResponse));

  } catch (error) {
    console.error('Plugin generation error:', error);
    return withCors(NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    ));
  }
}
