// Unified External Download API
// Uses the local API proxy to avoid CORS issues

const API_BASE_URL = '/api/plugin';
console.log('Using local API proxy for downloads');

export interface JarFileInfo {
  available: boolean;
  fileName?: string;
  fileSize?: number;
  lastModified?: string;
  checksum?: string;
  downloadUrl?: string;
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    minecraftVersion?: string;
    dependencies?: string[];
  };
}

export interface Plugin {
  _id: string;
  userId: string;
  pluginName: string;
  description: string;
  minecraftVersion: string;
  jarFileName?: string;
  jarFileSize?: number;
  jarCompiledAt?: string;
  lastSyncedAt: string;
  totalFiles: number;
  totalSize: number;
}

// Unified External API Download Functions

/**
 * Check JAR availability using local API proxy
 */
export async function getJarInfo(userId: string, pluginName: string): Promise<JarFileInfo> {
  const url = `${API_BASE_URL}/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}?info=true`;
  
  console.log(`Fetching JAR info from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to get JAR info: HTTP ${response.status} - ${errorText}`);
    throw new Error(`Failed to get JAR info: HTTP ${response.status} - ${errorText}`);
  }
  
  try {
    const result = await response.json();
    return result;
  } catch (parseError) {
    console.error('Failed to parse JAR info JSON response:', parseError);
    throw new Error(`Invalid JSON response from JAR info API: ${parseError}`);
  }
}

/**
 * Check if JAR exists using local API proxy
 */
export async function checkJarExists(userId: string, pluginName: string): Promise<boolean> {
  try {
    const info = await getJarInfo(userId, pluginName);
    return info.available;
  } catch (error) {
    console.warn(`Failed to check JAR existence for ${pluginName}:`, error);
    return false;
  }
}

/**
 * Download JAR using local API proxy
 */
export async function downloadJar(userId: string, pluginName: string): Promise<Blob> {
  const url = `${API_BASE_URL}/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
  
  console.log(`Downloading JAR from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/octet-stream, application/java-archive, */*',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to download JAR: HTTP ${response.status} - ${errorText}`);
    throw new Error(`Failed to download JAR: HTTP ${response.status} - ${errorText}`);
  }
  
  return response.blob();
}

/**
 * Get JAR info with fallback (for compatibility)
 */
export async function getJarInfoWithFallback(userId: string, pluginName: string): Promise<JarFileInfo> {
  try {
    return await getJarInfo(userId, pluginName);
  } catch (error) {
    console.warn(`Failed to get JAR info for ${pluginName}:`, error);
    // Return fallback info
    return {
      available: false,
      fileName: `${pluginName}.jar`,
      fileSize: 0,
      lastModified: new Date().toISOString(),
      downloadUrl: `${API_BASE_URL}/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      metadata: {
        version: '1.0.0',
        author: 'Unknown',
        description: 'No description available',
        minecraftVersion: '1.20.1',
        dependencies: []
      }
    };
  }
}

/**
 * Get multiple JAR infos using external API
 */
export async function getMultipleJarInfos(userId: string, pluginNames: string[]): Promise<Record<string, JarFileInfo>> {
  const results = await Promise.allSettled(
    pluginNames.map(pluginName => getJarInfoWithFallback(userId, pluginName))
  );
  
  const jarInfos: Record<string, JarFileInfo> = {};
  
  results.forEach((result, index) => {
    const pluginName = pluginNames[index];
    if (result.status === 'fulfilled') {
      jarInfos[pluginName] = result.value;
    } else {
      jarInfos[pluginName] = {
        available: false,
        fileName: `${pluginName}.jar`,
        fileSize: 0,
        lastModified: new Date().toISOString(),
        downloadUrl: `${API_BASE_URL}/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
        metadata: {
          version: '1.0.0',
          author: 'Unknown',
          description: 'No description available',
          minecraftVersion: '1.20.1',
          dependencies: []
        }
      };
    }
  });
  
  return jarInfos;
}

// Plugin list functions (these still use internal API since they're not download-related)
export async function getPluginList(userId: string): Promise<Plugin[]> {
  const response = await fetch(`/api/plugin/list/${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to get plugin list');
  return response.json();
}

export async function getPluginDetails(userId: string, pluginName: string): Promise<Plugin> {
  const response = await fetch(`/api/plugin/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
  if (!response.ok) throw new Error('Failed to get plugin details');
  return response.json();
}

// Legacy functions removed:
// - downloadJarSecure (not needed with external API)
// - generateDownloadToken (not needed with external API)
// - syncJarToDatabase (not needed with external API)
