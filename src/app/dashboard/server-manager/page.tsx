'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedServerManager } from '@/components/PterodactylServerManager';
import { ArrowLeft, Server, Key } from 'lucide-react';

function ServerManagerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverId, setServerId] = useState<string>(searchParams?.get('serverId') || '');
  const [clientApiKey, setClientApiKey] = useState<string>('');
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    // If we have both serverId and clientApiKey from URL params, show manager immediately
    const urlServerId = searchParams?.get('serverId');
    const urlApiKey = searchParams?.get('apiKey');
    
    if (urlServerId) {
      setServerId(urlServerId);
      if (urlApiKey) {
        setClientApiKey(urlApiKey);
        setShowManager(true);
      }
    }
  }, [searchParams]);

  const handleConnect = () => {
    if (serverId && !isNaN(Number(serverId))) {
      setShowManager(true);
    }
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setClientApiKey(newApiKey);
    // Update URL params
    const params = new URLSearchParams();
    params.set('serverId', serverId);
    if (newApiKey) {
      params.set('apiKey', newApiKey);
    }
    router.push(`/dashboard/server-manager?${params.toString()}`);
  };

  const handleDisconnect = () => {
    setShowManager(false);
    setServerId('');
    setClientApiKey('');
    router.push('/dashboard/server-manager');
  };

  if (showManager && serverId) {
    return (
      <div className="min-h-screen bg-animated-grid bg-particles font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small opacity-[0.13] dark:opacity-[0.08] z-0"></div>
        
        <div className="container mx-auto px-4 md:px-8 py-12 space-y-6 animate-in fade-in-0 duration-700 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Server Manager</h1>
                <p className="text-gray-600">Server ID: {serverId}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700"
            >
              Disconnect
            </Button>
          </div>

          {/* Server Manager Component */}
          <EnhancedServerManager 
            serverId={parseInt(serverId)} 
            clientApiKey={clientApiKey || ''}
            onApiKeyChange={handleApiKeyChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-grid bg-particles font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-small opacity-[0.13] dark:opacity-[0.08] z-0"></div>
      
      <div className="container mx-auto px-4 md:px-8 py-12 space-y-6 animate-in fade-in-0 duration-700 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Server Manager</h1>
            <p className="text-gray-600">Connect to your Pterodactyl server</p>
          </div>
        </div>

        {/* Connection Form */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-6 w-6" />
              Connect to Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serverId">Server ID</Label>
              <Input
                id="serverId"
                type="number"
                placeholder="Enter your server ID"
                value={serverId}
                onChange={(e) => setServerId(e.target.value)}
              />
              <p className="text-sm text-gray-600">
                The numeric ID of your server from the Pterodactyl panel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Client API Key (Optional)
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your client API key for full access"
                value={clientApiKey}
                onChange={(e) => setClientApiKey(e.target.value)}
              />
              <p className="text-sm text-gray-600">
                Required for console access, file management, and advanced features
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Features Available:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Server information and status</li>
                <li>• Power controls (start, stop, restart)</li>
                {clientApiKey && (
                  <>
                    <li>• Real-time console access</li>
                    <li>• File management</li>
                    <li>• Resource monitoring</li>
                  </>
                )}
              </ul>
              {!clientApiKey && (
                <p className="text-sm text-blue-700 mt-2 italic">
                  Add a client API key to unlock console and file management features
                </p>
              )}
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={!serverId || isNaN(Number(serverId))}
              className="w-full"
            >
              Connect to Server
            </Button>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>How to get your Server ID and API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Finding your Server ID:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Log into your Pterodactyl panel</li>
                <li>Navigate to your server</li>
                <li>Look at the URL - the number after &apos;/server/&apos; is your Server ID</li>
                <li>Example: panel.example.com/server/123 → Server ID is 123</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Getting your Client API Key:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Go to your Pterodactyl panel</li>
                <li>Click on your profile (top right)</li>
                <li>Go to &quot;API Credentials&quot;</li>
                <li>Create a new API key with appropriate permissions</li>
                <li>Copy the generated key</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ServerManagerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ServerManagerContent />
    </Suspense>
  );
}
