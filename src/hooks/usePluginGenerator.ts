'use client';

import { useState, useCallback } from 'react';

interface FormData {
  prompt: string;
  userId: string;
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

interface Results {
  result: string;
  requestData: FormData & { autoCompile: boolean };
}

export function usePluginGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [currentProject, setCurrentProject] = useState<CurrentProject | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectData | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Function to extract plugin information from generation result
  const extractPluginInfo = useCallback((result: string, prompt: string) => {
    // Extract Minecraft version (look for common patterns)
    const minecraftVersionMatch = result.match(/(?:minecraft|version|api)[\s:]*(\d+\.\d+(?:\.\d+)?)/i);
    const minecraftVersion = minecraftVersionMatch ? minecraftVersionMatch[1] : '1.20.1';
    
    // Extract main class (look for common patterns)
    const mainClassMatch = result.match(/main[:\s]+([A-Za-z][A-Za-z0-9_.]*)/i) || 
                          result.match(/class\s+([A-Za-z][A-Za-z0-9_]*)\s+extends\s+JavaPlugin/i);
    const mainClass = mainClassMatch ? mainClassMatch[1] : 'Main';
    
    // Extract API version
    const apiVersionMatch = result.match(/api-version[:\s]*(['""]?)(\d+\.\d+)\1/i);
    const apiVersion = apiVersionMatch ? apiVersionMatch[2] : '1.20';
    
    // Determine dependencies based on prompt content
    const dependencies: string[] = [];
    if (prompt.toLowerCase().includes('vault')) {
      dependencies.push('Vault');
    }
    if (prompt.toLowerCase().includes('worldedit')) {
      dependencies.push('WorldEdit');
    }
    if (prompt.toLowerCase().includes('citizens')) {
      dependencies.push('Citizens');
    }
    
    return {
      minecraftVersion,
      mainClass,
      apiVersion,
      dependencies,
    };
  }, []);
  // Function to extract files from generation result
  const extractFilesFromResult = useCallback((result: string, pluginName: string) => {
    const files: Array<{ path: string; content: string; type: string }> = [];
    
    console.log('Extracting files from result. Result length:', result.length);
    
    try {
      // Look for file markers in the result
      const filePattern = /---\s*FILE:\s*([^\n]+)\s*---\n([\s\S]*?)(?=---\s*FILE:|$)/g;
      let match;
      let fileCount = 0;
      
      while ((match = filePattern.exec(result)) !== null) {
        fileCount++;
        const filePath = match[1].trim();
        const content = match[2].trim();
        
        console.log(`Found file ${fileCount}: ${filePath} (content length: ${content.length})`);
        
        if (filePath && content) {
          files.push({
            path: filePath,
            content: content,
            type: filePath.endsWith('.java') ? 'java' : 
                  filePath.endsWith('.yml') ? 'yaml' : 
                  filePath.endsWith('.xml') ? 'xml' : 'text'
          });
        }
      }
      
      console.log(`Total files extracted: ${files.length}`);
      
      // If no files found with FILE markers, try to extract main class
      if (files.length === 0) {
        console.log('No files found with FILE markers, trying to extract Java class');
        // Look for Java class content
        const javaClassPattern = /public class\s+(\w+)[\s\S]*?^}/gm;
        const javaMatch = javaClassPattern.exec(result);
        
        if (javaMatch) {
          const className = javaMatch[1];
          const content = javaMatch[0];
          console.log(`Found Java class: ${className}`);
          files.push({
            path: `src/main/java/com/example/${pluginName.toLowerCase()}/${className}.java`,
            content: content,
            type: 'java'
          });
        }
        
        // Look for plugin.yml content
        const pluginYmlPattern = /name:\s*[\w\s]+\nversion:[\s\S]*?(?=\n\n|\n[^\s]|$)/g;
        const ymlMatch = pluginYmlPattern.exec(result);
        
        if (ymlMatch) {
          console.log('Found plugin.yml content');
          files.push({
            path: 'src/main/resources/plugin.yml',
            content: ymlMatch[0],
            type: 'yaml'
          });
        }
      }
    } catch (error) {
      console.error('Error extracting files from result:', error);
    }
    
    console.log('Final extracted files:', files.map(f => ({ path: f.path, contentLength: f.content.length })));
    return files;
  }, []);
  // Function to save plugin to database
  const savePluginToDatabase = useCallback(async (
    project: CurrentProject, 
    prompt: string, 
    generationResult: string
  ) => {
    try {
      console.log('Saving plugin to database:', project.pluginName);
      
      // Extract plugin information from the generation result
      const pluginInfo = extractPluginInfo(generationResult, prompt);
      
      // Extract files from the generation result
      const extractedFiles = extractFilesFromResult(generationResult, project.pluginName);
      
      console.log('Plugin info extracted:', pluginInfo);
      console.log('Files extracted for database save:', extractedFiles.length);
      
      const pluginData = {
        pluginName: project.pluginName,
        description: prompt,
        minecraftVersion: pluginInfo.minecraftVersion,
        dependencies: pluginInfo.dependencies,
        files: extractedFiles, // Now includes the actual generated files
        metadata: {
          mainClass: pluginInfo.mainClass,
          version: '1.0.0',
          apiVersion: pluginInfo.apiVersion,
        },
      };

      console.log('Sending plugin data to API:', {
        pluginName: pluginData.pluginName,
        filesCount: pluginData.files.length,
        filesPaths: pluginData.files.map(f => f.path)
      });

      const response = await fetch('/api/plugins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pluginData),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Plugin saved to database successfully:', result.plugin?._id);
        console.log('Plugin data in database:', {
          id: result.plugin?._id,
          name: result.plugin?.pluginName,
          filesCount: result.plugin?.files?.length || 0
        });
        // Dispatch custom event for notifications
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-saved', {
            detail: { plugin: result.plugin }
          }));
        }
      } else {
        console.error('❌ Failed to save plugin:', result.error);
        // Dispatch error event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-save-error', {
            detail: { error: result.error }
          }));        }
      }
    } catch (error) {
      console.error('Error saving plugin to database:', error);
      // Dispatch error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('plugin-save-error', {
          detail: { error: 'Network error saving plugin' }
        }));
      }    }
  }, [extractPluginInfo, extractFilesFromResult]);

  const loadProjectFiles = useCallback(async (userId: string, pluginName: string) => {
    if (!userId || !pluginName) return;

    try {
      const response = await fetch(`${apiBase}/plugin/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pluginName })
      });

      if (!response.ok) {
        throw new Error(`Failed to load project files: ${response.statusText}`);
      }

      const projectData = await response.json();
      setProjectFiles(projectData);

    } catch (error) {
      console.error('Error loading project files:', error);
    }
  }, [apiBase]);

  const generatePlugin = useCallback(async (data: FormData) => {
    const requestData = {
      ...data,
      name: data.pluginName || undefined,
      autoCompile: true
    };

    setIsLoading(true);
    setResults(null);
    setProjectFiles(null);

    try {
      const response = await fetch(`${apiBase}/plugin/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.text();
      
      const newResults = { result, requestData };
      setResults(newResults);

      // Store current project info
      const extractedPluginName = data.pluginName || extractPluginNameFromResult(result);
      const newProject = {
        userId: data.userId,
        pluginName: extractedPluginName
      };
      setCurrentProject(newProject);      // Load project files if generation was successful
      if (result.includes('COMPILATION SUCCESSFUL') || result.includes('Plugin project generated')) {
        // Save plugin to database
        await savePluginToDatabase(newProject, data.prompt, result);
        
        // Dispatch event to notify about plugin generation
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('plugin-generated', {
            detail: {
              pluginName: newProject.pluginName,
              userId: newProject.userId,
              success: true
            }
          }));
        }
        
        setTimeout(() => {
          loadProjectFiles(newProject.userId, newProject.pluginName);
        }, 1000);
      }

    } catch (error) {
      console.error('Generation error:', error);
      // Handle error state
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResults({
        result: `Error: ${errorMessage}`,
        requestData
      });    } finally {
      setIsLoading(false);
    }
  }, [apiBase, loadProjectFiles, savePluginToDatabase]);

  const downloadJar = useCallback(async (userId: string, pluginName: string) => {
    try {
      // Check if JAR is available
      const response = await fetch(`${apiBase}/plugin/download-info/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`);
      const downloadInfo = await response.json();
      
      if (!response.ok || !downloadInfo.available) {
        alert('JAR file not available. Please ensure the plugin has been compiled successfully.');
        return;
      }
      
      // Start download
      const downloadUrl = `${apiBase}/plugin/download/${encodeURIComponent(userId)}/${encodeURIComponent(pluginName)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadInfo.jarFile;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [apiBase]);

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

    try {
      const response = await fetch(`${apiBase}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          username: currentProject?.userId || 'anonymous',
          pluginName: currentProject?.pluginName || null
        })
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
  }, [apiBase, currentProject]);

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

  return {
    isLoading,
    results,
    currentProject,
    projectFiles,
    chatMessages,
    projectStatus,
    generatePlugin,
    downloadJar,
    downloadInstructions,
    loadProjectFiles,
    checkExistingProject,
    sendChatMessage,
    clearChat,
    addChatMessage
  };
}
