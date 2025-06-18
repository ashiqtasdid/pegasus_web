'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { WelcomeCard } from './WelcomeCard';
import { DashboardLoadingState } from './DashboardLoadingState';
import { CreatePluginModal } from './CreatePluginModal';

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
  const { data: session } = useSession();
  const { downloadJar, generatePlugin, isLoading } = usePluginGenerator();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [stats, setStats] = useState<PluginStats | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';

  // Get userId from session or fall back to testuser in development
  const currentUserId = isDevelopmentMode 
    ? 'testuser' 
    : (session?.user?.id || userId || 'testuser');

  useEffect(() => {
    loadPlugins();
    loadStats();
  }, []);  const loadPlugins = async () => {
    try {
      setIsLoadingData(true);
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
      setIsLoadingData(false);
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
    setCreateModalOpen(true);
  };
  const handleCreatePlugin = (data: { prompt: string; userId: string; pluginName?: string }) => {
    generatePlugin(data);
    // Don't close modal immediately - let the modal handle its own state based on generation events
  };  const handleEditPlugin = (pluginId: string) => {
    router.push(`/dashboard/editor?plugin=${pluginId}&userId=${encodeURIComponent(currentUserId)}`);
  };const handleDownloadJar = async (e: React.MouseEvent, pluginName: string) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadJar(currentUserId, pluginName);
  };
  // Show loading state
  if (isLoadingData) {
    return <DashboardLoadingState />;
  }return (
    <div className="space-y-8">      {/* Enhanced Welcome Section */}
      <WelcomeCard 
        userName={currentUserId}
        onCreatePlugin={handleCreateNewPlugin}
        onQuickStart={handleCreateNewPlugin}
      />

      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Plugins</CardTitle>
              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{stats.totalPlugins}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Recent Projects</CardTitle>
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">{stats.recentPlugins}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">MC Versions</CardTitle>
              <Code className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {stats.favoriteMinecraftVersions.slice(0, 2).map((ver) => (
                    <Badge key={ver} variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {ver}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Most used</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{stats.recentPluginsList.length}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Recent actions
              </p>
            </CardContent>
          </Card>
        </div>
      )}      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 hover:border-primary/50" onClick={handleCreateNewPlugin}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create New Plugin</h3>
            <p className="text-sm text-muted-foreground">Start building a new Minecraft plugin with AI assistance</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setCreateModalOpen(true)}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <Rocket className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Quick Start Guide</h3>
            <p className="text-sm text-muted-foreground">Learn how to create your first plugin</p>
          </CardContent>
        </Card>        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => router.push(`/dashboard/editor?userId=${encodeURIComponent(currentUserId)}`)}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <FileText className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Code Editor</h3>
            <p className="text-sm text-muted-foreground">Edit your plugins with our advanced editor</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Plugins with Enhanced Design */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
            <p className="text-muted-foreground">Your latest plugin developments</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
            View All
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {isLoadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : plugins.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plugins.slice(0, 6).map((plugin) => (
              <Card key={plugin._id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-muted/20 hover:from-card hover:to-muted/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="truncate text-lg group-hover:text-primary transition-colors">
                        {plugin.pluginName}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {plugin.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {plugin.minecraftVersion || 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{plugin.files?.length || 0} files</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(plugin.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => handleEditPlugin(plugin._id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={(e) => handleDownloadJar(e, plugin.pluginName)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No plugins yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Get started by creating your first Minecraft plugin with our AI-powered generator.
              </p>
              <Button onClick={handleCreateNewPlugin}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plugin
              </Button>
            </CardContent>          </Card>
        )}
      </div>      {/* Create Plugin Modal */}
      <CreatePluginModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreatePlugin={handleCreatePlugin}
        isLoading={isLoading}
        userId={currentUserId}
      />
    </div>
  );
}
