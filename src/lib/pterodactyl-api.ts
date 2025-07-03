/**
 * Client-side API utilities for Pterodactyl integration
 * Based on the FRONTEND_INTEGRATION_GUIDE.md
 */

export const pterodactylApi = {
  // Server Management
  getServerDetails: async (serverId: number, clientApiKey?: string) => {
    const url = clientApiKey 
      ? `/api/pterodactyl/server/${serverId}?clientApiKey=${encodeURIComponent(clientApiKey)}`
      : `/api/pterodactyl/server/${serverId}`;
    
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`Failed to get server details: ${response.status}`);
    return response.json();
  },

  getServerResources: async (serverId: number, clientApiKey?: string) => {
    const url = clientApiKey 
      ? `/api/pterodactyl/server/${serverId}/resources?clientApiKey=${encodeURIComponent(clientApiKey)}`
      : `/api/pterodactyl/server/${serverId}/resources`;
    
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`Failed to get server resources: ${response.status}`);
    return response.json();
  },

  // Power Control
  controlServer: async (serverId: number, action: 'start' | 'stop' | 'restart' | 'kill', clientApiKey?: string) => {
    const response = await fetch(`/api/pterodactyl/server/${serverId}/power`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal: action, clientApiKey }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Failed to ${action} server: ${response.status}`);
    return response.json();
  },

  // Console Commands
  sendCommand: async (serverId: number, command: string, clientApiKey?: string) => {
    const response = await fetch(`/api/pterodactyl/server/${serverId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, clientApiKey }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Failed to send command: ${response.status}`);
    return response.json();
  },

  // WebSocket Authentication
  getWebSocketAuth: async (serverId: number, clientApiKey: string) => {
    const response = await fetch(
      `/api/pterodactyl/server/${serverId}/websocket?clientApiKey=${encodeURIComponent(clientApiKey)}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error(`Failed to get WebSocket auth: ${response.status}`);
    return response.json();
  },

  // File Management
  listFiles: async (serverId: number, directory = '/', clientApiKey: string) => {
    const response = await fetch(
      `/api/pterodactyl/server/${serverId}/files?directory=${encodeURIComponent(directory)}&clientApiKey=${encodeURIComponent(clientApiKey)}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error(`Failed to list files: ${response.status}`);
    return response.json();
  },

  readFile: async (serverId: number, filePath: string, clientApiKey: string) => {
    const response = await fetch(
      `/api/pterodactyl/server/${serverId}/files/contents?file=${encodeURIComponent(filePath)}&clientApiKey=${encodeURIComponent(clientApiKey)}`,
      { credentials: 'include' }
    );
    if (!response.ok) throw new Error(`Failed to read file: ${response.status}`);
    return response.text();
  },

  writeFile: async (serverId: number, filePath: string, content: string, clientApiKey: string) => {
    const response = await fetch(`/api/pterodactyl/server/${serverId}/files/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: filePath, content, clientApiKey }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Failed to write file: ${response.status}`);
    return response.json();
  },

  deleteFiles: async (serverId: number, root: string, files: string[], clientApiKey: string) => {
    const response = await fetch(`/api/pterodactyl/server/${serverId}/files/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ root, files, clientApiKey }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Failed to delete files: ${response.status}`);
    return response.json();
  },

  createFolder: async (serverId: number, root: string, name: string, clientApiKey: string) => {
    const response = await fetch(`/api/pterodactyl/server/${serverId}/files/create-folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ root, name, clientApiKey }),
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`Failed to create folder: ${response.status}`);
    return response.json();
  }
};

export default pterodactylApi;
