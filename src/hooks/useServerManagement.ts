import { useState, useEffect, useCallback } from 'react';

interface ServerInfo {
  hasServer: boolean;
  server?: {
    id: number;
    uuid: string;
    identifier: string;
    name: string;
    status: string;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
    };
    feature_limits: {
      databases: number;
      allocations: number;
      backups: number;
    };
  };
  credentials?: {
    panelUrl: string;
    username: string;
    email: string;
    password: string;
  };
  capabilities?: {
    canStart: boolean;
    canStop: boolean;
    canRestart: boolean;
    canUpload: boolean;
  };
}

interface AutomationStatus {
  success: boolean;
  userId: string;
  hasClientApiKey: boolean;
  hasGlobalClientApiKey: boolean;
  features: {
    serverCreation: boolean;
    powerControl: boolean;
    jarUpload: boolean;
  };
  server: {
    uploadedPlugins: string[];
  };
  message: string;
  keySource: string;
  requiresUserKey: boolean;
}

export function useServerManagement(userId: string) {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [automationStatus, setAutomationStatus] = useState<AutomationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadServerInfo = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/pterodactyl/server-info/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setServerInfo(data);
      } else {
        setError(data.error || 'Failed to load server info');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Server info load error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadAutomationStatus = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/pterodactyl/automation-status/${userId}`);
      const data = await response.json();
      
      if (data.success !== undefined) {
        // Ensure the data has the expected structure
        const validatedData: AutomationStatus = {
          success: data.success || false,
          userId: data.userId || userId,
          hasClientApiKey: data.hasClientApiKey || false,
          hasGlobalClientApiKey: data.hasGlobalClientApiKey || false,
          features: {
            serverCreation: data.features?.serverCreation || false,
            powerControl: data.features?.powerControl || false,
            jarUpload: data.features?.jarUpload || false,
          },
          server: {
            uploadedPlugins: data.server?.uploadedPlugins || [],
          },
          message: data.message || '',
          keySource: data.keySource || '',
          requiresUserKey: data.requiresUserKey || false,
        };
        setAutomationStatus(validatedData);
      } else {
        // Set a default structure if API returns unexpected data
        setAutomationStatus({
          success: false,
          userId: userId,
          hasClientApiKey: false,
          hasGlobalClientApiKey: false,
          features: {
            serverCreation: false,
            powerControl: false,
            jarUpload: false,
          },
          server: {
            uploadedPlugins: [],
          },
          message: 'API returned unexpected data',
          keySource: '',
          requiresUserKey: true,
        });
      }
    } catch (err) {
      console.error('Automation status load error:', err);
      // Set a default error state
      setAutomationStatus({
        success: false,
        userId: userId,
        hasClientApiKey: false,
        hasGlobalClientApiKey: false,
        features: {
          serverCreation: false,
          powerControl: false,
          jarUpload: false,
        },
        server: {
          uploadedPlugins: [],
        },
        message: 'Failed to load automation status',
        keySource: '',
        requiresUserKey: true,
      });
    }
  }, [userId]);

  const performServerAction = async (action: 'start' | 'stop' | 'restart') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pterodactyl/server-action-with-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh server info after action
        setTimeout(loadServerInfo, 2000);
        return { success: true, message: data.message };
      } else if (data.requiresClientApiKey) {
        return { requiresApiKey: true, message: data.message };
      } else {
        setError(data.error || 'Action failed');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      console.error('Server action error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const submitClientApiKey = async (clientApiKey: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pterodactyl/submit-client-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, clientApiKey })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh automation status and server info
        await Promise.all([loadAutomationStatus(), loadServerInfo()]);
        return { success: true, message: data.message };
      } else {
        setError(data.error || 'Failed to verify API key');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      console.error('API key submission error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const uploadPlugin = async (pluginName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pterodactyl/upload-jar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pluginName })
      });

      const data = await response.json();

      if (data.success) {
        setTimeout(loadServerInfo, 2000);
        return { success: true, message: data.message, jarFile: data.jarFile };
      } else if (data.requiresClientApiKey) {
        return { requiresApiKey: true, message: data.message };
      } else {
        setError(data.error || 'Upload failed');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      console.error('Plugin upload error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createServer = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pterodactyl/create-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      });

      const data = await response.json();

      if (data.success) {
        setTimeout(loadServerInfo, 2000);
        return { success: true, server: data.server, credentials: data.credentials };
      } else {
        setError(data.error || 'Server creation failed');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Network error occurred';
      setError(errorMsg);
      console.error('Server creation error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadServerInfo();
      loadAutomationStatus();
    }
  }, [userId, loadServerInfo, loadAutomationStatus]);

  return {
    serverInfo,
    automationStatus,
    loading,
    error,
    loadServerInfo,
    loadAutomationStatus,
    performServerAction,
    submitClientApiKey,
    uploadPlugin,
    createServer
  };
}
