import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { jarStorageService } from '@/lib/jar-storage-service';

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

    console.log('Checking JAR availability in database:', { userId, pluginName });
    
    // Check JAR availability directly in MongoDB
    const jarInfo = await jarStorageService.getJarInfo(userId, pluginName);
    
    if (!jarInfo.available) {
      console.log('JAR file not found in database:', { userId, pluginName });
      return NextResponse.json({
        available: false,
        error: 'JAR file not found. Please compile your plugin first.',
        downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
        secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
        metadata: {
          version: '1.0.0',
          author: 'Unknown',
          description: 'No description available',
          minecraftVersion: '1.20.1',
          dependencies: []
        }
      }, { status: 404 });
    }

    console.log('JAR file found in database:', jarInfo);

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
      available: true,
      jarFile: jarInfo.fileName || `${pluginName}.jar`,
      fileSize: jarInfo.fileSize || 0,
      lastModified: jarInfo.lastModified || new Date().toISOString(),
      checksum: jarInfo.checksum || null,
      downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      metadata: {
        version: jarInfo.metadata?.version || '1.0.0',
        author: jarInfo.metadata?.author || 'Unknown',
        description: jarInfo.metadata?.description || 'No description available',
        minecraftVersion: jarInfo.metadata?.minecraftVersion || '1.20.1',
        dependencies: jarInfo.metadata?.dependencies || []
      }
    };

    // Generate temporary token if requested
    if (includeToken) {
      const tokenData = {
        userId,
        pluginName,
        expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiry
        maxDownloads: 5
      };
      
      const encodedToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');
      enhancedResponse.temporaryToken = encodedToken;
    }

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('Error checking JAR availability:', error);
    
    const { userId, pluginName } = await params;
    return NextResponse.json({
      available: false,
      error: 'Failed to check JAR availability',
      downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      metadata: {
        version: '1.0.0',
        author: 'Unknown',
        description: 'No description available',
        minecraftVersion: '1.20.1',
        dependencies: []
      }
    }, { status: 500 });
  }
}
