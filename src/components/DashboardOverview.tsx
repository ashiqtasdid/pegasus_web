'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Package,
  Code,
  FileText,
  Rocket,
  ChevronRight,
  Calendar,
  TrendingUp,
  Download
} from 'lucide-react';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';

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

interface RecentPlugin {
  id: string;
  pluginName: string;
  description?: string;
  minecraftVersion?: string;
  createdAt: string;
  filesCount: number;
}

interface PluginStats {
  totalPlugins: number;
  recentPlugins: number;
  favoriteMinecraftVersions: string[];
  recentPluginsList: RecentPlugin[];
}

export function DashboardOverview() {
  const router = useRouter();
  const { downloadJar } = usePluginGenerator();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [stats, setStats] = useState<PluginStats | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
    loadStats();
  }, []);
  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/plugins');
      const data = await response.json();
      
      if (response.ok) {
        setPlugins(data.plugins);
        setUserId(data.userId || 'testuser');
        console.log('Loaded plugins for user:', data.userId, 'Count:', data.count);
      }
    } catch (err) {
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
        console.log('Loaded stats:', data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCreateNewPlugin = () => {
    router.push('/dashboard/create');
  };
  const handleEditPlugin = (pluginId: string) => {
    router.push(`/dashboard/editor?plugin=${pluginId}`);
  };

  const handleDownloadJar = async (e: React.MouseEvent, pluginName: string) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadJar(userId, pluginName);
  };

  return (
    <div className="space-y-8 p-6">      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome to Pegasus
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered Minecraft plugin development platform
          </p>
          {/* User ID and Plugin Count Display */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                User: {userId || 'Loading...'}
              </span>
            </div>
            {!isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {stats?.totalPlugins || 0} Plugin{(stats?.totalPlugins || 0) !== 1 ? 's' : ''} Generated
                </span>
              </div>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loading plugins...
                </span>
              </div>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Rocket className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.totalPlugins || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{stats?.recentPlugins || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">{plugins.filter(p => p.isActive).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create New Plugin Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group" onClick={handleCreateNewPlugin}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-primary/10 rounded-xl w-fit group-hover:bg-primary/20 transition-colors">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-3">Create New Plugin</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Start building a new Minecraft plugin with AI assistance. Generate code, add features, and deploy with ease.
            </p>
            <Button size="lg" className="w-full group-hover:shadow-lg transition-shadow">
              <Plus className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Modify Existing Plugin Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-blue-500/10 rounded-xl w-fit">
                <Edit className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold mb-3">Modify Existing Plugin</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Edit and enhance your existing plugins with AI-powered features and advanced code generation.
            </p>
            
            {plugins.length > 0 ? (
              <ScrollArea className="max-h-40 mb-4">
                <div className="space-y-2">
                  {plugins.slice(0, 3).map((plugin) => (
                    <div 
                      key={plugin._id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => handleEditPlugin(plugin._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{plugin.pluginName}</p>
                          <p className="text-xs text-muted-foreground">
                            {plugin.minecraftVersion && `MC ${plugin.minecraftVersion}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No plugins yet. Create your first plugin!</p>
              </div>
            )}
            
            {plugins.length > 3 && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/dashboard/plugins')}>
                View All Plugins ({plugins.length})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>      {/* Recent Activity */}
      {stats?.recentPluginsList && stats.recentPluginsList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentPluginsList.map((plugin) => (
              <Card key={plugin.id} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative" onClick={() => handleEditPlugin(plugin.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plugin.pluginName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {plugin.minecraftVersion || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {plugin.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(plugin.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{plugin.filesCount || 0} files</span>
                    </div>
                  </div>                  {/* Download JAR button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 z-10"
                    title="Download JAR"
                    onClick={e => handleDownloadJar(e, plugin.pluginName)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    JAR
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
