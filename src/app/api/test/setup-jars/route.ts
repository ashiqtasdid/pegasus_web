import { NextResponse } from 'next/server';
import { jarStorageService } from '@/lib/jar-storage-service';

export async function POST() {
  try {
    console.log('Testing JAR download functionality...');
    
    // Check for existing plugins with JAR files in the database
    const existingPlugins = await jarStorageService.getUserJarFiles('6866de3e6195a41293a4f7ec');
    
    console.log('Found existing plugins:', existingPlugins.length);
    
    // Get JAR info for each plugin
    const jarInfos = [];
    for (const plugin of existingPlugins) {
      const jarInfo = await jarStorageService.getJarInfo(plugin.userId, plugin.pluginName);
      jarInfos.push({
        userId: plugin.userId,
        pluginName: plugin.pluginName,
        info: jarInfo
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'JAR download functionality test complete!',
      existingPlugins: existingPlugins.length,
      jars: jarInfos
    });
    
  } catch (error) {
    console.error('Error testing JAR download functionality:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
