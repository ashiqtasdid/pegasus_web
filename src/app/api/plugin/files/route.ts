import { NextRequest, NextResponse } from 'next/server';
import { pluginService } from '@/lib/plugin-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pluginName } = body;

    if (!userId || !pluginName) {
      return NextResponse.json({
        success: false,
        error: 'userId and pluginName are required'
      }, { status: 400 });
    }

    console.log('Plugin files API called:', { userId, pluginName });

    // First, try to get the plugin from local database
    try {
      const plugin = await pluginService.getPluginByName(userId, pluginName);
      
      if (plugin && plugin.files && plugin.files.length > 0) {
        console.log('Found plugin in local database:', plugin.pluginName, 'with', plugin.files.length, 'files');
        
        // Convert database format to API format
        const files: Record<string, string> = {};
        plugin.files.forEach(file => {
          files[file.path] = file.content;
        });
        
        return NextResponse.json({
          success: true,
          files
        });
      } else {
        console.log('Plugin not found in local database or has no files');
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue to try external backend
    }    // If not found in database, try external backend as fallback
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (!apiBase || apiBase.includes('your-backend-service')) {
      console.error('No plugin found in database and backend API not configured');
      return NextResponse.json({
        success: false,
        error: 'Plugin not found in local database and external backend API is not configured'
      }, { status: 404 });
    }

    try {
      // Forward request to external backend
      const backendUrl = `${apiBase}/plugin/files`;
      console.log('Trying external backend:', backendUrl);
      
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          pluginName
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      console.log('Backend response status:', backendResponse.status);
      const data = await backendResponse.json();
      console.log('Backend response data:', data);

      if (backendResponse.ok) {
        // Return the backend response as-is (should match the expected format)
        return NextResponse.json(data);
      } else {
        console.error('Backend API error:', backendResponse.status, data);
        return NextResponse.json({
          success: false,
          error: data.error || `Plugin not found in database or external backend`
        }, { status: 404 });
      }

    } catch (error) {
      console.error('Error calling backend API:', error);
      
      return NextResponse.json({
        success: false,
        error: `Plugin not found in local database and external backend is unavailable`
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Plugin files API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
