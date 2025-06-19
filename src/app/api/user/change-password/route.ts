import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/user/change-password - Change user password
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
        },
        { status: 400 }
      );
    }    try {
      // Use better-auth to change password
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: request.headers,
      });

      return NextResponse.json({ 
        success: true,
        message: 'Password changed successfully'
      });
    } catch (authError: unknown) {
      console.error('Password change error:', authError);
      
      // Handle specific auth errors
      const errorMessage = (authError as Error)?.message || '';
      if (errorMessage.includes('current password')) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to change password. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
