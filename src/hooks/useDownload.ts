// hooks/useDownload.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { DownloadOptions, DownloadProgress, DownloadResult, DownloadError } from '../types/download';

export const useDownload = () => {
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const download = useCallback(async (options: DownloadOptions): Promise<DownloadResult> => {
    const downloadId = `${options.userId}-${options.pluginName}`;
    const abortController = new AbortController();
    abortControllers.current.set(downloadId, abortController);

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

    try {
      // Get download info first
      const infoResponse = await fetch(
        `/api/plugin/download-info/${options.userId}/${options.pluginName}`,
        { signal: abortController.signal }
      );

      if (!infoResponse.ok) {
        throw new Error('Failed to get download info');
      }

      const downloadInfo = await infoResponse.json();

      if (!downloadInfo.available) {
        throw new Error('Plugin not available for download');
      }

      // Determine download URL
      const downloadUrl = options.useSecureDownload && options.token
        ? `/api/plugin/download/secure/${options.userId}/${options.pluginName}?token=${options.token}`
        : `/api/plugin/download/${options.userId}/${options.pluginName}`;

      // Start download with progress tracking
      const response = await fetch(downloadUrl, {
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Download failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const contentLength = parseInt(response.headers.get('Content-Length') || '0');
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      const startTime = Date.now();

      // Update progress with total size
      setDownloads(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(downloadId) || initialProgress;
        newMap.set(downloadId, {
          ...current,
          total: contentLength,
          status: 'downloading'
        });
        return newMap;
      });

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        const speed = elapsed > 0 ? loaded / elapsed : 0;
        const timeRemaining = speed > 0 ? (contentLength - loaded) / speed : 0;
        const percentage = contentLength > 0 ? (loaded / contentLength) * 100 : 0;

        const progress: DownloadProgress = {
          loaded,
          total: contentLength,
          percentage,
          speed,
          timeRemaining,
          status: 'downloading'
        };

        setDownloads(prev => new Map(prev).set(downloadId, progress));
        options.onProgress?.(progress);
      }

      // Create blob from chunks
      const blob = new Blob(chunks);

      // Verify checksum if provided
      if (downloadInfo.checksum) {
        const downloadedChecksum = await calculateChecksum(blob);
        if (downloadedChecksum !== downloadInfo.checksum) {
          throw new Error('Checksum verification failed');
        }
      }

      const result: DownloadResult = {
        success: true,
        fileName: downloadInfo.jarFile,
        fileSize: loaded,
        downloadDuration: Date.now() - startTime,
        checksum: downloadInfo.checksum,
        blob
      };

      // Update final progress
      setDownloads(prev => {
        const newMap = new Map(prev);
        newMap.set(downloadId, {
          loaded,
          total: contentLength,
          percentage: 100,
          speed: 0,
          timeRemaining: 0,
          status: 'completed'
        });
        return newMap;
      });

      options.onComplete?.(result);
      return result;

    } catch (error: unknown) {
      const downloadError: DownloadError = {
        code: (error as Error).name || 'DOWNLOAD_ERROR',
        message: (error as Error).message,
        retryable: !abortController.signal.aborted,
        httpStatus: (error as { status?: number }).status
      };

      setDownloads(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(downloadId) || initialProgress;
        newMap.set(downloadId, {
          ...current,
          status: abortController.signal.aborted ? 'cancelled' : 'error'
        });
        return newMap;
      });

      options.onError?.(downloadError);

      return {
        success: false,
        error: downloadError
      };
    } finally {
      abortControllers.current.delete(downloadId);
    }
  }, []);

  const cancelDownload = useCallback((userId: string, pluginName: string) => {
    const downloadId = `${userId}-${pluginName}`;
    const controller = abortControllers.current.get(downloadId);
    if (controller) {
      controller.abort();
    }
  }, []);

  const getProgress = useCallback((userId: string, pluginName: string): DownloadProgress | undefined => {
    const downloadId = `${userId}-${pluginName}`;
    return downloads.get(downloadId);
  }, [downloads]);

  return {
    download,
    cancelDownload,
    getProgress,
    downloads: Array.from(downloads.entries()).map(([id, progress]) => ({
      id,
      ...progress
    }))
  };
};

// Utility function to calculate checksum
async function calculateChecksum(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
