const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
console.log(API_BASE_URL)
export interface JarFileInfo {
  available: boolean;
  fileName?: string;
  fileSize?: number;
  lastModified?: string;
  checksum?: string;
  downloadUrl?: string;
  secureDownloadUrl?: string;
  metadata?: {
    version?: string;
    author?: string;
    description?: string;
    minecraftVersion?: string;
    dependencies?: string[];
  };
}

export interface DownloadToken {
  token: string;
  expiresAt: string;
  downloadUrl: string;
  maxDownloads: number;
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

// JAR Information
export async function getJarInfo(userId: string, pluginName: string): Promise<JarFileInfo> {
  const response = await fetch(`/api/plugin/download-info/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
  if (!response.ok) throw new Error('Failed to get JAR info');
  return response.json();
}

export async function checkJarExists(userId: string, pluginName: string): Promise<boolean> {
  const response = await fetch(`/api/plugin/jar-exists/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
  if (!response.ok) throw new Error('Failed to check JAR existence');
  const data = await response.json();
  return data.exists;
}

// JAR Downloads
export async function downloadJar(userId: string, pluginName: string): Promise<Blob> {
  const response = await fetch(`/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
  if (!response.ok) throw new Error('Failed to download JAR');
  return response.blob();
}

export async function downloadJarSecure(userId: string, pluginName: string, token: string): Promise<Blob> {
  const response = await fetch(`/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('Failed to download JAR securely');
  return response.blob();
}

export async function generateDownloadToken(userId: string, pluginName: string): Promise<DownloadToken> {
  const response = await fetch(`/api/plugin/download/token/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to generate download token');
  return response.json();
}

// JAR Management
export async function syncJarToDatabase(userId: string, pluginName: string): Promise<boolean> {
  const response = await fetch(`/api/plugin/jar-sync/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('Failed to sync JAR');
  const data = await response.json();
  return data.success;
}

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

// Enhanced JAR operations with better error handling
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
      checksum: undefined,
      downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
      secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
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

// Batch operations
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
        checksum: undefined,
        downloadUrl: `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
        secureDownloadUrl: `/api/plugin/download/secure/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`,
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
