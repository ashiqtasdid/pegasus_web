import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkUserPermissions } from '@/lib/user-management';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireTokens?: number;
  allowBanned?: boolean;
}

/**
 * Authentication and authorization middleware
 */
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{ success: boolean; user?: AuthUser; error?: string; status?: number }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if authentication is required
    if (options.requireAuth !== false && !session) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      };
    }

    // If no session but auth not required, allow
    if (!session && options.requireAuth === false) {
      return { success: true };
    }

    const user = session!.user;

    // Check user permissions
    const permissionCheck = await checkUserPermissions(user.id, {
      requireAdmin: options.requireAdmin,
      requireTokens: options.requireTokens,
      allowBanned: options.allowBanned,
    });

    if (!permissionCheck.allowed) {
      let status = 403;
      if (permissionCheck.reason === 'User not found') {
        status = 404;
      } else if (permissionCheck.reason === 'Insufficient tokens') {
        status = 429;
      }

      return {
        success: false,
        error: permissionCheck.reason || 'Forbidden',
        status,
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500,
    };
  }
}

/**
 * Helper function to create protected API routes
 */
export function createProtectedRoute(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request, options);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 500 }
      );
    }

    return handler(request, authResult.user!);
  };
}

/**
 * Rate limiting middleware based on user token usage
 */
export async function withTokenRateLimit(
  request: NextRequest,
  tokensRequired: number = 1
): Promise<{ success: boolean; error?: string; status?: number }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      };
    }

    const permissionCheck = await checkUserPermissions(session.user.id, {
      requireTokens: tokensRequired,
      allowBanned: false,
    });

    if (!permissionCheck.allowed) {
      return {
        success: false,
        error: permissionCheck.reason || 'Token limit exceeded',
        status: 429,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in token rate limit middleware:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500,
    };
  }
}
