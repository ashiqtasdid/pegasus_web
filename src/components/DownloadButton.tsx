// components/DownloadButton.tsx
'use client';

import React, { useState } from 'react';
import { usePluginGenerator } from '../hooks/usePluginGenerator';

interface DownloadButtonProps {
  userId: string;
  pluginName: string;
  className?: string;
  children?: React.ReactNode;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: string) => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  userId,
  pluginName,
  className = '',
  children = 'Download JAR',
  onDownloadComplete,
  onDownloadError
}) => {
  const { downloadJar, jarLoading, jarInfo, checkJarAvailability } = usePluginGenerator();
  const [isChecking, setIsChecking] = useState(false);

  const handleDownload = async () => {
    try {
      // Check JAR availability first
      setIsChecking(true);
      const availability = await checkJarAvailability(userId, pluginName);
      
      if (!availability?.available) {
        const errorMsg = 'JAR file is not available for download. Please ensure the plugin is compiled.';
        onDownloadError?.(errorMsg);
        return;
      }

      // Use the robust download function from usePluginGenerator
      await downloadJar(userId, pluginName);
      onDownloadComplete?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Download failed';
      onDownloadError?.(errorMsg);
    } finally {
      setIsChecking(false);
    }
  };

  const getButtonText = () => {
    if (isChecking) return 'Checking...';
    if (jarLoading) return 'Downloading...';
    if (jarInfo?.available === false) return 'JAR Not Available';
    return children;
  };

  const getButtonClass = () => {
    const baseClass = `px-4 py-2 rounded font-medium transition-colors ${className}`;
    
    if (jarInfo?.available === false) {
      return `${baseClass} bg-gray-400 text-gray-600 cursor-not-allowed`;
    }
    
    if (isChecking || jarLoading) {
      return `${baseClass} bg-blue-400 text-white cursor-not-allowed`;
    }
    
    return `${baseClass} bg-blue-500 hover:bg-blue-600 text-white`;
  };

  const isDisabled = isChecking || jarLoading || jarInfo?.available === false;

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={handleDownload}
        disabled={isDisabled}
        className={getButtonClass()}
      >
        {getButtonText()}
      </button>
      
      {jarInfo?.available === false && (
        <div className="text-xs text-gray-500">
          Plugin needs to be compiled first
        </div>
      )}
      
      {jarInfo?.available && jarInfo.fileSize && (
        <div className="text-xs text-gray-500">
          Size: {(jarInfo.fileSize / 1024).toFixed(1)}KB
        </div>
      )}
    </div>
  );
};
