/**
 * Enhanced Server Manager Component
 * Follows patterns from PEGASUS_API_DOCUMENTATION.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePegasus } from '@/hooks/usePegasus';
import ClientApiKeyManager from './ClientApiKeyManager';

interface ServerManagerProps {
  userId: string;
  onServerCreated?: (server: ServerInfo) => void;
}

interface ServerInfo {
  id: number;
  identifier: string;
  name: string;
  status: string;
  uuid: string;
  limits?: {
    memory: number;
    disk: number;
    cpu: number;
  };
}

interface AutomationStatus {
  success: boolean;
  hasClientApiKey: boolean;
  features: {
    serverCreation: boolean;
    powerControl: boolean;
    jarUpload: boolean;
  };
  server?: {
    serverId: string;
    serverUuid: string;
    uploadedPlugins: string[];
  };
  message: string;
}

export default function ServerManager({ userId, onServerCreated }: ServerManagerProps) {
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [showClientKeyModal, setShowClientKeyModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const { 
    loading, 
    error, 
    createServer, 
    manageServer, 
    checkAutomation
    // uploadPlugin - commented out as it's not used in this component yet
  } = usePegasus();

  // Load server info and automation status
  const loadServerInfo = useCallback(async () => {
    if (!userId) return;

    try {
      setIsRefreshing(true);
      
      // Check automation status first
      const automation = await checkAutomation(userId);
      setAutomationStatus(automation);
      
      // Load server info if available
      const response = await fetch(`/api/pterodactyl/user-servers/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.server) {
          setServer(data.server);
        }
      }
    } catch (error) {
      console.error('Failed to load server info:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, checkAutomation]);

  // Load data on mount and userId change
  useEffect(() => {
    loadServerInfo();
  }, [loadServerInfo]);

  // Auto-refresh server status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (server && !loading) {
        loadServerInfo();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [server, loading, loadServerInfo]);

  const handleCreateServer = async () => {
    try {
      const result = await createServer(userId);
      if (result.success && result.server) {
        setServer(result.server);
        if (onServerCreated) {
          onServerCreated(result.server);
        }
        // Reload automation status
        await loadServerInfo();
      }
    } catch (error) {
      console.error('Failed to create server:', error);
    }
  };

  const handleServerAction = async (action: 'start' | 'restart' | 'stop') => {
    try {
      setLastAction(action);
      const result = await manageServer(userId, action);
      
      if (result.success) {
        // Update server status
        if (result.server) {
          setServer(prev => prev ? { ...prev, ...result.server } : null);
        }
        // Reload full info after a short delay
        setTimeout(() => {
          loadServerInfo();
        }, 2000);
      }
    } catch (error) {
      // Check if error indicates need for client API key
      if (error instanceof Error && error.message.includes('Client API key')) {
        setShowClientKeyModal(true);
      }
      console.error(`Failed to ${action} server:`, error);
    } finally {
      setLastAction(null);
    }
  };

  // Remove unused function for now
  // const handleUploadPlugin = async (pluginName: string) => {
  //   try {
  //     await uploadPlugin(userId, pluginName);
  //     // Reload automation status to update uploaded plugins list
  //     await loadServerInfo();
  //   } catch (error) {
  //     if (error instanceof Error && error.message.includes('Client API key')) {
  //       setShowClientKeyModal(true);
  //     }
  //     console.error('Failed to upload plugin:', error);
  //   }
  // };

  const handleClientKeySuccess = () => {
    // Reload automation status to reflect new capabilities
    loadServerInfo();
    setShowClientKeyModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'starting':
      case 'stopping':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
      case 'stopped':
        return 'bg-red-100 text-red-800';
      case 'installing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isActionDisabled = (action: string) => {
    if (loading || lastAction) return true;
    if (!server) return true;
    
    switch (action) {
      case 'start':
        return server.status === 'running' || server.status === 'starting';
      case 'stop':
        return server.status === 'offline' || server.status === 'stopped' || server.status === 'stopping';
      case 'restart':
        return server.status === 'installing';
      default:
        return false;
    }
  };

  if (!server) {
    return (
      <div className="bg-white border rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Server Management</h3>
        
        <div className="text-center py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M5 8h.01" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Server Found</h4>
          <p className="text-gray-600 mb-6">
            Create a Minecraft server to get started with plugin deployment and management.
          </p>
          
          {automationStatus && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <p className="text-sm text-blue-800">
                <strong>Server Creation:</strong> {automationStatus.features.serverCreation ? 'Available' : 'Limited'}
              </p>
            </div>
          )}
          
          <button
            onClick={handleCreateServer}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Server...' : 'Create Minecraft Server'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Server Management</h3>
        <button
          onClick={loadServerInfo}
          disabled={isRefreshing}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Refresh server info"
        >
          <svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Server Information */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-gray-700">Name:</strong>
            <span className="ml-2">{server.name}</span>
          </div>
          <div>
            <strong className="text-gray-700">Status:</strong>
            <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(server.status)}`}>
              {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
            </span>
          </div>
          <div>
            <strong className="text-gray-700">Identifier:</strong>
            <span className="ml-2 font-mono text-xs">{server.identifier}</span>
          </div>
          <div>
            <strong className="text-gray-700">Memory:</strong>
            <span className="ml-2">{server.limits?.memory || 0} MB</span>
          </div>
          {server.limits?.disk && (
            <div>
              <strong className="text-gray-700">Disk:</strong>
              <span className="ml-2">{server.limits.disk} MB</span>
            </div>
          )}
          {server.limits?.cpu && (
            <div>
              <strong className="text-gray-700">CPU:</strong>
              <span className="ml-2">{server.limits.cpu}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Automation Status */}
      {automationStatus && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Automation Capabilities</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className={`flex items-center ${automationStatus.features.powerControl ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{automationStatus.features.powerControl ? '✅' : '❌'}</span>
              Power Control
            </div>
            <div className={`flex items-center ${automationStatus.features.jarUpload ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{automationStatus.features.jarUpload ? '✅' : '❌'}</span>
              Plugin Upload
            </div>
            <div className={`flex items-center ${automationStatus.features.serverCreation ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{automationStatus.features.serverCreation ? '✅' : '❌'}</span>
              Server Creation
            </div>
          </div>
          
          {!automationStatus.hasClientApiKey && (
            <div className="mt-3">
              <button
                onClick={() => setShowClientKeyModal(true)}
                className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200"
              >
                Setup Client API Key for Full Control
              </button>
            </div>
          )}
        </div>
      )}

      {/* Server Actions */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleServerAction('start')}
            disabled={isActionDisabled('start')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {lastAction === 'start' ? 'Starting...' : 'Start'}
          </button>
          <button
            onClick={() => handleServerAction('restart')}
            disabled={isActionDisabled('restart')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {lastAction === 'restart' ? 'Restarting...' : 'Restart'}
          </button>
          <button
            onClick={() => handleServerAction('stop')}
            disabled={isActionDisabled('stop')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {lastAction === 'stop' ? 'Stopping...' : 'Stop'}
          </button>
        </div>

        {/* Uploaded Plugins */}
        {automationStatus?.server?.uploadedPlugins && automationStatus.server.uploadedPlugins.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">Uploaded Plugins</h5>
            <div className="flex flex-wrap gap-1">
              {automationStatus.server.uploadedPlugins.map((plugin, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  {plugin}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Client API Key Modal */}
      <ClientApiKeyManager
        userId={userId}
        isOpen={showClientKeyModal}
        onClose={() => setShowClientKeyModal(false)}
        onSuccess={handleClientKeySuccess}
      />
    </div>
  );
}
