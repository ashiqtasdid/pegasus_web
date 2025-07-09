// hooks/useDownload.ts - Unified External Download API
'use client';

import { useState, useCallback } from 'react';
import { getJarInfo, downloadJar, type JarFileInfo } from '@/lib/jar-api';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  timeRemaining: number;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled';
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  size?: number;
  downloadDuration?: number;
  error?: string;
}

export interface DownloadOptions {
  userId: string;
  pluginName: string;
  onProgress?: (progress: DownloadProgress) => void;
  onError?: (error: string) => void;
  onComplete?: (result: DownloadResult) => void;
}

export const useDownload = () => {
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(new Map());
  const [loading, setLoading] = useState(false);

  const checkAvailability = useCallback(async (userId: string, pluginName: string): Promise<JarFileInfo> => {
    return await getJarInfo(userId, pluginName);
  }, []);

  const downloadFile = useCallback(async (options: DownloadOptions): Promise<DownloadResult> => {
    const { userId, pluginName, onProgress, onError, onComplete } = options;
    const downloadId = `${userId}-${pluginName}`;
    const startTime = Date.now();

    // Initialize progress
    const initialProgress: DownloadProgress = {
      loaded: 0,
      total: 0,
      percentage: 0,
      speed: 0,
      timeRemaining: 0,
      status: 'pending'
    };

    setDownloads(prev => new Map(prev).set(downloadId, initialProgress));
    setLoading(true);

    try {
      // Update status to downloading
      const downloadingProgress = { ...initialProgress, status: 'downloading' as const };
      setDownloads(prev => new Map(prev).set(downloadId, downloadingProgress));
      onProgress?.(downloadingProgress);

      // Get file info first
      const info = await getJarInfo(userId, pluginName);
      
      if (!info.available) {
        throw new Error('Plugin JAR file is not available for download');
      }

      // Download using unified external API
      const blob = await downloadJar(userId, pluginName);
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty - please try recompiling the plugin');
      }

      const filename = info.fileName || `${pluginName}.jar`;
      
      // Update final progress
      const completedProgress: DownloadProgress = {
        loaded: blob.size,
        total: blob.size,
        percentage: 100,
        speed: 0,
        timeRemaining: 0,
        status: 'completed'
      };
      
      setDownloads(prev => new Map(prev).set(downloadId, completedProgress));
      onProgress?.(completedProgress);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const result: DownloadResult = {
        success: true,
        filename,
        size: blob.size,
        downloadDuration: Date.now() - startTime
      };

      onComplete?.(result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      console.error('Download error:', error);

      // Update error status
      const errorProgress: DownloadProgress = {
        loaded: 0,
        total: 0,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        status: 'error'
      };
      
      setDownloads(prev => new Map(prev).set(downloadId, errorProgress));
      onProgress?.(errorProgress);
      onError?.(errorMessage);

      const result: DownloadResult = {
        success: false,
        error: errorMessage
      };

      onComplete?.(result);
      return result;

    } finally {
      setLoading(false);
    }
  }, []);

  const cancelDownload = useCallback((userId: string, pluginName: string) => {
    const downloadId = `${userId}-${pluginName}`;
    
    // Update status to cancelled
    const cancelledProgress: DownloadProgress = {
      loaded: 0,
      total: 0,
      percentage: 0,
      speed: 0,
      timeRemaining: 0,
      status: 'cancelled'
    };
    
    setDownloads(prev => new Map(prev).set(downloadId, cancelledProgress));
  }, []);

  const getDownloadProgress = useCallback((userId: string, pluginName: string): DownloadProgress | undefined => {
    const downloadId = `${userId}-${pluginName}`;
    return downloads.get(downloadId);
  }, [downloads]);

  const clearDownloads = useCallback(() => {
    setDownloads(new Map());
  }, []);

  return {
    loading,
    downloads,
    checkAvailability,
    downloadFile,
    cancelDownload,
    getDownloadProgress,
    clearDownloads
  };
};
