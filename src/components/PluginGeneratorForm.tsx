/**
 * Enhanced Plugin Generator Form
 * Follows PEGASUS_API_DOCUMENTATION.md specifications
 */

import React, { useState } from 'react';
import { usePegasus } from '@/hooks/usePegasus';
import { PluginGenerationResponse } from '@/lib/pegasus-api';
import ClientApiKeyManager from './ClientApiKeyManager';

interface PluginGeneratorFormProps {
  userId: string;
  email?: string;
  onSuccess?: (result: PluginGenerationResponse) => void;
  onError?: (error: string) => void;
}

export default function PluginGeneratorForm({ 
  userId, 
  email,
  onSuccess,
  onError 
}: PluginGeneratorFormProps) {
  const [formData, setFormData] = useState({
    prompt: '',
    pluginName: '',
    email: email || '',
    complexity: 5
  });

  const [result, setResult] = useState<PluginGenerationResponse | null>(null);
  const [showClientKeyModal, setShowClientKeyModal] = useState(false);

  const { loading, error, generatePlugin } = usePegasus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      onError?.('Please enter a plugin description');
      return;
    }

    try {
      // Follow API documentation structure exactly
      const response = await generatePlugin({
        prompt: formData.prompt,
        userId,
        email: formData.email || email,
        name: formData.pluginName || undefined,
        autoCompile: true,
        complexity: formData.complexity
      });

      setResult(response);
      
      // Handle client API key requirement
      if (response.needsClientApiKey) {
        setShowClientKeyModal(true);
      }

      // Handle success with server creation
      if (response.server) {
        console.log('🏗️ Server created:', response.server);
      }

      if (onSuccess) {
        onSuccess(response);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate plugin';
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientKeySuccess = () => {
    setShowClientKeyModal(false);
    // Optionally reload the page or update state to reflect new capabilities
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plugin Description */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Plugin Description *
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your Minecraft plugin in detail. For example: 'Create a teleportation plugin with /sethome and /home commands that allows players to set and teleport to their home location.'"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Be specific about commands, features, and functionality you want.
          </p>
        </div>

        {/* Plugin Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pluginName" className="block text-sm font-medium text-gray-700 mb-2">
              Plugin Name (Optional)
            </label>
            <input
              type="text"
              id="pluginName"
              name="pluginName"
              value={formData.pluginName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MyAwesomePlugin"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate based on description.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              Used for server account creation if needed.
            </p>
          </div>
        </div>

        {/* Complexity Slider */}
        <div>
          <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-2">
            Complexity Level: {formData.complexity}/10
          </label>
          <input
            type="range"
            id="complexity"
            name="complexity"
            min="1"
            max="10"
            value={formData.complexity}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Simple</span>
            <span>Complex</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Higher complexity may generate more advanced features and use more tokens.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !formData.prompt.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Plugin...
            </span>
          ) : (
            'Generate Plugin & Create Server'
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Generation Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Plugin Generated Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{result.result}</p>
                
                {/* Plugin Information */}
                {result.pluginName && (
                  <div className="mt-2">
                    <strong>Plugin Name:</strong> {result.pluginName}
                  </div>
                )}

                {/* Server Information */}
                {result.server && (
                  <div className="mt-2">
                    <strong>Server Created:</strong> {result.server.name}
                    <br />
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      result.server.status === 'running' ? 'bg-green-100 text-green-800' :
                      result.server.status === 'installing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.server.status}
                    </span>
                  </div>
                )}

                {/* Token Usage */}
                {result.tokenUsage && (
                  <div className="mt-2 text-xs">
                    <strong>Token Usage:</strong> {result.tokenUsage.totalTokens} tokens
                    {result.tokenUsage.requestCount && (
                      <span> (Request #{result.tokenUsage.requestCount})</span>
                    )}
                  </div>
                )}

                {/* Client API Key Warning */}
                {result.needsClientApiKey && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-yellow-800 text-sm">
                        <strong>Action Required:</strong> Client API key needed for full server control.
                      </span>
                    </div>
                    <button
                      onClick={() => setShowClientKeyModal(true)}
                      className="mt-2 text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300"
                    >
                      Setup API Key
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
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
