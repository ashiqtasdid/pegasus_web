import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Zap, 
  HardDrive, 
  Cpu, 
  Activity,
  RefreshCw,
  Terminal,
  FolderOpen
} from 'lucide-react';
import { usePterodactylServer } from '@/hooks/usePterodactylServer';
import { Server as ServerType, ServerResources } from '@/types/pterodactyl';

interface EnhancedServerManagerProps {
  serverId: number;
  clientApiKey?: string;
  onApiKeyChange?: (apiKey: string) => void;
}

export const EnhancedServerManager: React.FC<EnhancedServerManagerProps> = ({
  serverId,
  clientApiKey,
  onApiKeyChange
}) => {
  const [serverData, setServerData] = useState<ServerType | null>(null);
  const [resourceData, setResourceData] = useState<ServerResources | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'console' | 'files'>('overview');
  const [localApiKey, setLocalApiKey] = useState(clientApiKey || '');
  
  const {
    loading,
    error,
    getServerDetails,
    getServerResources,
    startServer,
    stopServer,
    restartServer,
    killServer
  } = usePterodactylServer(serverId, clientApiKey);

  const loadServerData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [server, resources] = await Promise.all([
        getServerDetails(),
        getServerResources().catch(() => null) // Resources might not be available without client key
      ]);
      setServerData(server);
      setResourceData(resources);
    } catch (error) {
      console.error('Failed to load server data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getServerDetails, getServerResources]);

  useEffect(() => {
    loadServerData();
  }, [serverId, clientApiKey, loadServerData]);

  // Auto-refresh resources every 30 seconds when server is running
  useEffect(() => {
    if (serverData?.status === 'running' && clientApiKey) {
      const interval = setInterval(() => {
        getServerResources().then(setResourceData).catch(console.error);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [serverData?.status, clientApiKey, getServerResources]);

  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    try {
      switch (action) {
        case 'start':
          await startServer();
          break;
        case 'stop':
          await stopServer();
          break;
        case 'restart':
          await restartServer();
          break;
        case 'kill':
          await killServer();
          break;
      }
      // Refresh data after action
      setTimeout(loadServerData, 2000);
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500';
      case 'stopping': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && !serverData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading server data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !serverData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load server data</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Button onClick={loadServerData} className="mt-3" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Server className="h-4 w-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'console'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Terminal className="h-4 w-4 inline mr-2" />
          Console
          {!clientApiKey && <span className="ml-1 text-xs text-red-500">*</span>}
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'files'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderOpen className="h-4 w-4 inline mr-2" />
          Files
          {!clientApiKey && <span className="ml-1 text-xs text-red-500">*</span>}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6" />
                <div>
                  <CardTitle>{serverData?.name || 'Server'}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {serverData?.allocation.ip}:{serverData?.allocation.port}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(serverData?.status || 'offline')}`} />
                  {serverData?.status || 'offline'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadServerData}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Power Controls */}
            <div className="flex gap-2 mb-6">
              <Button
                variant="outline"
                onClick={() => handlePowerAction('start')}
                disabled={loading || serverData?.status === 'running'}
                className="text-green-600 hover:text-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePowerAction('stop')}
                disabled={loading || serverData?.status === 'offline'}
                className="text-red-600 hover:text-red-700"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePowerAction('restart')}
                disabled={loading || serverData?.status === 'offline'}
                className="text-blue-600 hover:text-blue-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePowerAction('kill')}
                disabled={loading || serverData?.status === 'offline'}
                className="text-orange-600 hover:text-orange-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Force Kill
              </Button>
            </div>

            {/* Resource Usage */}
            {resourceData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{
                        width: `${Math.min((resourceData.resources.memory_bytes / resourceData.resources.memory_limit_bytes) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatBytes(resourceData.resources.memory_bytes)} / {formatBytes(resourceData.resources.memory_limit_bytes)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">CPU</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(resourceData.resources.cpu_absolute, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {resourceData.resources.cpu_absolute.toFixed(1)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Disk</span>
                  </div>
                  <p className="text-sm">{formatBytes(resourceData.resources.disk_bytes)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <p className="text-sm">{formatUptime(resourceData.resources.uptime / 1000)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Console Tab */}
      {activeTab === 'console' && (
        <Card>
          <CardContent className="p-6 text-center">
            <Terminal className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              Console Feature Temporarily Unavailable
            </p>
            <p className="text-sm text-gray-500 mb-4">
              The real-time console feature has been temporarily disabled.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <>
          {clientApiKey ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  File Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">
                  Client API Key Required
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Provide a client API key to access the file manager.
                </p>
                <div className="max-w-md mx-auto space-y-3">
                  <Input
                    type="password"
                    placeholder="Enter your client API key"
                    value={localApiKey}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalApiKey(e.target.value)}
                  />
                  <Button 
                    onClick={() => onApiKeyChange?.(localApiKey)}
                    disabled={!localApiKey.trim()}
                    className="w-full"
                  >
                    Connect with API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

    </div>
  );
};
