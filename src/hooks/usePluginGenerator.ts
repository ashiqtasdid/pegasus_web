'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface FormData {
  prompt: string;
  userId: string;
  email?: string;
  pluginName?: string;
}

interface Message {
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: string;
    contextLoaded?: boolean;
    filesAnalyzed?: number;
  };
}

interface ProjectFile {
  path: string;
  content: string;
}

interface ProjectData {
  projectExists: boolean;
  pluginProject?: {
    projectName: string;
    minecraftVersion: string;
    dependencies?: string[];
    files: ProjectFile[];
  };
}

interface CurrentProject {
  userId: string;
  pluginName: string;
}

interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  requestCount?: number;
  tokensUsedThisRequest?: number;
}

interface ServerCredentials {
  panelUrl: string;
  username: string;
  password: string;
  email?: string;
}

interface ServerDetails {
  id: number;
  identifier: string;
  name: string;
  status: string;
}

interface Results {
  result: string;
  requestData: FormData & { autoCompile: boolean };
  tokenUsage?: TokenUsage;
  serverDetails?: ServerDetails;
  credentials?: ServerCredentials;
  needsClientApiKey?: boolean;
  pluginName?: string;
  success?: boolean;
  error?: string;
}

export function usePluginGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectData | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [serverCredentials, setServerCredentials] = useState<ServerCredentials | null>(null);
  const [serverDetails, setServerDetails] = useState<ServerDetails | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const loadProjectFiles = useCallback(async (userId: string, pluginName: string, isAutoRefresh = false) => {
    if (!userId || !pluginName) return;

    try {
      if (!isAutoRefresh) {
        console.log('Loading project files for:', { userId, pluginName });
      }

      const response = await fetch('/api/plugin/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pluginName })
      });

      if (!response.ok) {
        throw new Error(`Failed to load project files: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.files) {
        // Convert files object to project structure
        const files: ProjectFile[] = Object.entries(data.files).map(([path, content]) => ({
          path,
          content: content as string
        }));

        const projectData: ProjectData = {
          projectExists: true,
          pluginProject: {
            projectName: pluginName,
            minecraftVersion: data.metadata?.minecraftVersion || '1.20.1',
            dependencies: data.metadata?.dependencies || [],
            files
          }
        };

        setProjectFiles(projectData);
        setLastRefresh(new Date());
        
        if (!isAutoRefresh) {
          console.log('Loaded project files from MongoDB:', files.length, 'files');
          console.log('Plugin metadata:', data.metadata);
        }
        
        // Dispatch event for file refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-files-refreshed', {
            detail: {
              pluginName,
              userId,
              filesCount: files.length,
              isAutoRefresh,
              lastRefresh: new Date(),
              metadata: data.metadata
            }
          }));
        }
      } else {
        if (!isAutoRefresh) {
          console.log('No files found for plugin:', pluginName);
        }
        setProjectFiles({
          projectExists: false
        });
      }

    } catch (error) {
      if (!isAutoRefresh) {
        console.error('Error loading project files:', error);
      }
      setProjectFiles({
        projectExists: false
      });
    }
  }, []);

  // Setup auto-refresh functionality
  const startAutoRefresh = useCallback((userId: string, pluginName: string) => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval for 2 minutes (120000ms)
    refreshIntervalRef.current = setInterval(() => {
      loadProjectFiles(userId, pluginName, true);
    }, 120000); // 2 minutes

    console.log('Auto-refresh started for plugin:', pluginName, '(every 2 minutes)');
  }, [loadProjectFiles]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log('Auto-refresh stopped');
    }
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  const generatePlugin = useCallback(async (data: FormData) => {
    const requestData = {
      ...data,
      name: data.pluginName || undefined,
      autoCompile: true,
      complexity: 5
    };

    setIsLoading(true);
    setResults(null);
    setProjectFiles(null);

    try {
      // Follow the API documentation structure exactly
      const response = await fetch('/api/plugin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: data.prompt,
          userId: data.userId,
          email: data.email, // Include email as per documentation
          name: data.pluginName,
          autoCompile: true,
          complexity: 5
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Check for API documentation response structure
      const result = responseData.result || responseData.message || 'Plugin generation completed';
      const tokenUsage = responseData.tokenUsage;
      const needsClientApiKey = responseData.needsClientApiKey;
      const server = responseData.server;
      const pluginName = responseData.pluginName || data.pluginName;
      
      // Log token usage for analytics
      if (tokenUsage) {
        console.log('🔢 Token Usage Analytics:', tokenUsage);
        console.log(`📊 Tokens used this request: ${tokenUsage.tokensUsedThisRequest || tokenUsage.totalTokens}`);
        console.log(`📈 Total requests: ${tokenUsage.requestCount}`);
        
        // Dispatch token usage event for other components to listen to
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('token-usage-updated', {
            detail: {
              userId: data.userId,
              tokenUsage,
              operation: 'plugin-generation'
            }
          }));
        }
      }

      // Handle client API key requirement
      if (needsClientApiKey) {
        console.log('⚠️ Client API key required for full automation');
        // Dispatch event to show client API key modal
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('client-api-key-required', {
            detail: {
              userId: data.userId,
              context: 'plugin-generation'
            }
          }));
        }
      }
      
      const newResults = { 
        result, 
        requestData, 
        tokenUsage,
        needsClientApiKey,
        pluginName
      };
      setResults(newResults);

      // Extract server details and credentials if present (following API documentation structure)
      if (server) {
        console.log('🏗️ Server information received:', server);
        setServerDetails(server);
        
        // Dispatch server creation event with details
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('server-created', {
            detail: {
              server,
              userId: data.userId,
              needsClientApiKey
            }
          }));
        }
      }

      // Check if we have credentials in the response (may be embedded in the message)
      if (responseData.credentials) {
        console.log('🔐 Server credentials received');
        setServerCredentials(responseData.credentials);
      }

      // Store current project info
      const extractedPluginName = pluginName || extractPluginNameFromResult(result);
      const newProject = {
        userId: data.userId,
        pluginName: extractedPluginName
      };
      setCurrentProject(newProject);

      // Load project files if generation was successful
      if (result.includes('COMPILATION SUCCESSFUL') || 
          result.includes('Plugin project generated') ||
          result.includes('successfully') ||
          responseData.success !== false) {
        
        // Dispatch event to notify about plugin generation
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-generated', {
            detail: {
              pluginName: newProject.pluginName,
              userId: newProject.userId,
              success: true,
              server,
              needsClientApiKey
            }
          }));
        }
        
        console.log('✅ Plugin generated successfully:', newProject.pluginName);
        console.log('📁 Loading project files...');
        
        // Load files and start auto-refresh
        setTimeout(() => {
          loadProjectFiles(newProject.userId, newProject.pluginName);
          startAutoRefresh(newProject.userId, newProject.pluginName);
        }, 1000);
      }

    } catch (error) {
      console.error('Generation error:', error);
      // Handle error state following API documentation error format
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResults({
        result: `Error: ${errorMessage}`,
        requestData,
        success: false,
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadProjectFiles, startAutoRefresh]);
  
  const downloadJar = useCallback(async (userId: string, pluginName: string) => {
    try {
      // Check if JAR is available
      const response = await fetch(`/api/plugin/download-info/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
      const downloadInfo = await response.json();
      
      if (!response.ok || !downloadInfo.available) {
        alert('JAR file not available. Please ensure the plugin has been compiled successfully.');
        return;
      }
      
      // Start download
      const downloadUrl = `/api/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadInfo.jarFile || `${pluginName}.jar`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const downloadInstructions = useCallback(() => {
    const instructions = `
# Minecraft Plugin Installation Guide

## Generated Plugin Installation

1. **Locate your JAR file**: The compiled plugin JAR file should be in the project's target directory.

2. **Copy to server**: 
   - Navigate to your Minecraft server directory
   - Place the JAR file in the 'plugins' folder

3. **Restart server**: Stop and start your Minecraft server to load the plugin

4. **Verify installation**: Check the server console for plugin load messages

## Troubleshooting

- Ensure your server is running Spigot or Paper (Bukkit-compatible)
- Check that the Minecraft version matches your server version
- Review server logs for any error messages
- Make sure you have the required permissions to install plugins

## Plugin Information

Generated on: ${new Date().toLocaleString()}
Project Files: Available in the project directory
Build Command: mvn clean package

For support or modifications, refer to the generated source code.
    `.trim();

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minecraft-plugin-installation-guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const checkExistingProject = useCallback(async (pluginName: string, userId: string) => {
    if (!pluginName || !userId) {
      setProjectStatus(null);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/plugin/check-exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          pluginName: pluginName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check project existence');
      }

      const result = await response.json();
      
      if (result.exists) {
        const lastModified = result.lastModified ? new Date(result.lastModified).toLocaleString() : 'Unknown';
          if (result.hasCompiledJar) {
          setProjectStatus(`
            <div class="flex items-center p-2 bg-green-50 border border-green-200 rounded">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <div class="flex-1">
                <span class="text-green-800 font-medium">Project exists with compiled JAR</span>
                <div class="text-green-600 text-xs">Last modified: ${lastModified}</div>
                <div class="text-green-600 text-xs">Will recompile existing project instead of creating new one</div>
              </div>
              <button class="ml-2 text-green-600 hover:text-green-800 text-sm">
                <span class="text-xs">👁️ View</span>
              </button>
            </div>
          `);
        } else {
          setProjectStatus(`
            <div class="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <div class="flex-1">
                <span class="text-yellow-800 font-medium">Project exists but not compiled</span>
                <div class="text-yellow-600 text-xs">Last modified: ${lastModified}</div>
                <div class="text-yellow-600 text-xs">Will attempt to recompile existing project</div>
              </div>
              <button class="ml-2 text-yellow-600 hover:text-yellow-800 text-sm">
                <span class="text-xs">👁️ View</span>
              </button>
            </div>
          `);
        }      } else {
        setProjectStatus(`
          <div class="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
            <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span class="text-blue-800">New project - will generate fresh plugin files</span>
          </div>
        `);
      }
        } catch (error) {
      console.error('Error checking project existence:', error);
      setProjectStatus(`
        <div class="flex items-center p-2 bg-red-50 border border-red-200 rounded">
          <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          <span class="text-red-800 text-xs">Could not check project status</span>
        </div>      `);
    }
  }, [apiBase]);
  const sendChatMessage = useCallback(async (message: string) => {
    // Add user message immediately
    const userMessage: Message = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          username: currentProject?.userId || 'anonymous',
          pluginName: currentProject?.pluginName || null
        }),
        signal: AbortSignal.timeout(130000) // 130 second timeout (slightly longer than backend)
      });

      const data = await response.json();      if (data.success) {
        const assistantMessage: Message = {
          type: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: {
            type: data.type,
            contextLoaded: data.contextLoaded,
            filesAnalyzed: data.filesAnalyzed
          }
        };
        setChatMessages(prev => [...prev, assistantMessage]);
        
        // Dispatch event to trigger file refresh after AI chat completion
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ai-chat-completed', {
            detail: {
              success: true,
              pluginName: currentProject?.pluginName,
              userId: currentProject?.userId,
              message: data.message,
              type: data.type,
              contextLoaded: data.contextLoaded,
              filesAnalyzed: data.filesAnalyzed
            }
          }));
        }
      } else {
        const errorMessage: Message = {
          type: 'error',
          content: data.error || 'Failed to get response from AI assistant',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        type: 'error',
        content: 'Failed to communicate with AI assistant. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  }, [currentProject]);

  const clearChat = useCallback(() => {
    setChatMessages([]);
  }, []);

  const addChatMessage = useCallback((type: Message['type'], content: string, metadata?: Message['metadata']) => {
    const message: Message = {
      type,
      content,
      timestamp: new Date(),
      metadata
    };
    setChatMessages(prev => [...prev, message]);
  }, []);

  const extractPluginNameFromResult = (result: string): string => {
    const match = result.match(/Project: ([^\n]+)/);
    return match ? match[1].trim() : 'GeneratedPlugin';
  };
  const recompilePlugin = useCallback(async (userId: string, pluginName: string, maxFixAttempts: number = 5) => {
    if (!userId || !pluginName) {
      throw new Error('userId and pluginName are required');
    }

    setIsLoading(true);
    
    try {
      console.log('Starting recompilation for:', { userId, pluginName, maxFixAttempts });
      
      const response = await fetch(`${apiBase}/plugin/recompile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          pluginName,
          maxFixAttempts
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Recompilation failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const result = await response.json();
      console.log('Recompilation result:', result);

      // Add success message to chat
      if (result.success) {
        const message = `✅ **Plugin Recompiled Successfully!**\n\n` +
          `**Plugin:** ${pluginName}\n` +
          `**Status:** ${result.compilationStatus || 'Success'}\n` +
          (result.fixAttempts ? `**Fix Attempts:** ${result.fixAttempts}\n` : '') +
          (result.jarPath ? `**JAR Location:** ${result.jarPath}\n` : '') +
          `\n🎉 Your plugin has been successfully recompiled and is ready for use!`;
        
        addChatMessage('assistant', message, {
          type: 'recompile-success'
        });
      } else {
        const errorMessage = `❌ **Recompilation Failed**\n\n` +
          `**Plugin:** ${pluginName}\n` +
          `**Error:** ${result.error || 'Unknown error'}\n` +
          (result.compilationErrors ? `**Compilation Errors:**\n\`\`\`\n${result.compilationErrors}\n\`\`\`` : '') +
          `\n💡 Please check your code for syntax errors or try regenerating the plugin.`;
        
        addChatMessage('assistant', errorMessage, {
          type: 'recompile-error'
        });
      }

      return result;
    } catch (error) {
      console.error('Error during recompilation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during recompilation';
      
      addChatMessage('error', `❌ **Recompilation Error**\n\n${errorMessage}\n\n💡 Please try again or check your network connection.`, {
        type: 'recompile-error'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, addChatMessage]);

  return {
    isLoading,
    results,
    currentProject,
    projectFiles,
    chatMessages,
    projectStatus,
    lastRefresh,
    serverCredentials,
    serverDetails,
    generatePlugin,
    downloadJar,
    downloadInstructions,
    loadProjectFiles,
    checkExistingProject,
    sendChatMessage,
    clearChat,
    addChatMessage,
    startAutoRefresh,
    stopAutoRefresh,
    recompilePlugin
  };
}
