import { useState, useCallback } from 'react';
import { Server, ServerResources, FilesResponse } from '@/types/pterodactyl';

export const usePterodactylServer = (serverId: number, clientApiKey?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Server Information
  const getServerDetails = useCallback(async (): Promise<Server> => {
    const url = clientApiKey 
      ? `/api/pterodactyl/server/${serverId}?clientApiKey=${encodeURIComponent(clientApiKey)}`
      : `/api/pterodactyl/server/${serverId}`;
    return apiCall<Server>(url);
  }, [serverId, clientApiKey, apiCall]);

  const getServerResources = useCallback(async (): Promise<ServerResources> => {
    const url = clientApiKey 
      ? `/api/pterodactyl/server/${serverId}/resources?clientApiKey=${encodeURIComponent(clientApiKey)}`
      : `/api/pterodactyl/server/${serverId}/resources`;
    return apiCall<ServerResources>(url);
  }, [serverId, clientApiKey, apiCall]);

  // Power Control
  const startServer = useCallback(async () => {
    return apiCall(`/api/pterodactyl/server/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'start', clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  const stopServer = useCallback(async () => {
    return apiCall(`/api/pterodactyl/server/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'stop', clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  const restartServer = useCallback(async () => {
    return apiCall(`/api/pterodactyl/server/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'restart', clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  const killServer = useCallback(async () => {
    return apiCall(`/api/pterodactyl/server/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'kill', clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  // Console Commands
  const sendCommand = useCallback(async (command: string) => {
    return apiCall(`/api/pterodactyl/server/${serverId}/command`, {
      method: 'POST',
      body: JSON.stringify({ command, clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  // File Management
  const listFiles = useCallback(async (directory = '/'): Promise<FilesResponse> => {
    if (!clientApiKey) {
      throw new Error('Client API key is required for file operations');
    }
    
    const url = `/api/pterodactyl/server/${serverId}/files?directory=${encodeURIComponent(directory)}&clientApiKey=${encodeURIComponent(clientApiKey)}`;
    return apiCall<FilesResponse>(url);
  }, [serverId, clientApiKey, apiCall]);

  const readFile = useCallback(async (filePath: string): Promise<string> => {
    if (!clientApiKey) {
      throw new Error('Client API key is required for file operations');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/pterodactyl/server/${serverId}/files/contents?file=${encodeURIComponent(filePath)}&clientApiKey=${encodeURIComponent(clientApiKey)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return response.text();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serverId, clientApiKey]);

  const writeFile = useCallback(async (filePath: string, content: string) => {
    if (!clientApiKey) {
      throw new Error('Client API key is required for file operations');
    }
    
    return apiCall(`/api/pterodactyl/server/${serverId}/files/write`, {
      method: 'POST',
      body: JSON.stringify({ file: filePath, content, clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  const deleteFiles = useCallback(async (root: string, files: string[]) => {
    if (!clientApiKey) {
      throw new Error('Client API key is required for file operations');
    }
    
    return apiCall(`/api/pterodactyl/server/${serverId}/files/delete`, {
      method: 'POST',
      body: JSON.stringify({ root, files, clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  const createFolder = useCallback(async (root: string, name: string) => {
    if (!clientApiKey) {
      throw new Error('Client API key is required for file operations');
    }
    
    return apiCall(`/api/pterodactyl/server/${serverId}/files/create-folder`, {
      method: 'POST',
      body: JSON.stringify({ root, name, clientApiKey }),
    });
  }, [serverId, clientApiKey, apiCall]);

  return {
    loading,
    error,
    // Server info
    getServerDetails,
    getServerResources,
    // Power control
    startServer,
    stopServer,
    restartServer,
    killServer,
    // Console
    sendCommand,
    // File management
    listFiles,
    readFile,
    writeFile,
    deleteFiles,
    createFolder,
  };
};
