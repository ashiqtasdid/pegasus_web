'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Key,
  Globe,
  User
} from 'lucide-react';

interface ServerCredentials {
  panelUrl: string;
  username: string;
  password: string;
  email?: string;
}

interface ServerDetails {
  id: number;
  identifier: string;
  name: string;
  status: string;
}

interface ServerCredentialsCardProps {
  serverDetails?: ServerDetails;
  credentials?: ServerCredentials;
  visible?: boolean;
  onClose?: () => void;
}

export function ServerCredentialsCard({ 
  serverDetails, 
  credentials, 
  visible = false,
  onClose 
}: ServerCredentialsCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFields(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const openPanel = () => {
    if (credentials?.panelUrl) {
      window.open(credentials.panelUrl, '_blank');
    }
  };

  if (!visible || !serverDetails || !credentials) {
    return null;
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Server Credentials</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ready
            </Badge>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
        <CardDescription>
          Your Minecraft server has been created successfully. Use these credentials to access the Pterodactyl panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Server Name
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {serverDetails.name}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(serverDetails.name, 'serverName')}
                className="h-8 w-8 p-0"
              >
                {copiedFields.serverName ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Server ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {serverDetails.id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(serverDetails.id.toString(), 'serverId')}
                className="h-8 w-8 p-0"
              >
                {copiedFields.serverId ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Access */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Panel URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
              {credentials.panelUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(credentials.panelUrl, 'panelUrl')}
              className="h-8 w-8 p-0"
            >
              {copiedFields.panelUrl ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openPanel}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Open Panel
            </Button>
          </div>
        </div>

        {/* Login Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4" />
              Username
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {credentials.username}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(credentials.username, 'username')}
                className="h-8 w-8 p-0"
              >
                {copiedFields.username ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {showPassword ? credentials.password : '••••••••••••'}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-8 w-8 p-0"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="h-8 w-8 p-0"
              >
                {copiedFields.password ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={openPanel}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Access Panel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              copyToClipboard(`URL: ${credentials.panelUrl}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`, 'all');
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All Credentials
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
          <strong>💡 Next Steps:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Click &quot;Access Panel&quot; to open the Pterodactyl control panel</li>
            <li>Log in with the username and password above</li>
            <li>Your server will appear in the server list</li>
            <li>You can start, stop, and manage your server from the panel</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
