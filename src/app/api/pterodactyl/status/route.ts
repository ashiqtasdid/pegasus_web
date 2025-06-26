import { NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function GET() {
  try {
    // This endpoint provides public status information about Pterodactyl configuration
    // No authentication required as it's for system health checking
    
    // Call external API to get Pterodactyl status
    const externalApiUrl = getExternalApiUrl();
    console.log('Calling external API:', `${externalApiUrl}/pterodactyl/status`);
    
    const response = await fetch(`${externalApiUrl}/pterodactyl/status`, {
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
        { 
          configured: false,
          error: `Failed to get Pterodactyl status from external API: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();
    console.log('Pterodactyl status retrieved successfully');
    
    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('Get Pterodactyl status error:', error);
    return NextResponse.json(
      { 
        configured: false,
        error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
