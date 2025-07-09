'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  RefreshCw, 
  Package, 
  FileText, 
  HardDrive,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Clock
} from 'lucide-react';
import { getPluginList, getMultipleJarInfos, downloadJar, type Plugin, type JarFileInfo } from '@/lib/jar-api';

interface JarDashboardProps {
  userId: string;
}

export default function JarDashboard({ userId }: JarDashboardProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [jarInfos, setJarInfos] = useState<Record<string, JarFileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get plugin list from local database
      const pluginList = await getPluginList(userId);
      setPlugins(pluginList);

      // Get JAR info for each plugin from external API
      const pluginNames = pluginList.map(p => p.pluginName);
      const jarInfoMap = await getMultipleJarInfos(userId, pluginNames);
      setJarInfos(jarInfoMap);

    } catch (error) {
      console.error('Error loading JAR dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, loadData]);

  const handleDownload = async (pluginName: string) => {
    try {
      const blob = await downloadJar(userId, pluginName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = jarInfos[pluginName]?.fileName || `${pluginName}.jar`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success notification
      showNotification(`${pluginName}.jar downloaded successfully!`, 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showNotification(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleRefresh = async (pluginName: string) => {
    try {
      setSyncing(prev => new Set(prev).add(pluginName));
      
      // Refresh JAR info from external API
      const newJarInfo = await getMultipleJarInfos(userId, [pluginName]);
      setJarInfos(prev => ({ ...prev, ...newJarInfo }));
      
      showNotification(`${pluginName} JAR info refreshed successfully!`, 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      showNotification(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginName);
        return newSet;
      });
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg font-medium text-white ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      'bg-blue-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (available: boolean) => {
    return available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (available: boolean) => {
    return available ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg font-medium">Loading JAR database...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error Loading Data</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">JAR Database</h1>
          <p className="text-muted-foreground">
            Manage your compiled Minecraft plugin JAR files
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {plugins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Plugins Found</h3>
            <p className="text-muted-foreground text-center">
              Generate some plugins first to see them appear in the JAR database.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plugins.map((plugin) => (
            <PluginJarCard
              key={plugin._id}
              plugin={plugin}
              jarInfo={jarInfos[plugin.pluginName]}
              onDownload={() => handleDownload(plugin.pluginName)}
              onSync={() => handleRefresh(plugin.pluginName)}
              isLoading={loading}
              isSyncing={syncing.has(plugin.pluginName)}
              formatFileSize={formatFileSize}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PluginJarCardProps {
  plugin: Plugin;
  jarInfo: JarFileInfo;
  onDownload: () => void;
  onSync: () => void;
  isLoading: boolean;
  isSyncing: boolean;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
  getStatusColor: (available: boolean) => string;
  getStatusIcon: (available: boolean) => React.ReactNode;
}

function PluginJarCard({ 
  plugin, 
  jarInfo, 
  onDownload, 
  onSync, 
  isLoading,
  isSyncing,
  formatFileSize,
  formatDate,
  getStatusColor,
  getStatusIcon
}: PluginJarCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {plugin.pluginName}
            </CardTitle>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(jarInfo?.available || false)}`}>
              {getStatusIcon(jarInfo?.available || false)}
              {jarInfo?.available ? 'JAR Available' : 'No JAR'}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plugin Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-2" />
            <span className="font-medium">Description:</span>
            <span className="ml-1">{plugin.description}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              MC {plugin.minecraftVersion}
            </Badge>
            <span className="ml-2">{plugin.totalFiles} files</span>
            <span className="mx-1">•</span>
            <span>{formatFileSize(plugin.totalSize)}</span>
          </div>
        </div>

        {/* JAR Information */}
        {jarInfo?.available && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4 mr-2" />
              <span className="font-medium">JAR:</span>
              <span className="ml-1">{jarInfo.fileName}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium">Size:</span>
              <span className="ml-1">{formatFileSize(jarInfo.fileSize || 0)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-medium">Compiled:</span>
              <span className="ml-1">{formatDate(jarInfo.lastModified || '')}</span>
            </div>
          </div>
        )}

        {/* Metadata */}
        {jarInfo?.metadata && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                v{jarInfo.metadata.version}
              </Badge>
              {jarInfo.metadata.author && (
                <Badge variant="outline" className="text-xs">
                  by {jarInfo.metadata.author}
                </Badge>
              )}
            </div>
            {jarInfo.metadata.dependencies && jarInfo.metadata.dependencies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {jarInfo.metadata.dependencies.map((dep, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                    {dep}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {jarInfo?.available && (
            <Button
              onClick={onDownload}
              disabled={isLoading}
              className="flex-1"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JAR
            </Button>
          )}
          <Button
            onClick={onSync}
            disabled={isLoading || isSyncing}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Sync JAR
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
