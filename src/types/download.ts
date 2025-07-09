// types/download.ts - Unified External Download API Types
export interface DownloadInfo {
  available: boolean;
  jarFile?: string;
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

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'cancelled';
}

export interface DownloadError {
  code: string;
  message: string;
  retryable: boolean;
  httpStatus?: number;
}

export interface DownloadOptions {
  userId: string;
  pluginName: string;
  onProgress?: (progress: DownloadProgress) => void;
  onError?: (error: string) => void;
  onComplete?: (result: DownloadResult) => void;
  maxRetries?: number;
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  size?: number;
  downloadDuration?: number;
  checksum?: string;
  blob?: Blob;
  error?: string;
}

export interface DownloadAnalytics {
  totalDownloads: number;
  totalBytesTransferred: number;
  averageDownloadDuration: number;
  successRate: number;
  topPlugins: Array<{
    pluginName: string;
    downloadCount: number;
    totalSize: number;
  }>;
  errorRate: number;
  peakDownloadTimes: Array<{
    hour: number;
    count: number;
  }>;
}
