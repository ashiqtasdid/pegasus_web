'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Calendar,
  Code,
  Edit,
  Trash2,
  Plus,
  Loader2,
  FileText
} from 'lucide-react';

interface Plugin {
  _id: string;
  userId: string;
  pluginName: string;
  description?: string;
  minecraftVersion?: string;
  dependencies?: string[];
  files?: PluginFile[];
  metadata?: {
    mainClass?: string;
    version?: string;
    author?: string;
    apiVersion?: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface PluginFile {
  path: string;
  content: string;
  type: string;
}

interface PluginStats {
  totalPlugins: number;
  recentPlugins: Plugin[];
  favoriteMinecraftVersions: string[];
}

interface PluginManagerProps {
  onCreateNew?: () => void;
  onPluginSelect?: (plugin: Plugin) => void;
}

export function PluginManager({ onCreateNew, onPluginSelect }: PluginManagerProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [stats, setStats] = useState<PluginStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load plugins and stats
  useEffect(() => {
    loadPlugins();
    loadStats();
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await fetch('/api/plugins');
      const data = await response.json();
      
      if (response.ok) {
        setPlugins(data.plugins);
      } else {
        setError(data.error || 'Failed to load plugins');
      }
    } catch (err) {
      setError('Network error loading plugins');
      console.error('Error loading plugins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/plugins/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const deletePlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to delete this plugin?')) {
      return;
    }

    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlugins(plugins.filter(p => p._id !== pluginId));
        loadStats(); // Refresh stats
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete plugin');
      }
    } catch (err) {
      alert('Network error deleting plugin');
      console.error('Error deleting plugin:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plugins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Plugins</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadPlugins} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h2 className="text-lg font-semibold">My Plugins</h2>
          </div>
          <Button onClick={onCreateNew} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Plugin
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.totalPlugins}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.recentPlugins.length}</div>
                <div className="text-xs text-muted-foreground">Recent</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.favoriteMinecraftVersions.length}</div>
                <div className="text-xs text-muted-foreground">Versions</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Plugin List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {plugins.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Plugins Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first Minecraft plugin to get started!
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Plugin
              </Button>
            </div>
          ) : (
            plugins.map((plugin) => (
              <Card key={plugin._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {plugin.pluginName}
                      </CardTitle>
                      {plugin.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {plugin.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onPluginSelect?.(plugin)}
                        title="Open in Editor"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => deletePlugin(plugin._id)}
                        title="Delete Plugin"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      {plugin.minecraftVersion && (
                        <Badge variant="secondary" className="text-xs">
                          MC {plugin.minecraftVersion}
                        </Badge>
                      )}
                      {plugin.metadata?.version && (
                        <Badge variant="outline" className="text-xs">
                          v{plugin.metadata.version}
                        </Badge>
                      )}
                      {plugin.files && plugin.files.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {plugin.files.length} files
                        </Badge>
                      )}
                    </div>

                    {/* Dependencies */}
                    {plugin.dependencies && plugin.dependencies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plugin.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline" className="text-xs bg-blue-50">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(plugin.createdAt)}
                      </div>
                      {plugin.metadata?.author && (
                        <div>by {plugin.metadata.author}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
