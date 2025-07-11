import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl, getExternalApiUrls } from '@/lib/api-config';
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

    // Try multiple API URLs for Docker container communication
    const apiUrls = getExternalApiUrls();
    console.log('🔗 Available API URLs:', apiUrls);
    
    let lastError;
    let response;
    
    for (const apiUrl of apiUrls) {
      try {
        console.log(`� Attempting connection to: ${apiUrl}/plugin/generate`);
        
        response = await fetch(`${apiUrl}/plugin/generate`, {
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
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout per attempt
        });

        console.log(`📡 Response from ${apiUrl}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`✅ Successfully connected to: ${apiUrl}`);
          break; // Success! Exit the retry loop
        } else {
          console.log(`❌ HTTP error from ${apiUrl}: ${response.status}`);
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (error) {
        console.log(`❌ Connection failed to ${apiUrl}:`, error instanceof Error ? error.message : error);
        lastError = error;
        response = null; // Reset response for next iteration
      }
    }

    // If all URLs failed, return the last error
    if (!response || !response.ok) {
      const errorMessage = lastError instanceof Error ? lastError.message : 'All API endpoints failed';
      console.error('🚨 All external API URLs failed. Last error:', errorMessage);
      console.error('🚨 Tried URLs:', apiUrls);
      
      return withCors(NextResponse.json(
        { 
          success: false, 
          error: `Unable to connect to external API. Tried: ${apiUrls.join(', ')}. Last error: ${errorMessage}` 
        },
        { status: 503 }
      ));
    }

    // Parse JSON response from external API which should include both result and tokenUsage
    const apiResponse = await response.json();
    console.log('Plugin generation successful for user:', actualUserId);
    console.log('API Response keys:', Object.keys(apiResponse));
    
    // Return the complete response including token usage analytics
    return withCors(NextResponse.json(apiResponse));

  } catch (error) {
    console.error('🚨 Plugin generation error:', error);
    console.error('🚨 Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('🚨 Error message:', error instanceof Error ? error.message : String(error));
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Check if it's a network/fetch error
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        errorMessage = `Unable to connect to external API at ${getExternalApiUrl()}. Please check if the API server is running and accessible.`;
      } else {
        errorMessage = error.message;
      }
    }
    
    return withCors(NextResponse.json(
      { success: false, error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    ));
  }
}
