/**
 * File manager utilities for Pterodactyl integration
 */

export interface FileManagerUtils {
  formatBytes: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  getFileIcon: (fileName: string) => string;
  isTextFile: (fileName: string) => boolean;
  isImageFile: (fileName: string) => boolean;
  getLanguageFromExtension: (fileName: string) => string;
}

export const fileManagerUtils: FileManagerUtils = {
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  },

  getFileIcon: (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Programming languages
    if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) return '📄';
    if (['py', 'pyw'].includes(extension)) return '🐍';
    if (['java', 'class'].includes(extension)) return '☕';
    if (['cpp', 'cc', 'cxx', 'c', 'h'].includes(extension)) return '⚙️';
    if (['cs'].includes(extension)) return '🔷';
    if (['php'].includes(extension)) return '🐘';
    if (['rb'].includes(extension)) return '💎';
    if (['go'].includes(extension)) return '🐹';
    if (['rs'].includes(extension)) return '🦀';
    if (['kt'].includes(extension)) return '🎯';
    if (['swift'].includes(extension)) return '🦉';
    
    // Web technologies
    if (['html', 'htm'].includes(extension)) return '🌐';
    if (['css', 'scss', 'sass', 'less'].includes(extension)) return '🎨';
    if (['json'].includes(extension)) return '📋';
    if (['xml'].includes(extension)) return '📄';
    if (['yml', 'yaml'].includes(extension)) return '⚙️';
    
    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(extension)) return '🖼️';
    
    // Documents
    if (['md', 'markdown'].includes(extension)) return '📝';
    if (['txt', 'log'].includes(extension)) return '📄';
    if (['pdf'].includes(extension)) return '📕';
    if (['doc', 'docx'].includes(extension)) return '📘';
    if (['xls', 'xlsx'].includes(extension)) return '📗';
    if (['ppt', 'pptx'].includes(extension)) return '📙';
    
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return '📦';
    if (['jar', 'war', 'ear'].includes(extension)) return '☕';
    
    // Executables
    if (['exe', 'msi', 'app', 'deb', 'rpm'].includes(extension)) return '⚙️';
    if (['sh', 'bat', 'cmd', 'ps1'].includes(extension)) return '💻';
    
    // Database
    if (['sql', 'db', 'sqlite'].includes(extension)) return '🗄️';
    
    // Configuration
    if (['ini', 'conf', 'config', 'properties'].includes(extension)) return '⚙️';
    if (['env', 'gitignore', 'dockerignore'].includes(extension)) return '🔧';
    
    // Default
    return '📄';
  },

  isTextFile: (fileName: string): boolean => {
    const textExtensions = [
      'txt', 'md', 'markdown', 'log', 'csv', 'tsv',
      'js', 'jsx', 'ts', 'tsx', 'json', 'html', 'htm', 'css', 'scss', 'sass', 'less',
      'py', 'pyw', 'java', 'cpp', 'cc', 'cxx', 'c', 'h', 'cs', 'php', 'rb', 'go', 'rs',
      'kt', 'swift', 'xml', 'yml', 'yaml', 'sql', 'sh', 'bat', 'cmd', 'ps1',
      'ini', 'conf', 'config', 'properties', 'env', 'gitignore', 'dockerignore'
    ];
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return textExtensions.includes(extension);
  },

  isImageFile: (fileName: string): boolean => {
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff'];
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return imageExtensions.includes(extension);
  },

  getLanguageFromExtension: (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript', 
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'scss',
      'less': 'less',
      'py': 'python',
      'pyw': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'h': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'kt': 'kotlin',
      'swift': 'swift',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'bat': 'batch',
      'cmd': 'batch',
      'ps1': 'powershell',
      'md': 'markdown',
      'markdown': 'markdown',
      'ini': 'ini',
      'conf': 'properties',
      'config': 'properties',
      'properties': 'properties',
      'env': 'properties',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile',
      'r': 'r',
      'R': 'r',
      'scala': 'scala',
      'clj': 'clojure',
      'cljs': 'clojure',
      'hs': 'haskell',
      'elm': 'elm',
      'dart': 'dart',
      'lua': 'lua',
      'perl': 'perl',
      'pl': 'perl',
      'vim': 'vim',
      'tex': 'latex',
      'log': 'plaintext',
      'txt': 'plaintext'
    };

    return languageMap[extension] || 'plaintext';
  }
};

// File operation result types
export interface FileOperationResult {
  success: boolean;
  error?: string;
  message?: string;
}

// File validation utilities
export const fileValidation = {
  isValidFileName: (name: string): boolean => {
    // Check for invalid characters (Windows + Unix)
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    return !invalidChars.test(name) && name.trim().length > 0;
  },

  isValidPath: (path: string): boolean => {
    // Basic path validation
    return path.startsWith('/') && !path.includes('//') && !path.endsWith('/');
  },

  getFileTypeFromMime: (mimeType: string): 'text' | 'image' | 'binary' => {
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.startsWith('image/')) return 'image';
    return 'binary';
  }
};

// File breadcrumb utilities
export const breadcrumbUtils = {
  createBreadcrumbs: (path: string): Array<{ name: string; path: string }> => {
    const parts = path.split('/').filter(part => part.length > 0);
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    let currentPath = '';
    for (const part of parts) {
      currentPath += '/' + part;
      breadcrumbs.push({ name: part, path: currentPath });
    }
    
    return breadcrumbs;
  },

  getParentPath: (path: string): string => {
    if (path === '/') return '/';
    const lastSlash = path.lastIndexOf('/');
    return lastSlash === 0 ? '/' : path.substring(0, lastSlash);
  },

  getFileName: (path: string): string => {
    return path.substring(path.lastIndexOf('/') + 1);
  }
};
