/**
 * Pegasus API Client - Comprehensive integration following PEGASUS_API_DOCUMENTATION.md
 * This client handles all interactions with the Pegasus Plugin Generator API
 */

// Types based on the API documentation
export interface PluginGenerationRequest {
  prompt: string;
  userId: string;
  email?: string;
  name?: string;
  autoCompile?: boolean;
  complexity?: number;
}

export interface PluginGenerationResponse {
  result: string;
  needsClientApiKey?: boolean;
  server?: {
    id: number;
    identifier: string;
    name: string;
    status: string;
    uuid: string;
  };
  pluginName?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestCount: number;
    tokensUsedThisRequest: number;
  };
}

export interface CodeGenerationRequest {
  prompt: string;
  pluginName: string;
  userId: string;
}

export interface CompileRequest {
  userId: string;
  pluginName: string;
}

export interface CompileResponse {
  success: boolean;
  message: string;
  jarPath?: string;
  buildOutput?: string;
  errors?: string;
}

export interface ServerCreationRequest {
  userId: string;
  serverName?: string;
  email?: string;
}

export interface ServerCreationResponse {
  success: boolean;
  server?: {
    id: number;
    identifier: string;
    name: string;
    status: string;
    uuid: string;
  };
  message: string;
}

export interface ServerInfoResponse {
  success: boolean;
  server?: {
    id: number;
    identifier: string;
    name: string;
    status: string;
    uuid: string;
  };
}

export interface ServerActionRequest {
  userId: string;
  action: 'start' | 'restart' | 'stop';
}

export interface ServerActionResponse {
  success: boolean;
  message: string;
  server?: {
    identifier: string;
    name: string;
    status: string;
  };
  requiresClientApiKey?: boolean;
}

export interface UploadJarRequest {
  userId: string;
  pluginName: string;
}

export interface ClientKeyInstructionsResponse {
  success: boolean;
  status: string;
  username: string;
  message: string;
  instructions: string[];
  submitUrl: string;
  features: {
    powerControl: boolean;
    jarUpload: boolean;
  };
}

export interface SubmitClientKeyRequest {
  userId: string;
  clientApiKey: string;
}

export interface SubmitClientKeyResponse {
  success: boolean;
  message: string;
  features: {
    powerControl: boolean;
    jarUpload: boolean;
  };
}

export interface AutomationStatusResponse {
  success: boolean;
  userId: string;
  hasClientApiKey: boolean;
  hasGlobalClientApiKey: boolean;
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
  keySource: string;
  requiresUserKey: boolean;
}

export interface SystemHealthResponse {
  status: string;
  timestamp: string;
  uptime: {
    seconds: number;
    human: string;
  };
  memory: {
    used: number;
    total: number;
    external: number;
  };
  version: string;
  platform: string;
  pid: number;
}

export interface PterodactylStatusResponse {
  configured: boolean;
  message: string;
  defaultEggId: number;
  defaultNestId: number;
  panelUrl: string;
  hasApplicationApiKey: boolean;
  hasClientApiKey: boolean;
  hasClientApi: boolean;
  hasFileUpload: boolean;
  automationCapabilities: {
    serverCreation: boolean;
    powerControl: boolean;
    jarUpload: boolean;
    userClientApiKeys: boolean;
  };
}

class PegasusAPI {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Always use local API routes instead of external API directly to avoid CORS
    this.baseUrl = baseUrl || '/api';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log(`🌐 Making API request to: ${url}`);
    console.log('📋 Request options:', {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? 'present' : 'none'
    });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      } catch {
        // If response is not JSON, get text
        errorMessage = await response.text() || `HTTP ${response.status}`;
      }
      console.error(`❌ API Error ${response.status}: ${errorMessage}`);
      throw new Error(`API Error ${response.status}: ${errorMessage}`);
    }

    // Ensure we can parse the JSON response
    try {
      const result = await response.json();
      console.log('✅ API request successful');
      return result;
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response from ${url}: ${parseError}`);
    }
  }

  // Plugin Generation APIs
  async generatePlugin(data: PluginGenerationRequest): Promise<PluginGenerationResponse> {
    return this.makeRequest('/api/plugin/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCodeOnly(
    prompt: string,
    pluginName: string,
    userId: string
  ): Promise<unknown> {
    return this.makeRequest('/api/ai/generate-code', {
      method: 'POST',
      body: JSON.stringify({ prompt, pluginName, userId }),
    });
  }

  async compilePlugin(userId: string, pluginName: string): Promise<CompileResponse> {
    return this.makeRequest('/api/plugin/compile-simple', {
      method: 'POST',
      body: JSON.stringify({ userId, pluginName }),
    });
  }

  // Server Management APIs
  async createServer(
    userId: string,
    serverName?: string,
    email?: string
  ): Promise<ServerCreationResponse> {
    return this.makeRequest('/api/pterodactyl/create-server', {
      method: 'POST',
      body: JSON.stringify({ userId, serverName, email }),
    });
  }

  async getUserServers(userId: string): Promise<ServerInfoResponse> {
    return this.makeRequest(`/api/pterodactyl/user-servers/${userId}`);
  }

  async getServerInfo(userId: string): Promise<ServerInfoResponse> {
    return this.makeRequest(`/api/pterodactyl/server-info/${userId}`);
  }

  async performServerAction(
    userId: string,
    action: 'start' | 'restart' | 'stop'
  ): Promise<ServerActionResponse> {
    return this.makeRequest('/api/pterodactyl/server-action-with-user', {
      method: 'POST',
      body: JSON.stringify({ userId, action }),
    });
  }

  async uploadJar(userId: string, pluginName: string): Promise<unknown> {
    return this.makeRequest('/api/pterodactyl/upload-jar', {
      method: 'POST',
      body: JSON.stringify({ userId, pluginName }),
    });
  }

  // Client API Key Management
  async getClientKeyInstructions(userId: string): Promise<ClientKeyInstructionsResponse> {
    return this.makeRequest(`/api/pterodactyl/client-key-instructions/${userId}`);
  }

  async submitClientKey(
    userId: string,
    clientApiKey: string
  ): Promise<SubmitClientKeyResponse> {
    return this.makeRequest('/api/pterodactyl/submit-client-key', {
      method: 'POST',
      body: JSON.stringify({ userId, clientApiKey }),
    });
  }

  async getAutomationStatus(userId: string): Promise<AutomationStatusResponse> {
    return this.makeRequest(`/api/pterodactyl/automation-status/${userId}`);
  }

  // System Status APIs
  async getSystemHealth(): Promise<SystemHealthResponse> {
    return this.makeRequest('/api/health');
  }

  async getPterodactylStatus(): Promise<PterodactylStatusResponse> {
    return this.makeRequest('/api/pterodactyl/status');
  }
}

// Export singleton instance
const pegasusAPI = new PegasusAPI();
export default pegasusAPI;
