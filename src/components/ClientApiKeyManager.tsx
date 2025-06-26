/**
 * Client API Key Management Component
 * Implements the workflow described in PEGASUS_API_DOCUMENTATION.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePegasus } from '@/hooks/usePegasus';

interface ClientApiKeyInstructions {
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

interface ClientApiKeyManagerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (features: { powerControl: boolean; jarUpload: boolean }) => void;
}

export default function ClientApiKeyManager({ 
  userId, 
  isOpen, 
  onClose, 
  onSuccess 
}: ClientApiKeyManagerProps) {
  const [step, setStep] = useState<'instructions' | 'submit' | 'success'>('instructions');
  const [instructions, setInstructions] = useState<ClientApiKeyInstructions | null>(null);
  const [clientApiKey, setClientApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { loading } = usePegasus();

  // Load instructions when component opens
  const loadInstructions = useCallback(async () => {
    try {
      const response = await fetch(`/api/pterodactyl/client-key-instructions/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load instructions');
      }
      const data = await response.json();
      setInstructions(data);
      setStep('instructions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructions');
    }
  }, [userId]);

  // Load instructions when component opens
  useEffect(() => {
    if (isOpen && userId) {
      loadInstructions();
    }
  }, [isOpen, userId, loadInstructions]);

  const handleSubmitKey = async () => {
    if (!clientApiKey.trim()) {
      setError('Please enter your Client API key');
      return;
    }

    if (!clientApiKey.startsWith('ptlc_')) {
      setError('Client API key should start with &quot;ptlc_&quot;');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/pterodactyl/submit-client-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          clientApiKey: clientApiKey.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit API key');
      }

      const result = await response.json();
      
      if (result.success) {
        setStep('success');
        if (onSuccess && result.features) {
          onSuccess(result.features);
        }
        
        // Auto close after showing success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('instructions');
    setClientApiKey('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'instructions' && 'Setup Client API Key'}
            {step === 'submit' && 'Submit Client API Key'}
            {step === 'success' && 'Success!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {step === 'instructions' && instructions && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Client API Key Required
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{instructions.message}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Follow these steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {instructions.instructions?.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {instructions.username && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Your Panel Username:</strong> {instructions.username}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Current Capabilities:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`flex items-center ${instructions.features?.powerControl ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{instructions.features?.powerControl ? '✅' : '❌'}</span>
                  Server Power Control
                </div>
                <div className={`flex items-center ${instructions.features?.jarUpload ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="mr-2">{instructions.features?.jarUpload ? '✅' : '❌'}</span>
                  Plugin Upload
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('submit')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                I Have My API Key
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {step === 'submit' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Please paste your Client API key below. It should start with &quot;ptlc_&quot; and be around 48 characters long.
              </p>
            </div>

            <div>
              <label htmlFor="clientApiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Client API Key
              </label>
              <input
                type="text"
                id="clientApiKey"
                value={clientApiKey}
                onChange={(e) => setClientApiKey(e.target.value)}
                placeholder="ptlc_your_client_api_key_here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleSubmitKey}
                disabled={isSubmitting || !clientApiKey.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit API Key'}
              </button>
              <button
                onClick={() => setStep('instructions')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">API Key Submitted Successfully!</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your Client API key has been stored securely. You now have full automation capabilities.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Enabled Features:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  Server Power Control
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✅</span>
                  Plugin Upload
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              This window will close automatically in a few seconds.
            </p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
