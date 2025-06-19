import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/user/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user profile data
    // In a real app, you'd fetch additional profile data from your database
    const userProfile = {
      ...session.user,
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        browserNotifications: false,
        autoSave: true,
        codeCompletion: true,
        language: 'en',
        timezone: 'UTC'
      },
      stats: {
        pluginsCreated: 0,
        totalLines: 0,
        lastActivity: new Date().toISOString()
      }
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Validate and sanitize the updates
    const allowedFields = [
      'name', 'bio', 'location', 'website', 'company', 'phone',
      'githubUsername', 'twitterUsername', 'profileImage',
      'isPublic', 'showEmail', 'showLastSeen', 'preferences'
    ];
    
    const validUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value;
      }
    }

    // In a real app, you'd update the user in your database here
    // For now, we'll simulate a successful update
    console.log('Profile update request for user:', session.user.id, validUpdates);

    // TODO: Implement actual database update
    // await updateUserProfile(session.user.id, validUpdates);

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      updates: validUpdates
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Full profile replacement (alternative to PATCH)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();
    
    // Validate required fields
    if (!profileData.name || !profileData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // In a real app, you'd replace the user profile in your database here
    console.log('Full profile update for user:', session.user.id, profileData);

    // TODO: Implement actual database update
    // await replaceUserProfile(session.user.id, profileData);

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
