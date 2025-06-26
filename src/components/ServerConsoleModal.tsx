'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useServerManagement } from '@/hooks/useServerManagement';
import { ClientApiKeyModal } from './ClientApiKeyModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Upload, 
  Server, 
  Wifi, 
  WifiOff, 
  HardDrive,
  Cpu,
  RefreshCw,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ServerConsoleModalProps {
  userId: string;
  currentPlugin?: string;
  userEmail?: string;
  isOpen: boolean;
  onClose: () => void;
  onLog?: (message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  onServerCreated?: (serverDetails: {
    id: number;
    identifier: string;
    name: string;
    status: string;
  }, credentials: {
    panelUrl: string;
    username: string;
    password: string;
    email?: string;
  }) => void;
}

export function ServerConsoleModal({ 
  userId, 
  currentPlugin, 
  // userEmail, // Currently unused but kept for future use
  isOpen, 
  onClose, 
  onLog, 
  onServerCreated 
}: ServerConsoleModalProps) {
  const { 
    serverInfo, 
    automationStatus, 
    loading, 
    // error, // Currently unused but available for future error handling
    loadServerInfo, 
    performServerAction, 
    submitClientApiKey, 
    uploadPlugin, 
    createServer 
  } = useServerManagement(userId);

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<Array<{ message: string; type: string; timestamp: Date }>>([]);
  const [commandInput, setCommandInput] = useState('');
  const [email, setEmail] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [showPluginGenerator, setShowPluginGenerator] = useState(false);
  const [pluginFormData, setPluginFormData] = useState({
    prompt: '',
    pluginName: '',
    complexity: 5
  });
  const consoleRef = useRef<HTMLDivElement>(null);

  const addToConsole = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const logEntry = { message, type, timestamp: new Date() };
    setConsoleOutput(prev => [...prev, logEntry]);
    onLog?.(message, type);
    
    // Scroll to bottom
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 100);
  }, [onLog]);

  useEffect(() => {
    if (isOpen) {
      // Clear console and show welcome message when modal opens
      setConsoleOutput([]);
      addToConsole('🖥️ Pterodactyl Server Console Initialized', 'info');
      addToConsole('📡 Checking backend connectivity...', 'info');
      
      if (serverInfo) {
        if (serverInfo.hasServer) {
          addToConsole(`Connected to server: ${serverInfo.server?.name}`, 'success');
          addToConsole(`Server status: ${serverInfo.server?.status}`, 'info');
          
          // Display panel credentials if available
          if (serverInfo.credentials) {
            addToConsole('🔐 Panel Login Credentials Available:', 'info');
            addToConsole(`   Panel URL: ${serverInfo.credentials.panelUrl}`, 'info');
            addToConsole(`   Username: ${serverInfo.credentials.username}`, 'info');
            addToConsole(`   Password: ${serverInfo.credentials.password}`, 'info');
            addToConsole('💡 Use these credentials to login and get your Client API key', 'warning');
          }
        } else {
          addToConsole('No server found for this user', 'warning');
        }
      }
    }
  }, [isOpen, serverInfo, addToConsole]);

  useEffect(() => {
    if (automationStatus && automationStatus.features && isOpen) {
      const features = automationStatus.features;
      addToConsole(`Automation Status: ${features.powerControl ? 'Full Control' : 'Limited'}`, 'info');
      if (!features.powerControl || !features.jarUpload) {
        addToConsole('Client API key required for full server control', 'warning');
        addToConsole('Click "Setup API Key" button to configure access', 'info');
        addToConsole('This enables server power control and plugin uploads', 'info');
      } else {
        addToConsole('✅ Client API key is configured and active', 'success');
        addToConsole('Full server control and plugin upload available', 'info');
      }
    }
  }, [automationStatus, isOpen, addToConsole]);

  const handleServerAction = async (action: string) => {
    if (!automationStatus?.features?.powerControl) {
      addToConsole('Client API key required for server control', 'error');
      setPendingAction(action);
      setShowApiKeyModal(true);
      return;
    }

    const validActions = ['start', 'stop', 'restart'] as const;
    type ServerAction = typeof validActions[number];
    
    if (!validActions.includes(action as ServerAction)) {
      addToConsole(`Invalid server action: ${action}`, 'error');
      return;
    }

    addToConsole(`Executing server action: ${action}`, 'info');
    try {
      const result = await performServerAction(action as ServerAction);
      if (result.success) {
        addToConsole(`Server action completed: ${action}`, 'success');
      } else {
        addToConsole(`Server action failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addToConsole(`Error executing action: ${error}`, 'error');
    }
  };

  const handleCreateServer = async () => {
    if (!email.trim()) {
      addToConsole('Email is required for server creation', 'error');
      return;
    }

    addToConsole('Creating new Minecraft server...', 'info');
    try {
      const result = await createServer(email);
      if (result.success && result.server && result.credentials) {
        addToConsole(`Server created successfully: ${result.server.name}`, 'success');
        addToConsole(`Panel URL: ${result.credentials.panelUrl}`, 'info');
        addToConsole(`Username: ${result.credentials.username}`, 'info');
        onServerCreated?.(result.server, result.credentials);
      } else {
        addToConsole(`Server creation failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addToConsole(`Error creating server: ${error}`, 'error');
    }
  };

  const handleUploadPlugin = async () => {
    if (!currentPlugin) {
      addToConsole('No plugin selected for upload', 'error');
      return;
    }

    if (!automationStatus?.features?.jarUpload) {
      addToConsole('Client API key required for plugin upload', 'error');
      setPendingAction('upload');
      setShowApiKeyModal(true);
      return;
    }

    addToConsole(`Uploading plugin: ${currentPlugin}`, 'info');
    try {
      const result = await uploadPlugin(currentPlugin);
      if (result.success) {
        addToConsole('Plugin uploaded successfully', 'success');
      } else {
        addToConsole(`Plugin upload failed: ${result.error}`, 'error');
      }
    } catch (error) {
      addToConsole(`Error uploading plugin: ${error}`, 'error');
    }
  };

  const handleGeneratePlugin = async () => {
    if (!pluginFormData.prompt.trim()) {
      addToConsole('Please enter a plugin description', 'error');
      return;
    }

    if (!email.trim()) {
      addToConsole('Email is required for plugin generation with server integration', 'error');
      return;
    }

    addToConsole(`🚀 Starting plugin generation...`, 'info');
    addToConsole(`Plugin: ${pluginFormData.pluginName || 'Auto-generated name'}`, 'info');
    addToConsole(`Complexity: ${pluginFormData.complexity}/10`, 'info');

    try {
      const response = await fetch('/api/plugin/generate-and-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: email,
          prompt: pluginFormData.prompt,
          pluginName: pluginFormData.pluginName || undefined,
          autoCompile: true,
          complexity: pluginFormData.complexity
        })
      });

      const data = await response.json();

      if (data.success !== false) {
        addToConsole(`✅ ${data.result}`, 'success');
        
        if (data.needsClientApiKey) {
          addToConsole('🔑 Client API key required for server management', 'warning');
          setShowApiKeyModal(true);
          setPendingAction('continue-deployment');
        }
        
        if (data.server) {
          addToConsole(`📋 Server Details:`, 'info');
          addToConsole(`  • ID: ${data.server.id}`, 'info');
          addToConsole(`  • Name: ${data.server.name}`, 'info');
          addToConsole(`  • Status: ${data.server.status}`, 'info');
          
          if (data.credentials) {
            onServerCreated?.(data.server, {
              ...data.credentials,
              panelUrl: data.credentials.panelUrl || 'http://109.71.252.4'
            });
          }
        }

        if (data.tokenUsage) {
          addToConsole(`🎯 Token Usage: ${data.tokenUsage.totalTokens} tokens`, 'info');
        }
        
        // Reset form and close generator
        setPluginFormData({ prompt: '', pluginName: '', complexity: 5 });
        setShowPluginGenerator(false);
        
        // Refresh server info
        setTimeout(loadServerInfo, 2000);
      } else {
        addToConsole(`❌ Plugin generation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      const errorMsg = 'Network error during plugin generation';
      addToConsole(`❌ ${errorMsg}`, 'error');
      console.error('Plugin generation error:', err);
    }
  };

  const handleApiKeySubmit = async (apiKey: string) => {
    addToConsole('Submitting client API key...', 'info');
    try {
      const result = await submitClientApiKey(apiKey);
      if (result.success) {
        addToConsole('Client API key configured successfully', 'success');
        setShowApiKeyModal(false);
        
        // Execute pending action if any
        if (pendingAction) {
          if (pendingAction === 'upload') {
            await handleUploadPlugin();
          } else if (pendingAction === 'continue-deployment') {
            // Continue deployment after API key is set
            addToConsole('🔄 Continuing plugin deployment...', 'info');
            setTimeout(loadServerInfo, 1000);
          } else {
            await handleServerAction(pendingAction);
          }
          setPendingAction('');
        }
        
        return { success: true };
      } else {
        addToConsole(`API key configuration failed: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMsg = `Error configuring API key: ${error}`;
      addToConsole(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    
    addToConsole(`> ${command}`, 'info');
    
    // Handle built-in commands
    switch (command.toLowerCase()) {
      case 'clear':
        setConsoleOutput([]);
        addToConsole('Console cleared', 'info');
        break;
      case 'help':
        addToConsole('Available commands:', 'info');
        addToConsole('  clear - Clear console output', 'info');
        addToConsole('  status - Show server status', 'info');
        addToConsole('  info - Show server information', 'info');
        addToConsole('  apikey - Show API key setup instructions', 'info');
        addToConsole('  credentials - Show panel login credentials', 'info');
        addToConsole('  generate - Open plugin generator', 'info');
        break;
      case 'apikey':
        addToConsole('🔑 Client API Key Setup:', 'info');
        addToConsole('1. Click the "Setup API Key" button above', 'info');
        addToConsole('2. Follow the instructions to get your API key from Pterodactyl panel', 'info');
        addToConsole('3. Enter the API key when prompted', 'info');
        addToConsole('4. This enables server power control and plugin uploads', 'info');
        
        // Show panel credentials if available
        if (serverInfo?.credentials) {
          addToConsole('', 'info');
          addToConsole('🔐 Your Panel Login Credentials:', 'info');
          addToConsole(`   Panel URL: ${serverInfo.credentials.panelUrl}`, 'info');
          addToConsole(`   Username: ${serverInfo.credentials.username}`, 'info');
          addToConsole(`   Password: ${serverInfo.credentials.password}`, 'info');
        }
        
        if (automationStatus?.features?.powerControl) {
          addToConsole('✅ Your API key is already configured!', 'success');
        } else {
          addToConsole('⚠️ API key not configured - limited functionality available', 'warning');
        }
        break;
      case 'credentials':
        if (serverInfo?.credentials) {
          addToConsole('🔐 Panel Login Credentials:', 'info');
          addToConsole(`   Panel URL: ${serverInfo.credentials.panelUrl}`, 'info');
          addToConsole(`   Username: ${serverInfo.credentials.username}`, 'info');
          addToConsole(`   Password: ${serverInfo.credentials.password}`, 'info');
          addToConsole('💡 Use these credentials to login and get your Client API key', 'info');
        } else {
          addToConsole('No panel credentials available', 'warning');
          addToConsole('Create a server to get login credentials', 'info');
        }
        break;
      case 'status':
        if (serverInfo?.server) {
          addToConsole(`Server Status: ${serverInfo.server.status}`, 'info');
        } else {
          addToConsole('No server information available', 'warning');
        }
        break;
      case 'info':
        if (serverInfo?.server) {
          addToConsole(`Server: ${serverInfo.server.name}`, 'info');
          addToConsole(`ID: ${serverInfo.server.id}`, 'info');
          addToConsole(`Status: ${serverInfo.server.status}`, 'info');
        } else {
          addToConsole('No server information available', 'warning');
        }
        break;
      case 'generate':
        addToConsole('🚀 Opening plugin generator...', 'info');
        setShowPluginGenerator(true);
        break;
      default:
        addToConsole(`Unknown command: ${command}. Type 'help' for available commands.`, 'warning');
    }
    
    setCommandInput('');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Panel Credentials Card - Top Right of Screen */}
      {serverInfo?.credentials && (
        <div className="fixed top-4 right-4 z-[60] p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl text-sm max-w-sm">
          <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
            🔐 Panel Login Info
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Card will auto-hide when modal closes */}}
              className="h-5 w-5 p-0 ml-auto opacity-50 hover:opacity-100"
              title="This card shows when the server console is open"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400 font-medium">URL:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-blue-600 dark:text-blue-400 text-xs break-all">
                {serverInfo.credentials.panelUrl}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Username:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs">
                {serverInfo.credentials.username}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Password:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs">
                {serverInfo.credentials.password}
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic border-t border-slate-200 dark:border-slate-600 pt-2">
            💡 Use these credentials to login and get your Client API key
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className={`bg-background border shadow-2xl transition-all duration-300 ${
          isMaximized 
            ? 'w-full h-full max-w-none max-h-none' 
            : 'w-full max-w-4xl h-[600px] max-h-[80vh]'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              <div>
                <CardTitle className="text-lg">Server Console</CardTitle>
                <CardDescription>
                  Manage your Minecraft server and plugins
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8 p-0"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full">
            {/* Server Status Bar */}
            <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {serverInfo?.hasServer ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {serverInfo?.hasServer ? 'Connected' : 'No Server'}
                  </span>
                </div>
                
                {serverInfo?.server && (
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span className="text-sm">{serverInfo.server.name}</span>
                    <span className={`text-sm font-medium ${getStatusColor(serverInfo.server.status)}`}>
                      {serverInfo.server.status}
                    </span>
                  </div>
                )}

                {/* API Key Status Indicator */}
                <div className="flex items-center gap-2">
                  {automationStatus?.features?.powerControl ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">API Key Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-orange-600">API Key Required</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadServerInfo}
                  disabled={loading}
                  className="h-8"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Main Console Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Console Output */}
              <div 
                ref={consoleRef}
                className="flex-1 p-4 overflow-y-auto bg-black text-green-400 font-mono text-sm"
                style={{ minHeight: '200px' }}
              >
                {consoleOutput.map((entry, index) => (
                  <div key={index} className="mb-1 flex gap-2">
                    <span className="text-gray-500 text-xs">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`${
                      entry.type === 'error' ? 'text-red-400' :
                      entry.type === 'warning' ? 'text-yellow-400' :
                      entry.type === 'success' ? 'text-green-400' :
                      'text-gray-300'
                    }`}>
                      {entry.message}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div className="text-blue-400 animate-pulse">
                    Loading...
                  </div>
                )}
              </div>

              {/* Command Input */}
              <div className="p-4 border-t bg-muted/20">
                <div className="flex gap-2">
                  <span className="text-green-400 font-mono text-sm flex items-center">
                    root@pegasus:~$
                  </span>
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCommand(commandInput);
                      }
                    }}
                    placeholder="Enter command..."
                    className="flex-1 bg-black border-gray-600 text-green-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="p-4 border-t bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Client API Key Management */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">API Key Setup</h4>                  <div className="space-y-2">
                    {automationStatus?.features?.powerControl ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        API Key Configured
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        API Key Required
                      </div>
                    )}

                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKeyModal(true)}
                      className="w-full"
                    >
                      {automationStatus?.features?.powerControl ? 'Update' : 'Setup'} API Key
                    </Button>
                  </div>
                </div>

                {/* Server Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Server Control</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleServerAction('start')}
                      disabled={loading || !serverInfo?.hasServer}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleServerAction('stop')}
                      disabled={loading || !serverInfo?.hasServer}
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleServerAction('restart')}
                      disabled={loading || !serverInfo?.hasServer}
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restart
                    </Button>
                  </div>
                </div>

                {/* Plugin Management */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Plugin Management</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadPlugin}
                      disabled={loading || !currentPlugin || !serverInfo?.hasServer}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload {currentPlugin || 'Plugin'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPluginGenerator(true)}
                      disabled={loading}
                      className="w-full"
                    >
                      <Terminal className="w-4 h-4 mr-1" />
                      Generate Plugin
                    </Button>
                  </div>
                </div>
              </div>

              {/* Server Creation Section */}
              {!serverInfo?.hasServer && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Create New Server</h4>
                  <div className="flex gap-2">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email for server creation"
                      className="flex-1"
                      size={undefined}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateServer}
                      disabled={loading || !email.trim()}
                    >
                      <Server className="w-4 h-4 mr-1" />
                      Create
                    </Button>
                  </div>
                </div>
              )}

              {/* Plugin Generator Section */}
              {showPluginGenerator && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Generate Plugin</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPluginGenerator(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Plugin Description *</label>
                      <textarea
                        value={pluginFormData.prompt}
                        onChange={(e) => setPluginFormData(prev => ({ ...prev, prompt: e.target.value }))}
                        rows={3}
                        className="w-full px-2 py-1 text-xs border rounded"
                        placeholder="Describe your Minecraft plugin. E.g., 'Create a teleportation plugin with /sethome and /home commands'"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Plugin Name</label>
                        <Input
                          value={pluginFormData.pluginName}
                          onChange={(e) => setPluginFormData(prev => ({ ...prev, pluginName: e.target.value }))}
                          placeholder="MyPlugin"
                          className="text-xs h-8"
                          size={undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Complexity: {pluginFormData.complexity}/10</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={pluginFormData.complexity}
                          onChange={(e) => setPluginFormData(prev => ({ ...prev, complexity: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {!email && (
                      <div>
                        <label className="block text-xs font-medium mb-1">Email for Server Creation</label>
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="text-xs h-8"
                          size={undefined}
                        />
                      </div>
                    )}
                    
                    <Button
                      onClick={handleGeneratePlugin}
                      disabled={loading || !pluginFormData.prompt.trim() || !email.trim()}
                      className="w-full h-8 text-xs"
                      size="sm"
                    >
                      {loading ? 'Generating...' : 'Generate & Deploy Plugin'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Information */}
              {(serverInfo || automationStatus) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {serverInfo?.server && (
                      <>
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-blue-500" />
                          <span>ID: {serverInfo.server.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-purple-500" />
                          <span>Status: {serverInfo.server.status}</span>
                        </div>
                      </>
                    )}
                    {automationStatus && (
                      <>
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-green-500" />
                          <span>Power: {automationStatus?.features?.powerControl ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span>Upload: {automationStatus?.features?.jarUpload ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <ClientApiKeyModal
          isOpen={showApiKeyModal}
          userId={userId}
          actionType={pendingAction || 'server control'}
          onClose={() => {
            setShowApiKeyModal(false);
            setPendingAction('');
          }}
          onSuccess={() => {
            setShowApiKeyModal(false);
            setPendingAction('');
          }}
          onSubmit={handleApiKeySubmit}
        />
      )}
    </>
  );
}
