/**
 * React Hook for Pegasus Plugin Generator
 * Follows the patterns outlined in PEGASUS_API_DOCUMENTATION.md
 */

import { useState, useCallback } from 'react';
import pegasusAPI, {
  PluginGenerationRequest,
  PluginGenerationResponse,
  ServerActionResponse,
  AutomationStatusResponse,
  CompileResponse,
  ServerCreationResponse,
  SubmitClientKeyResponse,
  SystemHealthResponse,
  PterodactylStatusResponse,
} from '../lib/pegasus-api';

export interface UsePegasusReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Plugin Generation
  generatePlugin: (data: PluginGenerationRequest) => Promise<PluginGenerationResponse>;
  generateCodeOnly: (prompt: string, pluginName: string, userId: string) => Promise<unknown>;
  compilePlugin: (userId: string, pluginName: string) => Promise<CompileResponse>;
  
  // Server Management
  createServer: (userId: string, serverName?: string, email?: string) => Promise<ServerCreationResponse>;
  manageServer: (userId: string, action: 'start' | 'restart' | 'stop') => Promise<ServerActionResponse>;
  uploadPlugin: (userId: string, pluginName: string) => Promise<unknown>;
  
  // Automation & Status
  checkAutomation: (userId: string) => Promise<AutomationStatusResponse>;
  submitClientApiKey: (userId: string, clientApiKey: string) => Promise<SubmitClientKeyResponse>;
  
  // System Status
  getSystemHealth: () => Promise<SystemHealthResponse>;
  getPterodactylStatus: () => Promise<PterodactylStatusResponse>;
}

export function usePegasus(): UsePegasusReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Plugin Generation Functions
  const generatePlugin = useCallback(async (data: PluginGenerationRequest) => {
    return executeWithErrorHandling(async () => {
      console.log('🚀 Generating plugin with data:', data);
      const result = await pegasusAPI.generatePlugin(data);
      
      // Log token usage analytics
      if (result.tokenUsage) {
        console.log('🔢 Token Usage Analytics:', result.tokenUsage);
        console.log(`📊 Tokens used this request: ${result.tokenUsage.tokensUsedThisRequest}`);
        console.log(`📈 Total requests: ${result.tokenUsage.requestCount}`);
        
        // Dispatch event for other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('token-usage-updated', {
            detail: {
              userId: data.userId,
              tokenUsage: result.tokenUsage,
              operation: 'plugin-generation'
            }
          }));
        }
      }

      // Check if client API key is needed
      if (result.needsClientApiKey) {
        console.log('⚠️ Client API key required for full automation');
      }

      return result;
    });
  }, [executeWithErrorHandling]);

  const generateCodeOnly = useCallback(async (
    prompt: string,
    pluginName: string,
    userId: string
  ) => {
    return executeWithErrorHandling(async () => {
      console.log('📝 Generating code only for:', pluginName);
      return pegasusAPI.generateCodeOnly(prompt, pluginName, userId);
    });
  }, [executeWithErrorHandling]);

  const compilePlugin = useCallback(async (
    userId: string,
    pluginName: string
  ) => {
    return executeWithErrorHandling(async () => {
      console.log('🔧 Compiling plugin:', pluginName);
      const result = await pegasusAPI.compilePlugin(userId, pluginName);
      
      if (!result.success) {
        console.error('❌ Compilation failed:', result.errors);
        throw new Error(`Compilation failed: ${result.message}`);
      }
      
      console.log('✅ Compilation successful:', result.message);
      return result;
    });
  }, [executeWithErrorHandling]);

  // Server Management Functions
  const createServer = useCallback(async (
    userId: string,
    serverName?: string,
    email?: string
  ) => {
    return executeWithErrorHandling(async () => {
      console.log('🏗️ Creating server for user:', userId);
      const result = await pegasusAPI.createServer(userId, serverName, email);
      
      if (result.success && result.server) {
        console.log('✅ Server created successfully:', result.server.name);
        console.log('🔗 Server identifier:', result.server.identifier);
      }
      
      return result;
    });
  }, [executeWithErrorHandling]);

  const manageServer = useCallback(async (
    userId: string,
    action: 'start' | 'restart' | 'stop'
  ) => {
    return executeWithErrorHandling(async () => {
      console.log(`🎮 Performing server action: ${action} for user:`, userId);
      const result = await pegasusAPI.performServerAction(userId, action);
      
      if (result.success) {
        console.log(`✅ Server ${action} command executed successfully`);
      } else if (result.requiresClientApiKey) {
        console.log('🔑 Client API key required for server control');
        throw new Error('Personal Client API key required for server power control');
      }
      
      return result;
    });
  }, [executeWithErrorHandling]);

  const uploadPlugin = useCallback(async (
    userId: string,
    pluginName: string
  ) => {
    return executeWithErrorHandling(async () => {
      console.log('📤 Uploading plugin JAR:', pluginName);
      const result = await pegasusAPI.uploadJar(userId, pluginName);
      console.log('✅ Plugin uploaded successfully');
      return result;
    });
  }, [executeWithErrorHandling]);

  // Automation & Status Functions
  const checkAutomation = useCallback(async (userId: string) => {
    return executeWithErrorHandling(async () => {
      console.log('🔍 Checking automation status for user:', userId);
      const status = await pegasusAPI.getAutomationStatus(userId);
      
      console.log('🤖 Automation capabilities:', status.features);
      console.log('🔑 Has client API key:', status.hasClientApiKey);
      
      return status;
    });
  }, [executeWithErrorHandling]);

  const submitClientApiKey = useCallback(async (
    userId: string,
    clientApiKey: string
  ) => {
    return executeWithErrorHandling(async () => {
      console.log('🔐 Submitting client API key for user:', userId);
      const result = await pegasusAPI.submitClientKey(userId, clientApiKey);
      
      if (result.success) {
        console.log('✅ Client API key stored successfully!');
        console.log('🚀 Enabled features:', result.features);
      }
      
      return result;
    });
  }, [executeWithErrorHandling]);

  // System Status Functions
  const getSystemHealth = useCallback(async () => {
    return executeWithErrorHandling(async () => {
      console.log('🏥 Checking system health');
      const health = await pegasusAPI.getSystemHealth();
      console.log('💓 System status:', health.status);
      return health;
    });
  }, [executeWithErrorHandling]);

  const getPterodactylStatus = useCallback(async () => {
    return executeWithErrorHandling(async () => {
      console.log('🦕 Checking Pterodactyl status');
      const status = await pegasusAPI.getPterodactylStatus();
      console.log('🔧 Pterodactyl configured:', status.configured);
      console.log('🎯 Automation capabilities:', status.automationCapabilities);
      return status;
    });
  }, [executeWithErrorHandling]);

  return {
    // State
    loading,
    error,
    
    // Plugin Generation
    generatePlugin,
    generateCodeOnly,
    compilePlugin,
    
    // Server Management
    createServer,
    manageServer,
    uploadPlugin,
    
    // Automation & Status
    checkAutomation,
    submitClientApiKey,
    
    // System Status
    getSystemHealth,
    getPterodactylStatus,
  };
}
