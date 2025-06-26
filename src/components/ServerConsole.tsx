'use client';

import { useState, useEffect, useRef } from 'react';
import { useServerManagement } from '@/hooks/useServerManagement';
import { ClientApiKeyModal } from './ClientApiKeyModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Upload, 
  Server, 
  Wifi, 
  WifiOff, 
  Clock, 
  HardDrive,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface ServerConsoleProps {
  userId: string;
  currentPlugin?: string;
  userEmail?: string;
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

export function ServerConsole({ userId, currentPlugin, userEmail, onLog, onServerCreated }: ServerConsoleProps) {
  const { 
    serverInfo, 
    automationStatus, 
    loading, 
    error, 
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
  const consoleRef = useRef<HTMLDivElement>(null);

  const addToConsole = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const logEntry = { message, type, timestamp: new Date() };
    setConsoleOutput(prev => [...prev, logEntry]);
    onLog?.(message, type);
    
    // Scroll to bottom
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    // Show initial welcome message
    addToConsole('🖥️ Pterodactyl Server Console Initialized', 'info');
    addToConsole('📡 Checking backend connectivity...', 'info');
    
    if (serverInfo) {
      if (serverInfo.hasServer) {
        addToConsole(`Connected to server: ${serverInfo.server?.name}`, 'success');
        addToConsole(`Server status: ${serverInfo.server?.status}`, 'info');
      } else {
        addToConsole('No server found for this user', 'warning');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverInfo]);

  useEffect(() => {
    if (automationStatus) {
      const features = automationStatus.features;
      addToConsole(`Automation Status: ${features.powerControl ? 'Full Control' : 'Limited'}`, 'info');
      if (!features.powerControl || !features.jarUpload) {
        addToConsole('Client API key required for full server control', 'warning');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationStatus]);

  useEffect(() => {
    if (error) {
      addToConsole(`⚠️ Backend Connection Error: ${error}`, 'error');
      addToConsole('💡 Make sure your backend server is running on the configured URL', 'warning');
      addToConsole('📝 Check your .env.local file for correct BACKEND_URL', 'info');
      addToConsole('🔧 Run "node check-backend.js" to test connectivity', 'info');
      addToConsole('📚 See TROUBLESHOOTING.md for detailed help', 'info');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Add initial welcome message on component mount
  useEffect(() => {
    addToConsole('🚀 Pterodactyl Server Console', 'info');
    addToConsole('Type "help" for available commands', 'info');
    addToConsole('Connecting to backend...', 'info');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServerAction = async (action: 'start' | 'stop' | 'restart') => {
    addToConsole(`Executing ${action} command...`, 'info');
    const result = await performServerAction(action);
    
    if (result.requiresApiKey) {
      setPendingAction(action);
      setShowApiKeyModal(true);
      addToConsole('Client API key required for this action', 'warning');
    } else if (result.success) {
      addToConsole(`Server ${action} command executed successfully`, 'success');
    } else {
      addToConsole(`Failed to ${action} server: ${result.error}`, 'error');
    }
  };

  const handleUploadPlugin = async () => {
    if (!currentPlugin) {
      addToConsole('No plugin selected for upload', 'error');
      return;
    }

    addToConsole(`Uploading plugin: ${currentPlugin}`, 'info');
    const result = await uploadPlugin(currentPlugin);
    
    if (result.requiresApiKey) {
      setPendingAction('upload');
      setShowApiKeyModal(true);
      addToConsole('Client API key required for plugin upload', 'warning');
    } else if (result.success) {
      addToConsole(`Plugin ${currentPlugin} uploaded successfully`, 'success');
      if (result.jarFile) {
        addToConsole(`JAR file: ${result.jarFile}`, 'info');
      }
    } else {
      addToConsole(`Failed to upload plugin: ${result.error}`, 'error');
    }
  };

  const handleCreateServer = async () => {
    if (!email) {
      addToConsole('Email is required to create a server', 'error');
      return;
    }

    addToConsole(`Creating server for ${email}...`, 'info');
    const result = await createServer(email);
    
    if (result.success) {
      addToConsole('Server created successfully!', 'success');
      addToConsole(`Server ID: ${result.server.id}`, 'info');
      addToConsole(`Server Name: ${result.server.name}`, 'info');
      if (result.credentials) {
        addToConsole(`Username: ${result.credentials.username}`, 'info');
        addToConsole(`Password: ${result.credentials.password}`, 'info');
        addToConsole(`Panel URL: ${result.credentials.panelUrl || 'http://109.71.252.4'}`, 'info');
        
        // Notify parent component about server creation
        onServerCreated?.(result.server, {
          ...result.credentials,
          panelUrl: result.credentials.panelUrl || 'http://109.71.252.4'
        });
      }
    } else {
      addToConsole(`Failed to create server: ${result.error}`, 'error');
    }
  };

  const handleApiKeySuccess = async () => {
    addToConsole('Client API key verified successfully', 'success');
    
    // Execute pending action if any
    if (pendingAction) {
      if (pendingAction === 'upload') {
        setTimeout(() => handleUploadPlugin(), 1000);
      } else if (['start', 'stop', 'restart'].includes(pendingAction)) {
        setTimeout(() => handleServerAction(pendingAction as 'start' | 'stop' | 'restart'), 1000);
      } else if (pendingAction === 'continue-deployment') {
        // Handle continue deployment action
        setTimeout(() => {
          if (serverInfo?.server && currentPlugin) {
            continueDeployment(currentPlugin, serverInfo.server.identifier);
          }
        }, 1000);
      }
    }
    setPendingAction('');
  };

  const executeCommand = () => {
    if (!commandInput.trim()) return;
    
    addToConsole(`> ${commandInput}`, 'info');
    
    // Simple command parsing
    const cmd = commandInput.toLowerCase().trim();
    
    if (cmd === 'status') {
      if (serverInfo?.hasServer) {
        addToConsole(`Server: ${serverInfo.server?.name}`, 'info');
        addToConsole(`Status: ${serverInfo.server?.status}`, 'info');
        addToConsole(`Memory: ${serverInfo.server?.limits.memory}MB`, 'info');
        addToConsole(`Disk: ${serverInfo.server?.limits.disk}MB`, 'info');
      } else {
        addToConsole('No server found', 'warning');
      }
    } else if (cmd === 'help') {
      addToConsole('📋 Available Commands:', 'info');
      addToConsole('  status     - Show server information', 'info');
      addToConsole('  refresh    - Reload server data', 'info');
      addToConsole('  clear      - Clear console output', 'info');
      addToConsole('  start      - Start the server', 'info');
      addToConsole('  stop       - Stop the server', 'info');
      addToConsole('  restart    - Restart the server', 'info');
      addToConsole('  upload <plugin> - Upload plugin JAR', 'info');
      addToConsole('  generate <name> <prompt> - Generate and deploy plugin', 'info');
      addToConsole('  debug      - Show debug information', 'info');
      addToConsole('  help       - Show this help message', 'info');
    } else if (cmd === 'debug') {
      addToConsole('🔍 Debug Information:', 'info');
      addToConsole(`Backend URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}`, 'info');
      addToConsole(`User ID: ${userId}`, 'info');
      addToConsole(`User Email: ${userEmail || 'Not provided'}`, 'info');
      addToConsole(`Current Plugin: ${currentPlugin || 'None'}`, 'info');
      addToConsole(`Server Info: ${serverInfo ? 'Loaded' : 'Not loaded'}`, 'info');
      addToConsole(`Automation Status: ${automationStatus ? 'Loaded' : 'Not loaded'}`, 'info');
      addToConsole(`Loading: ${loading ? 'Yes' : 'No'}`, 'info');
      addToConsole(`Error: ${error || 'None'}`, 'info');
    } else if (cmd === 'refresh') {
      loadServerInfo();
      addToConsole('Refreshing server information...', 'info');
    } else if (cmd === 'clear') {
      setConsoleOutput([]);
    } else if (cmd.startsWith('upload ')) {
      const pluginName = cmd.replace('upload ', '').trim();
      if (pluginName) {
        uploadPlugin(pluginName);
      } else {
        addToConsole('Usage: upload <plugin-name>', 'error');
      }
    } else if (cmd.startsWith('generate ')) {
      const parts = cmd.replace('generate ', '').trim().split(' ');
      if (parts.length >= 2) {
        const pluginName = parts[0];
        const prompt = parts.slice(1).join(' ');
        generateAndDeployPlugin(prompt, pluginName);
      } else {
        addToConsole('Usage: generate <plugin-name> <prompt>', 'error');
        addToConsole('Example: generate HelloWorld create a simple hello world plugin', 'info');
      }
    } else if (['start', 'stop', 'restart'].includes(cmd)) {
      handleServerAction(cmd as 'start' | 'stop' | 'restart');
    } else {
      addToConsole(`Unknown command: ${cmd}`, 'error');
      addToConsole('Type "help" for available commands', 'info');
    }
    
    setCommandInput('');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'starting': return 'text-yellow-500';
      case 'stopping': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'starting': return <Clock className="h-4 w-4 animate-pulse" />;
      case 'stopping': return <Clock className="h-4 w-4 animate-pulse" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const generateAndDeployPlugin = async (prompt: string, pluginName: string, complexity: number = 1) => {
    if (!userEmail) {
      addToConsole('Email is required for plugin generation with server integration', 'error');
      return;
    }

    addToConsole(`🚀 Starting plugin generation and deployment...`, 'info');
    addToConsole(`Plugin: ${pluginName}`, 'info');
    addToConsole(`Complexity: ${complexity}`, 'info');

    try {
      const response = await fetch('/api/plugin/generate-and-compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: userEmail,
          prompt,
          pluginName,
          autoCompile: true,
          complexity
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
          
          // If credentials are included, notify parent
          if (data.credentials) {
            onServerCreated?.(data.server, {
              ...data.credentials,
              panelUrl: data.credentials.panelUrl || 'http://109.71.252.4'
            });
          }
        }
        
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

  const continueDeployment = async (pluginName: string, serverId: string) => {
    try {
      const response = await fetch('/api/pterodactyl/continue-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pluginName,
          serverId
        })
      });

      const data = await response.json();

      if (data.success) {
        addToConsole(`🎉 ${data.message}`, 'success');
        if (data.jarUploaded) {
          addToConsole('📦 Plugin JAR uploaded successfully', 'success');
        }
        if (data.serverStarted) {
          addToConsole('🟢 Server started successfully', 'success');
        }
        setTimeout(loadServerInfo, 2000);
      } else {
        addToConsole(`❌ Deployment continuation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addToConsole('❌ Network error during deployment continuation', 'error');
      console.error('Continue deployment error:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <span className="font-semibold">Server Console</span>
          {loading && <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadServerInfo}
          className="text-white hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Server Status */}
      {serverInfo?.hasServer && (
        <div className="p-3 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(serverInfo.server?.status)}
              <span className="font-medium">{serverInfo.server?.name}</span>
              <span className={`text-sm ${getStatusColor(serverInfo.server?.status)}`}>
                {serverInfo.server?.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <HardDrive className="h-3 w-3" />
              {serverInfo.server?.limits.memory}MB
              <Cpu className="h-3 w-3 ml-2" />
              {serverInfo.server?.limits.cpu}%
            </div>
          </div>
        </div>
      )}

      {/* Server Actions */}
      <div className="p-3 border-b border-gray-700">
        {serverInfo?.hasServer ? (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => handleServerAction('start')}
              disabled={loading || serverInfo.server?.status === 'running'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              onClick={() => handleServerAction('restart')}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restart
            </Button>
            <Button
              size="sm"
              onClick={() => handleServerAction('stop')}
              disabled={loading || serverInfo.server?.status === 'offline'}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="h-3 w-3 mr-1" />
              Stop
            </Button>
            {currentPlugin && (
              <Button
                size="sm"
                onClick={handleUploadPlugin}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload {currentPlugin}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">No server found. Create one to get started:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email for server creation"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white text-sm"
              />
              <Button
                size="sm"
                onClick={handleCreateServer}
                disabled={loading || !email}
                className="bg-green-600 hover:bg-green-700"
              >
                <Server className="h-3 w-3 mr-1" />
                Create Server
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Console Output */}
      <div 
        ref={consoleRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-sm space-y-1 bg-black"
      >
        {consoleOutput.map((entry, index) => (
          <div 
            key={index} 
            className={`${
              entry.type === 'error' ? 'text-red-400' : 
              entry.type === 'success' ? 'text-green-400' : 
              entry.type === 'warning' ? 'text-yellow-400' : 
              'text-gray-300'
            }`}
          >
            <span className="text-gray-500 text-xs">
              {entry.timestamp.toLocaleTimeString()}
            </span>{' '}
            {entry.message}
          </div>
        ))}
      </div>

      {/* Command Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <span className="text-green-400 font-mono">$</span>
          <Input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
            placeholder="Type command..."
            className="flex-1 bg-gray-800 border-gray-600 text-white font-mono text-sm"
          />
        </div>
      </div>

      {/* API Key Modal */}
      <ClientApiKeyModal
        isOpen={showApiKeyModal}
        userId={userId}
        actionType={pendingAction === 'upload' ? 'plugin-upload' : 'server-control'}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={handleApiKeySuccess}
        onSubmit={submitClientApiKey}
      />
    </div>
  );
}
