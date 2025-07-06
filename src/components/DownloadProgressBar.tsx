// components/DownloadProgressBar.tsx
'use client';

import React from 'react';
import { DownloadProgress } from '../types/download';

interface DownloadProgressBarProps {
  progress: DownloadProgress;
  showDetails?: boolean;
  className?: string;
}

export const DownloadProgressBar: React.FC<DownloadProgressBarProps> = ({
  progress,
  showDetails = true,
  className = ''
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>

      {/* Progress Details */}
      {showDetails && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
          </span>
          <span>{Math.round(progress.percentage)}%</span>
        </div>
      )}

      {/* Speed and Time Remaining */}
      {showDetails && progress.speed > 0 && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Speed: {formatSpeed(progress.speed)}</span>
          {progress.timeRemaining > 0 && (
            <span>ETA: {formatTime(progress.timeRemaining)}</span>
          )}
        </div>
      )}
    </div>
  );
};
