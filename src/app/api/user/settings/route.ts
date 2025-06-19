import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET /api/user/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default settings - in a real app, fetch from database
    const userSettings = {
      theme: 'dark',
      emailNotifications: true,
      browserNotifications: false,
      autoSave: true,
      codeCompletion: true,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      editorFontSize: 14,
      editorFontFamily: 'Monaco, Consolas, monospace',
      editorTabSize: 2,
      editorWordWrap: true,
      editorMinimap: true,
      editorLineNumbers: true,
      chatAutoScroll: true,
      chatSoundEnabled: false,
      pluginAutoReload: false,
      debugMode: false,
      analyticsEnabled: true,
      crashReporting: true,
      betaFeatures: false,
    };

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    // Validate settings
    const allowedSettings = [
      'theme', 'emailNotifications', 'browserNotifications', 'autoSave',
      'codeCompletion', 'language', 'timezone', 'editorFontSize',
      'editorFontFamily', 'editorTabSize', 'editorWordWrap',
      'editorMinimap', 'editorLineNumbers', 'chatAutoScroll',
      'chatSoundEnabled', 'pluginAutoReload', 'debugMode',
      'analyticsEnabled', 'crashReporting', 'betaFeatures'
    ];
    
    const validUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedSettings.includes(key)) {
        // Type validation
        switch (key) {
          case 'theme':
            if (['light', 'dark', 'system'].includes(value as string)) {
              validUpdates[key] = value;
            }
            break;
          case 'language':
            if (typeof value === 'string' && value.length <= 10) {
              validUpdates[key] = value;
            }
            break;
          case 'editorFontSize':
            if (typeof value === 'number' && value >= 8 && value <= 32) {
              validUpdates[key] = value;
            }
            break;
          case 'editorTabSize':
            if (typeof value === 'number' && value >= 1 && value <= 8) {
              validUpdates[key] = value;
            }
            break;
          case 'timezone':
            if (typeof value === 'string' && value.length <= 50) {
              validUpdates[key] = value;
            }
            break;
          case 'editorFontFamily':
            if (typeof value === 'string' && value.length <= 100) {
              validUpdates[key] = value;
            }
            break;
          default:
            // Boolean settings
            if (typeof value === 'boolean') {
              validUpdates[key] = value;
            }
            break;
        }
      }
    }

    console.log('Settings update for user:', session.user.id, validUpdates);

    // TODO: Implement actual database update
    // await updateUserSettings(session.user.id, validUpdates);

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully',
      updates: validUpdates
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
