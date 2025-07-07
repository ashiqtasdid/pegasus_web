import { useState, useEffect, useCallback } from 'react';
import { 
  getPluginList, 
  getJarInfo, 
  getMultipleJarInfos, 
  downloadJar, 
  syncJarToDatabase, 
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
  syncPlugin: (pluginName: string) => Promise<void>;
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

  const refreshPlugin = useCallback(async (pluginName: string) => {
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

  const syncPlugin = useCallback(async (pluginName: string) => {
    if (!userId) return;
    
    try {
      setSyncing(prev => new Set(prev).add(pluginName));
      
      await syncJarToDatabase(userId, pluginName);
      
      // Refresh the plugin info after sync
      await refreshPlugin(pluginName);
      
      showNotification(`${pluginName} JAR synced successfully!`, 'success');
    } catch (error) {
      console.error(`Sync failed for ${pluginName}:`, error);
      showNotification(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginName);
        return newSet;
      });
    }
  }, [userId, refreshPlugin]);

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
    syncPlugin,
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

  const syncMultipleJars = useCallback(async (pluginNames: string[]) => {
    if (!userId || pluginNames.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled(
        pluginNames.map(pluginName => syncJarToDatabase(userId, pluginName))
      );
      
      const failed = results.filter(r => r.status === 'rejected');
      const succeeded = results.filter(r => r.status === 'fulfilled');
      
      if (failed.length > 0) {
        throw new Error(`${failed.length} out of ${pluginNames.length} syncs failed`);
      }
      
      showNotification(`Successfully synced ${succeeded.length} JAR files!`, 'success');
    } catch (error) {
      console.error('Batch sync failed:', error);
      setError(error instanceof Error ? error.message : 'Batch sync failed');
      showNotification(`Batch sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
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
    syncMultipleJars,
    downloadMultipleJars,
    clearError: () => setError(null)
  };
}
