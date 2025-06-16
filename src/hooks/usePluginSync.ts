'use client';

import { useState, useCallback } from 'react';

interface SyncStatus {
  isLoading: boolean;
  lastSync?: string;
  filesCount: number;
  error?: string;
}

interface SyncResult {
  success: boolean;
  filesCount: number;
  message: string;
}

export function usePluginSync() {
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});

  const syncPluginFiles = useCallback(async (pluginName: string): Promise<SyncResult> => {
    setSyncStatus(prev => ({
      ...prev,
      [pluginName]: { ...prev[pluginName], isLoading: true, error: undefined }
    }));

    try {
      const response = await fetch('/api/plugins/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pluginName }),
      });

      const data = await response.json();

      if (response.ok) {        setSyncStatus(prev => ({
          ...prev,
          [pluginName]: {
            isLoading: false,
            lastSync: new Date().toISOString(),
            filesCount: data.filesCount,
            error: undefined
          }
        }));

        // Dispatch custom event for file sync completion
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-files-synced', {
            detail: { pluginName, filesCount: data.filesCount }
          }));
        }

        return {
          success: true,
          filesCount: data.filesCount,
          message: data.message
        };
      } else {
        const error = data.error || 'Sync failed';
        setSyncStatus(prev => ({
          ...prev,
          [pluginName]: { ...prev[pluginName], isLoading: false, error }
        }));

        return {
          success: false,
          filesCount: 0,
          message: error
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setSyncStatus(prev => ({
        ...prev,
        [pluginName]: { ...prev[pluginName], isLoading: false, error: errorMessage }
      }));

      return {
        success: false,
        filesCount: 0,
        message: errorMessage
      };
    }
  }, []);

  const getSyncStatus = useCallback(async (pluginName: string) => {
    try {
      const response = await fetch(`/api/plugins/sync?pluginName=${encodeURIComponent(pluginName)}`);
      const data = await response.json();

      if (response.ok) {
        setSyncStatus(prev => ({
          ...prev,
          [pluginName]: {
            isLoading: false,
            lastSync: data.plugin.lastSync,
            filesCount: data.plugin.filesCount,
            error: undefined
          }
        }));

        return data.plugin;
      }
    } catch (error) {
      console.error('Error getting sync status:', error);
    }
  }, []);

  // Auto-sync function that can be called periodically
  const autoSyncPlugin = useCallback(async (pluginName: string, intervalMs: number = 30000) => {
    const sync = async () => {
      const result = await syncPluginFiles(pluginName);
      console.log(`Auto-sync for ${pluginName}:`, result);
    };

    // Initial sync
    await sync();

    // Set up periodic sync
    const interval = setInterval(sync, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }, [syncPluginFiles]);

  return {
    syncStatus,
    syncPluginFiles,
    getSyncStatus,
    autoSyncPlugin
  };
}
