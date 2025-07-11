'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileExplorer, FileNode } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { ErrorBoundary } from './ErrorBoundary';
import { ChatSidebar } from './ChatSidebar';
import { PluginManager } from './PluginManager';
import { NotificationManager, useNotifications } from './NotificationManager';
import { Button } from '@/components/ui/button';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  LayoutTemplate,
  Search,
  Settings,
  Package,
  GitBranch,
  RefreshCw,
  RotateCcw,
  Clock,
  Play,
  Pause,
  Hammer
} from 'lucide-react';
import { usePluginSync } from '@/hooks/usePluginSync';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';
import { UserMenu } from './UserMenu';
import { ServerStatus } from './ServerStatus';

interface VSCodeLayoutProps {
  className?: string;
  pluginId?: string | null;
  userId?: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    type?: string;
    contextLoaded?: boolean;
    filesAnalyzed?: number;
  };
}

export function VSCodeLayout({ className = '', pluginId, userId }: VSCodeLayoutProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  
  // Debug component to track state
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-4 right-4 bg-black text-white p-2 text-xs z-50 rounded shadow-lg">
        <div className="font-bold mb-1">Debug State</div>
        <div>Left Sidebar: {isLeftSidebarOpen ? 'OPEN' : 'CLOSED'}</div>
        <div>Right Sidebar: {isRightSidebarOpen ? 'OPEN' : 'CLOSED'}</div>
        <div>Plugin: {pluginId || 'None'}</div>
        <div>User: {userId || 'None'}</div>
        <div className="mt-1 pt-1 border-t border-gray-600 text-xs">
          <div className="text-cyan-300">Layout Debug Info</div>
        </div>
      </div>
    );
  };

  const [leftSidebarView, setLeftSidebarView] = useState<'explorer' | 'plugins'>('explorer');
  const [mounted, setMounted] = useState(false);  const [pluginFiles, setPluginFiles] = useState<FileNode[]>([]);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingPlugin, setIsLoadingPlugin] = useState(false);
  const [lastLoadedPluginId, setLastLoadedPluginId] = useState<string | null>(null);
  const [serverCredentials] = useState<{
    panelUrl: string;
    username: string;
    password: string;
    email?: string;
  } | null>(null);
  const [serverDetails] = useState<{
    id: number;
    identifier: string;
    name: string;
    status: string;
  } | null>(null);
    // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Writing and reviewing code\n• Debugging issues\n• Explaining concepts\n• Generating components\n\nWhat would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);  // Refs for stable references
  const pluginIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const lastLoadedPluginIdRef = useRef<string | null>(null);
  const pluginFilesRef = useRef<FileNode[]>([]);
  const hasLoadedRef = useRef<Set<string>>(new Set()); // Track what has been loaded
  
  // Update refs when values change
  useEffect(() => {
    pluginIdRef.current = pluginId || null;
  }, [pluginId]);
  
  useEffect(() => {
    userIdRef.current = userId || null;
  }, [userId]);
  
  useEffect(() => {
    isLoadingRef.current = isLoadingPlugin;
  }, [isLoadingPlugin]);
  
  useEffect(() => {
    lastLoadedPluginIdRef.current = lastLoadedPluginId;
  }, [lastLoadedPluginId]);
  
  useEffect(() => {
    pluginFilesRef.current = pluginFiles;
  }, [pluginFiles]);
    // Notifications
  const { notifications, dismissNotification, showSuccess, showError } = useNotifications();
  
  // Stable refs for notification functions
  const showSuccessRef = useRef(showSuccess);
  const showErrorRef = useRef(showError);
  
  useEffect(() => {
    showSuccessRef.current = showSuccess;
    showErrorRef.current = showError;
  }, [showSuccess, showError]);    // Plugin sync functionality - using just syncPluginFiles for manual sync
  const { syncPluginFiles } = usePluginSync();
  
  // Plugin generator functionality for recompilation
  const { recompilePlugin, isLoading: isRecompiling } = usePluginGenerator();
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';const loadPluginFiles = useCallback(async (pluginName: string, force: boolean = false) => {
    const cacheKey = `${pluginName}-${userIdRef.current || 'anonymous'}`;
    
    // Prevent loading the same plugin multiple times using refs (unless forced)
    if (!force && hasLoadedRef.current.has(cacheKey)) {
      console.log(`Plugin ${pluginName} already loaded (cache key: ${cacheKey}), skipping reload`);
      return;
    }

    // Prevent concurrent loading
    if (isLoadingRef.current) {
      console.log(`Plugin loading already in progress for ${pluginName}, skipping`);
      return;
    }

    console.log(`Loading plugin files for Name: ${pluginName}, User: ${userIdRef.current}, Force: ${force}, Cache key: ${cacheKey}`);
    setIsLoadingPlugin(true);    
    try {
      const currentUserId = userIdRef.current;
      if (!currentUserId) {
        console.error('No userId available for loading plugin files');
        showErrorRef.current('Load Failed', 'User ID is required to load plugin files');
        return;
      }

      const requestBody = {
        userId: currentUserId,
        pluginName: pluginName
      };

      const response = await fetch('/api/plugin/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      
      console.log('API Response Status:', response.status, response.ok);
      console.log('API Response Data:', data);      if (response.ok && data.success && data.files) {
        console.log('✅ Plugin files loaded successfully');
        console.log('📁 Raw files data:', data.files);        
        // Update refs for cache tracking
        lastLoadedPluginIdRef.current = pluginName;
        hasLoadedRef.current.add(cacheKey); // Mark as loaded
        
        const fileEntries = Object.entries(data.files);
        console.log('📁 Files count:', fileEntries.length);
        
        if (fileEntries.length > 0) {
          // Convert backend files format to FileNode format
          const fileNodes: FileNode[] = fileEntries.map(([filePath, content]) => {
            const getLanguageFromPath = (path: string): string => {
              const extension = path.split('.').pop()?.toLowerCase();
              switch (extension) {
                case 'java': return 'java';
                case 'yml':
                case 'yaml': return 'yaml';
                case 'xml': return 'xml';
                case 'json': return 'json';
                case 'md': return 'markdown';
                case 'js': return 'javascript';
                case 'ts': return 'typescript';
                case 'jsx': return 'javascriptreact';
                case 'tsx': return 'typescriptreact';
                case 'css': return 'css';
                case 'html': return 'html';
                case 'py': return 'python';
                case 'sql': return 'sql';
                default: return 'text';
              }
            };            return {
              id: filePath,
              name: filePath.split('/').pop() || filePath,
              type: 'file' as const,
              content: content as string,
              path: filePath,
              language: getLanguageFromPath(filePath)
            };
          });
            console.log('📦 Converted file nodes:', fileNodes);
          console.log('📦 Setting plugin files in state...');          setPluginFiles(fileNodes);
          pluginFilesRef.current = fileNodes; // Update ref
          setLastLoadedPluginId(pluginName);
          setLeftSidebarView('explorer');
          console.log('✅ Plugin files state updated with', fileNodes.length, 'files');
          
          // Auto-select main class file if exists
          const mainFile = fileNodes.find(f => f.name?.endsWith('.java') && f.name.includes('Main'));
          if (mainFile) {
            console.log('Auto-selecting main file:', mainFile);
            setSelectedFile(mainFile);
          } else if (fileNodes.length > 0) {
            // If no main file, select the first file
            console.log('No main file found, selecting first file:', fileNodes[0]);
            setSelectedFile(fileNodes[0]);
          }          
          showSuccessRef.current('Files Loaded', `Loaded ${fileNodes.length} files for ${pluginName}`);
          setLastRefreshTime(new Date());
        } else {
          console.log('⚠️ No files found in plugin');
          setPluginFiles([]);
          pluginFilesRef.current = []; // Update ref
          setLastLoadedPluginId(pluginName);
          setSelectedFile(null);
          showSuccessRef.current('No Files', 'Plugin loaded but no files found');
          setLastRefreshTime(new Date());
        }} else {
        console.error('❌ Plugin load error:');
        console.error('Response OK:', response.ok);
        console.error('Data:', data);
        console.error('Has success:', !!data?.success);
        console.error('Has files:', !!data?.files);
        showErrorRef.current('Load Failed', data.error || 'Failed to load plugin files');
      }
    } catch (error) {
      console.error('Error loading plugin files:', error);
      showErrorRef.current('Load Failed', 'Network error loading plugin files');
    } finally {
      setIsLoadingPlugin(false);
    }
  }, []); // Remove all dependencies to make it stable

  // Auto-refresh functions
  const startAutoRefresh = useCallback((pluginName: string) => {
    // Clear existing interval if any
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }

    // Start new interval for 2 minutes (120000ms)
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing plugin files for:', pluginName);
      loadPluginFiles(pluginName, true); // Force refresh
    }, 120000);

    setAutoRefreshInterval(intervalId);
    setIsAutoRefreshEnabled(true);
    console.log('Auto-refresh started for plugin:', pluginName, '(every 2 minutes)');
    showSuccessRef.current('Auto-refresh Started', 'Files will refresh every 2 minutes');
  }, [loadPluginFiles, autoRefreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
    setIsAutoRefreshEnabled(false);
    console.log('Auto-refresh stopped');
    showSuccessRef.current('Auto-refresh Stopped', 'Files will no longer auto-refresh');
  }, [autoRefreshInterval]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    if (isAutoRefreshEnabled) {
      stopAutoRefresh();
    } else if (pluginId) {
      startAutoRefresh(pluginId);
    }
  }, [isAutoRefreshEnabled, pluginId, startAutoRefresh, stopAutoRefresh]);

  // Cleanup auto-refresh on unmount or when plugin changes
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);
  // Stop auto-refresh when plugin changes
  useEffect(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
      setIsAutoRefreshEnabled(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginId]);

  // Load plugin files if pluginId is provided - ONLY ONCE
  useEffect(() => {
    if (pluginId && userId) {
      console.log(`VSCodeLayout: Loading plugin files for pluginName: ${pluginId}, userId: ${userId}`);
      loadPluginFiles(pluginId, false); // Don't force, use cache (pluginId is actually pluginName)
    } else {
      console.log('VSCodeLayout: No pluginId provided, clearing files');
      setPluginFiles([]);
      setSelectedFile(null);
      setLastLoadedPluginId(null);
      
      // Reset chat to default welcome message
      setChatMessages([{
        id: '1',
        content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Writing and reviewing code\n• Debugging issues\n• Explaining concepts\n• Generating components\n\nWhat would you like to work on today?',
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [pluginId, userId, loadPluginFiles]); // Include loadPluginFiles in dependencies

  // Force refresh function that bypasses caching
  const forceRefreshFiles = useCallback(async (pluginName: string) => {
    const cacheKey = `${pluginName}-${userIdRef.current || 'anonymous'}`;
    hasLoadedRef.current.delete(cacheKey); // Clear cache for this plugin
    lastLoadedPluginIdRef.current = null; // Reset cache using ref
    await loadPluginFiles(pluginName, true); // Force reload
  }, [loadPluginFiles]);  // Manual sync function
  const handleSyncFiles = async () => {
    if (!pluginId) return;    setIsLoadingPlugin(true);
    try {
      // First get the plugin to extract the plugin name
      const pluginResponse = await fetch(`/api/plugins/${pluginId}`);
      const pluginData = await pluginResponse.json();
      
      if (!pluginResponse.ok || !pluginData.plugin) {
        showError('Sync Failed', 'Could not load plugin information');
        return;
      }
      
      const pluginName = pluginData.plugin.pluginName;
      const result = await syncPluginFiles(pluginName);
      
      if (result.success) {
        showSuccess('Sync Complete', `Synchronized ${result.filesCount} files`);
        // Force reload files after sync
        await forceRefreshFiles(pluginId);
      } else {
        showError('Sync Failed', result.message);
      }    } catch {
      showError('Sync Failed', 'Network error during sync');} finally {
      setIsLoadingPlugin(false);
    }
  };
  // Send chat message function
  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim() || isChatLoading) return;

    console.log('🔵 Starting chat message send:', { message, userId, pluginId });

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };    // Use functional update to avoid stale closure issues
    setChatMessages(prev => {
      console.log('🔵 Adding user message to chat');
      return [...prev, userMessage];
    });
    
    setIsChatLoading(true);

    try {
      const chatApiUrl = '/api/chat/message';
      console.log('🔵 Chat API URL:', chatApiUrl);
      console.log('🔵 Environment check:', {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NODE_ENV: process.env.NODE_ENV
      });
      console.log('🔵 Sending request to:', chatApiUrl);
        const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          username: userId || 'anonymous',
          pluginName: pluginId || null
        }),
        // Add timeout to prevent hanging - extended for AI processing
        signal: AbortSignal.timeout(130000) // 130 second timeout (longer than backend's 120s)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔵 Received chat response:', data);

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,          sender: 'assistant',
          timestamp: new Date(),
          metadata: {
            type: data.type,
            contextLoaded: data.contextLoaded,
            filesAnalyzed: data.filesAnalyzed
          }
        };        setChatMessages(prev => {
          console.log('🔵 Adding assistant response to chat');
          return [...prev, assistantMessage];
        });
        
        // Dispatch event to trigger file refresh after AI chat completion
        if (typeof window !== 'undefined') {
          console.log('🔵 Dispatching ai-chat-completed event');
          window.dispatchEvent(new CustomEvent('ai-chat-completed', {
            detail: {
              success: true,
              pluginName: pluginId,
              userId: userId,
              message: data.message,
              type: data.type,
              contextLoaded: data.contextLoaded,
              filesAnalyzed: data.filesAnalyzed
            }
          }));
        }
      } else {
        console.log('🔴 Chat API returned error:', data.error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.error || 'Failed to get response from AI assistant',
          sender: 'assistant',
          timestamp: new Date()
        };        setChatMessages(prev => {
          console.log('🔵 Adding error message to chat');
          return [...prev, errorMessage];
        });
      }    } catch (error) {
      console.error('🔴 Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error && error.name === 'AbortError' 
          ? 'Request timed out. Please try again.'
          : 'Failed to communicate with AI assistant. Please try again.',
        sender: 'assistant',
        timestamp: new Date()
      };      setChatMessages(prev => {
        console.log('🔵 Adding network error message to chat');
        return [...prev, errorMessage];
      });
  
    } finally {
      console.log('🔵 Chat message send completed, setting loading to false');
      setIsChatLoading(false);
    }
  }, [isChatLoading, userId, pluginId]);
  // Clear chat function
  const clearChat = useCallback(() => {
    setChatMessages([{
      id: '1',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Writing and reviewing code\n• Debugging issues\n• Explaining concepts\n• Generating components\n\nWhat would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }]);
  }, []);

  // Listen for AI chat completion events to trigger file refresh
  useEffect(() => {
    const handleChatCompletion = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { success, pluginName, userId } = customEvent.detail || {};
      
      // Check if this chat was about the current plugin
      if (success && pluginName && userId) {
        const currentPluginId = pluginIdRef.current;
        const currentlyLoading = isLoadingRef.current;
        
        if (currentPluginId && !currentlyLoading) {
          console.log('AI chat completed, refreshing plugin files for:', pluginName);
          // Wait a moment for any backend processing to complete
          setTimeout(() => {
            forceRefreshFiles(currentPluginId);
          }, 1000);
        }
      }
    };

    const handlePluginFileUpdate = async () => {
      const currentPluginId = pluginIdRef.current;
      const currentlyLoading = isLoadingRef.current;
      
      if (currentPluginId && !currentlyLoading) {
        console.log('Plugin files updated, refreshing view');
        setTimeout(() => {
          forceRefreshFiles(currentPluginId);
        }, 500);
      }
    };

    // Listen for various events that might indicate file changes
    if (typeof window !== 'undefined') {
      window.addEventListener('ai-chat-completed', handleChatCompletion);
      window.addEventListener('plugin-files-updated', handlePluginFileUpdate);
      window.addEventListener('plugin-generated', handlePluginFileUpdate);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ai-chat-completed', handleChatCompletion);
        window.removeEventListener('plugin-files-updated', handlePluginFileUpdate);
        window.removeEventListener('plugin-generated', handlePluginFileUpdate);
      }
    };
  }, [forceRefreshFiles]);

  useEffect(() => {
    setMounted(true);
    
    // Listen for plugin save events
    const handlePluginSaved = (event: CustomEvent) => {
      const plugin = event.detail.plugin;
      showSuccess(
        'Plugin Saved!', 
        `${plugin.pluginName} has been saved to your account`
      );
    };    const handlePluginSaveError = (event: CustomEvent) => {
      const error = event.detail.error;
      showError(
        'Save Failed', 
        error || 'Failed to save plugin to database'
      );
    };    const handleFilesSynced = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { pluginName, filesCount } = customEvent.detail;
      console.log(`Files synced for ${pluginName}, ${filesCount} files`);
      
      // Temporarily disabled to prevent infinite loop
      // if (pluginId) {
      //   await loadPluginFiles(pluginId);
      //   console.log(`Reloaded ${filesCount} files after sync`);
      // }
    };if (typeof window !== 'undefined') {
      window.addEventListener('plugin-saved', handlePluginSaved as EventListener);
      window.addEventListener('plugin-save-error', handlePluginSaveError as EventListener);
      window.addEventListener('plugin-files-synced', handleFilesSynced);

      return () => {
        window.removeEventListener('plugin-saved', handlePluginSaved as EventListener);
        window.removeEventListener('plugin-save-error', handlePluginSaveError as EventListener);
        window.removeEventListener('plugin-files-synced', handleFilesSynced);
      };
    }
  }, [showSuccess, showError, pluginId]); // Removed loadPluginFiles from dependencies

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
  };



  const handleFileSave = (content: string) => {
    if (selectedFile) {
      console.log(`Saving file ${selectedFile.name}:`, content);
      // Implement actual file saving logic here
    }
  };

  // Manual recompile function
  const handleRecompilePlugin = async () => {
    if (!pluginId || !userId) return;
    
    setIsLoadingPlugin(true);
    try {
      // First get the plugin to extract the plugin name
      const pluginResponse = await fetch(`/api/plugins/${pluginId}`);
      const pluginData = await pluginResponse.json();
      
      if (!pluginResponse.ok || !pluginData.plugin) {
        showError('Recompile Failed', 'Could not load plugin information');
        return;
      }
      
      const pluginName = pluginData.plugin.pluginName;
      console.log('Starting recompilation for:', { userId, pluginName });
      
      const result = await recompilePlugin(userId, pluginName, 5);
      
      if (result.success) {
        showSuccess('Recompile Complete', `Plugin "${pluginName}" recompiled successfully!`);
        // Force reload files after recompile to show any changes
        await forceRefreshFiles(pluginId);
      } else {
        showError('Recompile Failed', result.error || 'Unknown compilation error');
      }
    } catch (error) {
      console.error('Error during recompilation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Recompile Failed', errorMessage);
    } finally {
      setIsLoadingPlugin(false);
    }
  };

  // Log server state for debugging (marks variables as used)
  useEffect(() => {
    if (serverDetails || serverCredentials) {
      console.log('Server state updated:', { 
        serverDetails: serverDetails ? `${serverDetails.name} (${serverDetails.status})` : null,
        serverCredentials: serverCredentials ? `${serverCredentials.panelUrl}` : null
      });
    }
  }, [serverDetails, serverCredentials]);

  // Navigation handler
  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex flex-col h-screen bg-background ${className}`}>
      {/* Debug Info */}
      <DebugInfo />
      
      {/* Development Mode Banner */}
      {isDevelopmentMode && (
        <div className="bg-orange-500 text-white px-4 py-1 text-sm text-center">
          🔧 Development Mode - Authentication Disabled
        </div>
      )}
      
      {/* Top Activity Bar */}
      <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          {/* Pegasus Logo/Brand */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigateToDashboard}
            className="h-8 px-3 text-base font-bold hover:bg-primary/10 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            title="Back to Dashboard"
          >
            <Image 
              src="/pegasus-logo.svg" 
              alt="Pegasus Logo" 
              width={20}
              height={20}
              className="w-5 h-5" 
            />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pegasus
            </span>
          </Button>
          
          {/* Separator */}
          <div className="h-4 w-px bg-border" />
          
          {/* Left sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="h-8 w-8 p-0"
          >
            {isLeftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          
          {/* Activity bar icons */}          <div className="flex items-center gap-1">
            <Button 
              variant={leftSidebarView === 'explorer' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Explorer"
              onClick={() => setLeftSidebarView('explorer')}
            >
              <LayoutTemplate className="w-4 h-4" />
            </Button>
            <Button 
              variant={leftSidebarView === 'plugins' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Plugin Manager"
              onClick={() => setLeftSidebarView('plugins')}
            >
              <Package className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Search">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Source Control">
              <GitBranch className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center - File breadcrumb */}
        <div className="flex-1 flex items-center justify-center">
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Pegasus</span>
              <span>/</span>
              <span className="text-foreground font-medium">{selectedFile.name}</span>
            </div>
          )}
        </div>        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {/* Sync button - only show if we have a plugin loaded */}
          {pluginId && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                title="Sync Files"
                onClick={handleSyncFiles}
                disabled={isLoadingPlugin}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingPlugin ? 'animate-spin' : ''}`} />
              </Button>              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                title="Refresh Files"
                onClick={() => forceRefreshFiles(pluginId)}
                disabled={isLoadingPlugin}
              >
                <RotateCcw className={`w-4 h-4 ${isLoadingPlugin ? 'animate-spin' : ''}`} />
              </Button>
              
              {/* Recompile button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                  title="Recompile Plugin"
                onClick={handleRecompilePlugin}
                disabled={isLoadingPlugin || isRecompiling}
              >
                <Hammer className={`w-4 h-4 ${(isLoadingPlugin || isRecompiling) ? 'animate-pulse' : ''}`} />
              </Button>
              
              {/* Auto-refresh toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${isAutoRefreshEnabled ? 'bg-blue-100 text-blue-600' : ''}`}
                title={isAutoRefreshEnabled ? "Stop Auto-refresh (2 min)" : "Start Auto-refresh (2 min)"}
                onClick={toggleAutoRefresh}
                disabled={isLoadingPlugin}
              >
                {isAutoRefreshEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              {/* Last refresh time indicator */}
              {lastRefreshTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 px-2">
                  <Clock className="w-3 h-3" />
                  <span title={`Last refreshed: ${lastRefreshTime.toLocaleString()}`}>
                    {lastRefreshTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
          
          {/* User Menu */}
          <div className="ml-2">
            <UserMenu variant="header" showEmail={false} />
          </div>
          
          {/* Right sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="h-8 w-8 p-0"
          >
            {isRightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </Button>
        </div>
      </div>      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">        {/* Left Sidebar - Chat */}
        {isLeftSidebarOpen && (
          <div className="w-96 flex-shrink-0 relative z-10 h-full">
            <ErrorBoundary fallback={
              <div className="flex flex-col h-full border-r bg-background">
                <div className="flex items-center justify-between p-3 border-b">
                  <h2 className="text-sm font-semibold">AI Assistant</h2>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Chat temporarily unavailable</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.reload()}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            }>              <ChatSidebar 
                messages={chatMessages}
                onSendMessage={sendChatMessage}
                onClearChat={clearChat}
                isLoading={isChatLoading}
              />
            </ErrorBoundary>
          </div>
        )}        {/* Center - Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-background">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {isLoadingPlugin ? (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center max-w-md">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h2 className="text-xl font-semibold mb-2">Loading Plugin Files</h2>
                  <p className="text-muted-foreground mb-6">
                    {pluginId ? `Loading files for plugin: ${pluginId}` : 'Fetching plugin data...'}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Connecting to plugin database</p>
                    <p>• Loading file structure</p>
                    <p>• Preparing Monaco editor</p>
                  </div>
                </div>
              </div>
            ) : selectedFile ? (
              <MonacoEditor
                file={{
                  name: selectedFile.name,
                  content: selectedFile.content || '',
                  language: selectedFile.language || 'javascript'
                }}
                onSave={handleFileSave}
                userId={userId}
                pluginName={pluginId} // pluginId is actually the plugin name
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20">
                <div className="text-center max-w-md">
                  <LayoutTemplate className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">Welcome to Pegasus</h2>
                  <p className="text-muted-foreground mb-6">
                    {pluginId 
                      ? "Plugin loaded! Select a file from the explorer to start editing." 
                      : "Select a file from the explorer to start editing, or use the AI assistant to generate new code."
                    }
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Browse files in the right panel</p>
                    <p>• Chat with AI assistant on the left</p>
                    <p>• Full Monaco editor with syntax highlighting</p>
                    <p>• VS Code-like interface and shortcuts</p>
                    <p>• Server console for Minecraft management</p>
                    {pluginId && pluginFiles.length > 0 && (
                      <p className="text-blue-600 font-medium">• {pluginFiles.length} files loaded and ready</p>
                    )}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-6 space-y-2">
                    {/* Console button removed */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>{/* Right Sidebar - File Explorer or Plugin Manager */}
        {isRightSidebarOpen && (
          <div className="w-80 flex-shrink-0 relative z-10 bg-background border-l">            {leftSidebarView === 'explorer' ? (
              <FileExplorer 
                onFileSelect={handleFileSelect}
                selectedFileId={selectedFile?.id}
                files={pluginFiles}
                isLoading={isLoadingPlugin}
              />
            ) : (              <PluginManager 
                onCreateNew={() => {
                  // Switch to chat to create new plugin (now on left sidebar)
                  setIsLeftSidebarOpen(true);
                }}
                onPluginSelect={(plugin) => {
                  // Load plugin files into editor
                  console.log('Selected plugin:', plugin);
                }}
              />
            )}
          </div>
        )}
      </div>      {/* Status Bar */}
      <div className="h-6 px-4 flex items-center justify-between text-xs bg-muted/80 border-t">
        <div className="flex items-center gap-4">
          <span>{isLoadingPlugin ? 'Loading...' : 'Ready'}</span>
          {isDevelopmentMode && (
            <>
              <span>•</span>
              <span className="text-orange-500 font-medium">Development Mode</span>
            </>
          )}
          {pluginId && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">Plugin: {pluginId}</span>
            </>
          )}
          {pluginFiles.length > 0 && (
            <>
              <span>•</span>
              <span className="text-green-600">{pluginFiles.length} files</span>
            </>
          )}
          {selectedFile && (
            <>
              <span>•</span>
              <span>{selectedFile.language?.toUpperCase()}</span>
              <span>•</span>
              <span>UTF-8</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          {userId && <ServerStatus userId={userId} />}
          <span>{userId ? `User: ${userId}` : 'Anonymous'}</span>
          <span>AI Assistant: Online</span>
        </div>
      </div>

      {/* Notifications */}
      <NotificationManager 
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Console components removed */}
    </div>
  );
}
