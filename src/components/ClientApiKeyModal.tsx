'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Key, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface ClientApiKeyModalProps {
  isOpen: boolean;
  userId: string;
  actionType: string;
  onClose: () => void;
  onSuccess: () => void;
  onSubmit: (apiKey: string) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export function ClientApiKeyModal({ 
  isOpen, 
  actionType, 
  onClose, 
  onSuccess,
  onSubmit 
}: ClientApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.startsWith('ptlc_')) {
      setError('Invalid API key format. Key should start with "ptlc_"');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onSubmit(apiKey);

      if (result.success) {
        onSuccess();
        onClose();
        setApiKey('');
      } else {
        setError(result.error || 'Failed to verify API key');
      }
    } catch (error) {
      console.error('Client API key submission error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApiKey('');
    setError('');
    setShowInstructions(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            <h3 className="text-xl font-bold">Enable Server Control</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  To {actionType === 'server-control' ? 'control your server' : 'upload plugins'}, 
                  please provide your Pterodactyl Client API key.
                </p>
                <button
                  type="button"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="text-sm text-blue-600 dark:text-blue-400 underline mt-1 hover:no-underline"
                >
                  {showInstructions ? 'Hide' : 'Show'} instructions
                </button>
              </div>
            </div>
          </div>

          {showInstructions && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                How to get your Client API key:
              </h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600 dark:text-gray-300">
                <li>Open your Pterodactyl Panel</li>
                <li>Go to Account → API Credentials</li>
                <li>Click &apos;Create API Key&apos;</li>
                <li>Copy the key (starts with &apos;ptlc_&apos;)</li>
              </ol>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Panel URL: <span className="font-mono">http://109.71.252.4</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Client API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ptlc_your_client_api_key_here"
                className="mt-1 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Format: ptlc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || !apiKey}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Enable Control
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
