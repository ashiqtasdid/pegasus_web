import { NextRequest, NextResponse } from 'next/server';
import { getExternalApiUrl } from '@/lib/api-config';
import { getUserTokenInfo } from '@/lib/user-management';
import { withAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await withAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetUserId = userId || authResult.user!.id;

    // Only admins can check other users' token usage
    if (userId && userId !== authResult.user!.id && !authResult.user!.isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Try to forward to external API first
    const externalApiUrl = getExternalApiUrl();
    
    try {
      const response = await fetch(`${externalApiUrl}/user/${targetUserId}/token-usage`, {
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
      console.log('Backend not available, using database data for token usage:', error);
    }

    // Fallback to database data when backend is not available
    console.log('Using database data for token usage, userId:', targetUserId);
    
    const tokenInfo = await getUserTokenInfo(targetUserId);
    
    console.log('Token info retrieved:', tokenInfo);
    
    if (!tokenInfo) {
      console.log('No token info found for user:', targetUserId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tokenUsage = {
      userId: targetUserId,
      totalTokensUsed: tokenInfo.tokensUsed,
      tokensThisMonth: tokenInfo.tokensUsed, // Simplified for now
      tokensToday: 0, // Would need daily tracking
      tokensRemaining: tokenInfo.tokensRemaining,
      monthlyLimit: tokenInfo.tokenLimit,
      usagePercentage: tokenInfo.usagePercentage,
      canUseTokens: tokenInfo.canUseTokens,
      usage: {
        daily: [],
        monthly: {
          current: tokenInfo.tokensUsed,
          previous: 0
        }
      },
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(tokenUsage);
  } catch (error) {
    console.error('Error in token usage endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token usage data' },
      { status: 500 }
    );
  }
}
