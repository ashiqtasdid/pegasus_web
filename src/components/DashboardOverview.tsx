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
import { TokenUsageStats } from './TokenUsageStats';

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
  };  const handleEditPlugin = (pluginName: string) => {
    router.push(`/dashboard/editor?plugin=${pluginName}&userId=${encodeURIComponent(currentUserId)}`);
  };const handleDownloadJar = async (e: React.MouseEvent, pluginName: string) => {
    e.preventDefault();
    e.stopPropagation();
    await downloadJar(currentUserId, pluginName);
  };
  // Show loading state
  if (isLoadingData) {
    return <DashboardLoadingState />;
  }return (
    <div className="space-y-8">      {/* Welcome Section */}
      <WelcomeCard 
        userName={currentUserId}
        onCreatePlugin={handleCreateNewPlugin}
        onQuickStart={handleCreateNewPlugin}
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlugins}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Projects</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentPlugins}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MC Versions</CardTitle>
              <Code className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {stats.favoriteMinecraftVersions.slice(0, 2).map((ver) => (
                    <Badge key={ver} variant="secondary" className="text-xs">
                      {ver}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Most used</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentPluginsList.length}</div>
              <p className="text-xs text-muted-foreground">
                Recent actions
              </p>
            </CardContent>
          </Card>
        </div>
      )}      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer border-dashed border-2" onClick={handleCreateNewPlugin}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Create New Plugin</h3>
            <p className="text-sm text-muted-foreground">Start building a new Minecraft plugin with AI assistance</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => setCreateModalOpen(true)}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Rocket className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Quick Start Guide</h3>
            <p className="text-sm text-muted-foreground">Learn how to create your first plugin</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => router.push(`/dashboard/editor?userId=${encodeURIComponent(currentUserId)}`)}>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Code Editor</h3>
            <p className="text-sm text-muted-foreground">Edit your plugins with our advanced editor</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Token Usage Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Usage Analytics</h2>
          <p className="text-muted-foreground">Track your OpenRouter API token consumption</p>
        </div>
        <TokenUsageStats userId={currentUserId} />
      </div>

      {/* Recent Plugins */}
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
              <Card key={plugin._id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="truncate text-lg">
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
                      onClick={() => handleEditPlugin(plugin.pluginName)}
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
            </CardContent>
          </Card>
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
