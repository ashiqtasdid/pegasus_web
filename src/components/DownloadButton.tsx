// components/DownloadButton.tsx
'use client';

import React, { useState } from 'react';
import { useDownload } from '../hooks/useDownload';
import { useDownloadToken } from '../hooks/useDownloadToken';
import { DownloadError, DownloadResult } from '../types/download';
import { DownloadProgressBar } from './DownloadProgressBar';

interface DownloadButtonProps {
  userId: string;
  pluginName: string;
  useSecureDownload?: boolean;
  className?: string;
  children?: React.ReactNode;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: DownloadError) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  userId,
  pluginName,
  useSecureDownload = false,
  className = '',
  children = 'Download',
  onDownloadComplete,
  onDownloadError
}) => {
  const { download, cancelDownload, getProgress } = useDownload();
  const { generateToken } = useDownloadToken();
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const progress = getProgress(userId, pluginName);
  const isDownloading = progress?.status === 'downloading';
  const isCompleted = progress?.status === 'completed';

  const handleDownload = async () => {
    try {
      let token: string | undefined;

      if (useSecureDownload) {
        setIsGeneratingToken(true);
        const tokenData = await generateToken(userId, pluginName, {
          maxDownloads: 1,
          expirationHours: 1
        });

        if (!tokenData) {
          throw new Error('Failed to generate download token');
        }

        token = tokenData.token;
        setIsGeneratingToken(false);
      }

      const result = await download({
        userId,
        pluginName,
        useSecureDownload,
        token,
        onProgress: () => {
          // Progress updates are handled by the hook
        },
        onError: (error: DownloadError) => {
          onDownloadError?.(error);
        },
        onComplete: (downloadResult: DownloadResult) => {
          if (downloadResult.success && downloadResult.blob) {
            // Create download link
            const url = URL.createObjectURL(downloadResult.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadResult.fileName || `${pluginName}.jar`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onDownloadComplete?.();
          }
        }
      });

      console.log('Download result:', result);

    } catch (error: unknown) {
      onDownloadError?.({
        code: 'DOWNLOAD_FAILED',
        message: (error as Error).message,
        retryable: true
      });
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCancel = () => {
    cancelDownload(userId, pluginName);
  };

  const getButtonText = () => {
    if (isGeneratingToken) return 'Generating Token...';
    if (isDownloading) return 'Cancel';
    if (isCompleted) return 'Download Complete ✓';
    return children;
  };

  const getButtonClass = () => {
    const baseClass = `px-4 py-2 rounded font-medium transition-colors ${className}`;
    
    if (isCompleted) {
      return `${baseClass} bg-green-500 text-white cursor-default`;
    }
    
    if (isDownloading) {
      return `${baseClass} bg-red-500 hover:bg-red-600 text-white`;
    }
    
    if (isGeneratingToken) {
      return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
    }
    
    return `${baseClass} bg-blue-500 hover:bg-blue-600 text-white`;
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={isDownloading ? handleCancel : handleDownload}
        disabled={isGeneratingToken || isCompleted}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>
      
      {progress && progress.status === 'downloading' && (
        <DownloadProgressBar progress={progress} />
      )}
    </div>
  );
};
