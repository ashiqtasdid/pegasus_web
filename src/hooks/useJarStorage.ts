import { useState, useEffect, useCallback } from 'react';
import { 
  getPluginList, 
  getJarInfo, 
  getMultipleJarInfos, 
  downloadJar, 
  type Plugin, 
  type JarFileInfo 
} from '@/lib/jar-api';

export interface JarStorageState {
  plugins: Plugin[];
  jarInfos: Record<string, JarFileInfo>;
  loading: boolean;
  error: string | null;
  syncing: Set<string>;
}

export interface JarStorageActions {
  loadData: () => Promise<void>;
  refreshPlugin: (pluginName: string) => Promise<void>;
  downloadPlugin: (pluginName: string) => Promise<void>;
  refreshJarInfo: (pluginName: string) => Promise<void>;
  clearError: () => void;
}

export function useJarStorage(userId: string): JarStorageState & JarStorageActions {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [jarInfos, setJarInfos] = useState<Record<string, JarFileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get plugin list from local database
      const pluginList = await getPluginList(userId);
      setPlugins(pluginList);

      // Get JAR info for each plugin from external API
      const pluginNames = pluginList.map(p => p.pluginName);
      const jarInfoMap = await getMultipleJarInfos(userId, pluginNames);
      setJarInfos(jarInfoMap);

    } catch (error) {
      console.error('Error loading JAR storage data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshJarInfo = useCallback(async (pluginName: string) => {
    if (!userId) return;
    
    try {
      const jarInfo = await getJarInfo(userId, pluginName);
      setJarInfos(prev => ({
        ...prev,
        [pluginName]: jarInfo
      }));
    } catch (error) {
      console.error(`Failed to refresh JAR info for ${pluginName}:`, error);
      // Update with unavailable status
      setJarInfos(prev => ({
        ...prev,
        [pluginName]: {
          ...prev[pluginName],
          available: false
        }
      }));
    }
  }, [userId]);

  const downloadPlugin = useCallback(async (pluginName: string) => {
    if (!userId) return;
    
    try {
      const jarInfo = jarInfos[pluginName];
      const blob = await downloadJar(userId, pluginName);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = jarInfo?.fileName || `${pluginName}.jar`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success notification
      showNotification(`${pluginName}.jar downloaded successfully!`, 'success');
    } catch (error) {
      console.error(`Download failed for ${pluginName}:`, error);
      showNotification(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }, [userId, jarInfos]);

  const refreshPlugin = useCallback(async (pluginName: string) => {
    if (!userId) return;
    
    try {
      setSyncing(prev => new Set(prev).add(pluginName));
      
      // With external API, "refresh" means refresh the plugin info
      const jarInfo = await getJarInfo(userId, pluginName);
      setJarInfos(prev => ({
        ...prev,
        [pluginName]: jarInfo
      }));
      
      showNotification(`${pluginName} JAR info refreshed successfully!`, 'success');
    } catch (error) {
      console.error(`Refresh failed for ${pluginName}:`, error);
      showNotification(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginName);
        return newSet;
      });
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load data when userId changes
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  return {
    plugins,
    jarInfos,
    loading,
    error,
    syncing,
    loadData,
    refreshPlugin,
    downloadPlugin,
    refreshJarInfo,
    clearError
  };
}

// Utility function for showing notifications
function showNotification(message: string, type: 'success' | 'error' | 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg font-medium text-white shadow-lg ${
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Hook for managing individual JAR file information
export function useJarInfo(userId: string, pluginName: string) {
  const [jarInfo, setJarInfo] = useState<JarFileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJarInfo = useCallback(async () => {
    if (!userId || !pluginName) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const info = await getJarInfo(userId, pluginName);
      setJarInfo(info);
    } catch (error) {
      console.error(`Failed to load JAR info for ${pluginName}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to load JAR info');
      setJarInfo(null);
    } finally {
      setLoading(false);
    }
  }, [userId, pluginName]);

  useEffect(() => {
    loadJarInfo();
  }, [loadJarInfo]);

  return {
    jarInfo,
    loading,
    error,
    reload: loadJarInfo
  };
}

// Hook for managing batch JAR operations
export function useJarBatchOperations(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMultipleJars = useCallback(async (pluginNames: string[]): Promise<Record<string, JarFileInfo>> => {
    if (!userId || pluginNames.length === 0) return {};
    
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled(
        pluginNames.map(async (pluginName) => {
          const jarInfo = await getJarInfo(userId, pluginName);
          return { pluginName, jarInfo };
        })
      );
      
      const jarInfoMap: Record<string, JarFileInfo> = {};
      const failed: string[] = [];
      const succeeded: string[] = [];
      
      results.forEach((result, index) => {
        const pluginName = pluginNames[index];
        if (result.status === 'fulfilled') {
          jarInfoMap[pluginName] = result.value.jarInfo;
          succeeded.push(pluginName);
        } else {
          // Set unavailable status for failed plugins
          jarInfoMap[pluginName] = {
            available: false,
            fileName: `${pluginName}.jar`,
            fileSize: 0,
            lastModified: new Date().toISOString()
          };
          failed.push(pluginName);
        }
      });
      
      if (failed.length > 0) {
        const message = `${failed.length} out of ${pluginNames.length} refreshes failed`;
        showNotification(message, 'error');
        console.warn('Failed to refresh:', failed);
      }
      
      if (succeeded.length > 0) {
        showNotification(`Successfully refreshed ${succeeded.length} JAR files!`, 'success');
      }
      
      return jarInfoMap;
    } catch (error) {
      console.error('Batch refresh failed:', error);
      setError(error instanceof Error ? error.message : 'Batch refresh failed');
      showNotification(`Batch refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const downloadMultipleJars = useCallback(async (pluginNames: string[]) => {
    if (!userId || pluginNames.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Download each JAR sequentially to avoid overwhelming the browser
      for (const pluginName of pluginNames) {
        try {
          const blob = await downloadJar(userId, pluginName);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${pluginName}.jar`;
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to download ${pluginName}:`, error);
        }
      }
      
      showNotification(`Downloaded ${pluginNames.length} JAR files!`, 'success');
    } catch (error) {
      console.error('Batch download failed:', error);
      setError(error instanceof Error ? error.message : 'Batch download failed');
      showNotification(`Batch download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    refreshMultipleJars,
    downloadMultipleJars,
    clearError: () => setError(null)
  };
}
