// types/download.ts
export interface DownloadInfo {
  available: boolean;
  jarFile?: string;
  fileSize?: number;
  lastModified?: string;
  checksum?: string;
  downloadUrl?: string;
  secureDownloadUrl?: string;
  temporaryToken?: string;
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
  useSecureDownload?: boolean;
  token?: string;
  onProgress?: (progress: DownloadProgress) => void;
  onError?: (error: DownloadError) => void;
  onComplete?: (result: DownloadResult) => void;
  maxRetries?: number;
  chunkSize?: number;
}

export interface DownloadResult {
  success: boolean;
  fileName?: string;
  fileSize?: number;
  downloadDuration?: number;
  checksum?: string;
  blob?: Blob;
  error?: DownloadError;
}

export interface DownloadToken {
  token: string;
  expiresAt: string;
  maxDownloads: number;
  downloadCount?: number;
}

export interface DownloadAnalytics {
  totalDownloads: number;
  totalBytesTransferred: number;
  averageDownloadDuration: number;
  successRate: number;
  topPlugins: Array<{
    pluginName: string;
    downloadCount: number;
  }>;
}
