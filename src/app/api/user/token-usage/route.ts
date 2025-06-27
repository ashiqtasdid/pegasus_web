import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Try to forward to external API first
    const externalApiUrl = getExternalApiUrl();
    
    try {
      const response = await fetch(`${externalApiUrl}/user/${userId}/token-usage`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Backend not available, using mock data for token usage:', error);
    }

    // Fallback to mock data when backend is not available
    const mockTokenUsage = {
      userId,
      totalTokensUsed: 0,
      tokensThisMonth: 0,
      tokensToday: 0,
      tokensRemaining: 10000, // Default allocation
      monthlyLimit: 10000,
      usage: {
        daily: [],
        monthly: {
          current: 0,
          previous: 0
        }
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(mockTokenUsage);
  } catch (error) {
    console.error('Error in token usage endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token usage data' },
      { status: 500 }
    );
  }
}
