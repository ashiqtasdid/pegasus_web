import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await context.params;

    // Validate that the user can only access their own server info
    const sessionUserId = session?.user?.id || 'testuser';
    const actualUserId = isDevelopmentMode ? userId : sessionUserId;
    
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({ 
        error: 'Access denied: You can only access your own server information' 
      }, { status: 403 });
    }

    if (!actualUserId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Call external API to get user servers
    const externalApiUrl = getExternalApiUrl();
    console.log('Calling external API:', `${externalApiUrl}/pterodactyl/user-servers/${actualUserId}`);
    
    const response = await fetch(`${externalApiUrl}/pterodactyl/user-servers/${actualUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json(
        { success: false, error: `Failed to get user servers from external API: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();
    console.log('User servers retrieved successfully for user:', actualUserId);
    
    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Get user servers error:', error);
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
