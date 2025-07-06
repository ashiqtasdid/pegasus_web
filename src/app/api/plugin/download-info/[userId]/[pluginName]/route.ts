import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; pluginName: string }> }
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

    const { userId, pluginName } = await params;
    const { searchParams } = new URL(request.url);
    const includeToken = searchParams.get('includeToken') === 'true';

    if (!userId || !pluginName) {
      return NextResponse.json(
        { error: 'userId and pluginName are required' },
        { status: 400 }
      );
    }

    // Security check: ensure user can only access their own plugin info
    const sessionUserId = session?.user?.id || 'testuser';
    if (!isDevelopmentMode && userId !== sessionUserId) {
      return NextResponse.json({
        error: 'Access denied: You can only access your own plugin information'
      }, { status: 403 });
    }

    // Check backend API for download availability
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase) {
      return NextResponse.json({
        available: false,
        error: 'Backend API not configured'
      }, { status: 500 });
    }

    const backendUrl = `${apiBase}/plugin/download-info/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
    
    console.log('Checking JAR availability at backend:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        
        // Enhanced response with additional metadata
        const enhancedResponse: {
          available: boolean;
          jarFile: string;
          fileSize: number;
          lastModified: string;
          checksum: string | null;
          downloadUrl: string;
          secureDownloadUrl: string;
          temporaryToken?: string;
          metadata: {
            version: string;
            author: string;
            description: string;
            minecraftVersion: string;
            dependencies: string[];
          };
        } = {
          available: data.available || true,
          jarFile: data.jarFile || `${pluginName}.jar`,
          fileSize: data.fileSize || 0,
          lastModified: data.lastModified || new Date().toISOString(),
          checksum: data.checksum || null,
          downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
          secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
          metadata: {
            version: data.version || '1.0.0',
            author: data.author || 'Unknown',
            description: data.description || 'No description available',
            minecraftVersion: data.minecraftVersion || '1.20.1',
            dependencies: data.dependencies || []
          }
        };

        // Generate temporary token if requested
        if (includeToken) {
          const tokenData = {
            token: crypto.randomBytes(16).toString('hex'),
            userId,
            pluginName,
            expiresAt: new Date(Date.now() + (5 * 60 * 1000)).toISOString(), // 5 minutes
            maxDownloads: 1,
            downloadCount: 0,
            ipRestrictions: []
          };

          const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');
          enhancedResponse.temporaryToken = encodedToken;
        }

        return NextResponse.json(enhancedResponse);
      } else {
        return NextResponse.json({
          available: false,
          error: `Backend returned ${response.status}`
        });
      }
    } catch (fetchError) {
      console.error('Error checking JAR availability:', fetchError);
      return NextResponse.json({
        available: false,
        error: 'Backend unavailable'
      });
    }

  } catch (error) {
    console.error('Error checking JAR availability:', error);
    return NextResponse.json({
      available: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
