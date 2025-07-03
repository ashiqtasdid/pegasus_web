// TypeScript interfaces for Pterodactyl API integration

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface ServerAllocation {
  ip: string;
  port: number;
}

export interface ServerLimits {
  memory: number;
  swap: number;
  disk: number;
  io: number;
  cpu: number;
}

export interface ServerFeatureLimits {
  databases: number;
  backups: number;
  allocations: number;
}

export interface Server {
  id: number;
  name: string;
  uuid: string;
  status: 'offline' | 'starting' | 'running' | 'stopping';
  allocation: ServerAllocation;
  limits: ServerLimits;
  feature_limits: ServerFeatureLimits;
}

export interface ServerResources {
  current_state: string;
  is_suspended: boolean;
  resources: {
    memory_bytes: number;
    memory_limit_bytes: number;
    cpu_absolute: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
    uptime: number;
  };
}

export interface FileItem {
  name: string;
  mode: string;
  mode_bits: string;
  size: number;
  is_file: boolean;
  is_symlink: boolean;
  mimetype: string;
  created_at: string;
  modified_at: string;
}

export interface PterodactylFileAttributes {
  name: string;
  mode: string;
  mode_bits: string;
  size: number;
  is_file: boolean;
  is_symlink: boolean;
  mimetype: string;
  created_at: string;
  modified: string;
}

export interface PterodactylFile {
  object: string;
  attributes: PterodactylFileAttributes;
}

export interface FilesResponse {
  files: FileItem[];
}

// WebSocket and Console Types
export interface WebSocketAuth {
  socket: string;     // WebSocket URL
  origin: string;     // Origin URL
  token: string;      // Authentication token
}

export interface ConsoleMessage {
  message: string;
  type: 'server' | 'system' | 'error' | 'command';
  timestamp: Date;
}

export interface ConsoleConnection {
  socket: WebSocket | null;
  token: string;
  server: Server;
  isConnected: boolean;
  reconnectAttempts: number;
}

export interface ConsoleWebSocketResponse {
  success: boolean;
  websocket: WebSocketAuth;
  server: {
    id: number;
    identifier: string;
    name: string;
    uuid: string;
  };
}

export interface ConsoleCommandResponse {
  success: boolean;
  message: string;
  server: {
    id: number;
    identifier: string;
    name: string;
  };
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  clientApiKey?: string;
  createServer?: boolean;
  serverName?: string;
}

export interface PowerAction {
  signal: 'start' | 'stop' | 'restart' | 'kill';
}

export interface ConsoleCommand {
  command: string;
  clientApiKey?: string;
}

export interface FileWriteRequest {
  file: string;
  content: string;
  clientApiKey: string;
}

export interface FileDeleteRequest {
  root: string;
  files: string[];
  clientApiKey: string;
}

export interface FolderCreateRequest {
  root: string;
  name: string;
  clientApiKey: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export type ServerApiResponse = ApiResponse<Server>;
export type ServerResourcesApiResponse = ApiResponse<ServerResources>;
export type FilesApiResponse = ApiResponse<FilesResponse>;
export type WebSocketAuthApiResponse = ApiResponse<WebSocketAuth>;
