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
  Download,
  Code2,
} from 'lucide-react';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';
import { WelcomeCard } from './WelcomeCard';
import { DashboardLoadingState } from './DashboardLoadingState';
import { CreatePluginModal } from './CreatePluginModal';
import { TokenUsageStats } from './TokenUsageStats';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ServerConsolePanel } from './ServerConsolePanel';

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
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';

  // Get userId from session or fall back to testuser in development
  const currentUserId = isDevelopmentMode 
    ? 'testuser' 
    : (session?.user?.id || userId || 'testuser');
  
  // Get user email for display purposes
  const currentUserEmail = isDevelopmentMode 
    ? 'test@example.com' 
    : (session?.user?.email || 'User');

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
  // Example: get API token from session or user context
  // TODO: Replace with real token logic or prompt user for token if not present
  const apiToken = '';

  // Show loading state
  if (isLoadingData) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="min-h-screen bg-animated-grid bg-particles font-sans relative overflow-hidden">
      {/* Enhanced ambient background elements */}
      <div className="absolute inset-0 bg-grid-small opacity-[0.13] dark:opacity-[0.08] z-0"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse z-0"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-chart-1/12 via-chart-1/6 to-transparent rounded-full blur-3xl animate-pulse z-0" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-64 h-64 bg-gradient-to-br from-chart-3/12 to-transparent rounded-full blur-2xl animate-pulse z-0" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-4 md:px-8 py-12 space-y-20 animate-in fade-in-0 duration-700 relative z-10">
        {/* Welcome Section with Blurred Minecraft BG */}
        <div className="animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
          <div className="relative rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 md:p-4 overflow-hidden">
            {/* Minecraft Hero Image Decorative Element - Card background, overflow hidden */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-3xl">
              <img
                src="/minecraft-hero.jpg"
                alt="Minecraft Hero"
                className="w-full h-full object-cover blur-[6px] brightness-[.75] opacity-90 shadow-2xl animate-float-mc"
                style={{ display: 'block' }}
              />
            </div>
            <div className="relative z-10">
              <WelcomeCard 
                userName={currentUserEmail}
                onCreatePlugin={handleCreateNewPlugin}
                onQuickStart={handleCreateNewPlugin}
              />
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="animate-in fade-in slide-in-from-top-8 duration-700 delay-200">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Stats Card Example */}
              <Card className="dashboard-card accent-blue group relative overflow-hidden border-0 rounded-3xl bg-black/70 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-[1.025] hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-color/10 via-transparent to-accent-color/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 relative z-10">
                  <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Total Plugins</CardTitle>
                  <div className="w-14 h-14 rounded-2xl glassmorphism flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-color to-accent-color/80 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-accent-color mb-3 drop-shadow-lg">{stats.totalPlugins}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <div className="w-2 h-2 rounded-full bg-accent-color animate-pulse"></div>
                    <TrendingUp className="h-3 w-3" />
                    <span>All time projects</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="dashboard-card accent-emerald group relative overflow-hidden border-0 rounded-3xl bg-black/70 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-[1.025] hover:shadow-emerald-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-color/10 via-transparent to-accent-color/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 relative z-10">
                  <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Recent Projects</CardTitle>
                  <div className="w-14 h-14 rounded-2xl glassmorphism flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-color to-accent-color/80 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-accent-color mb-3 drop-shadow-lg">{stats.recentPlugins}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <div className="w-2 h-2 rounded-full bg-accent-color animate-pulse"></div>
                    <Rocket className="h-3 w-3" />
                    <span>Last 30 days</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="dashboard-card accent-purple group relative overflow-hidden border-0 rounded-3xl bg-black/70 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-[1.025] hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-color/10 via-transparent to-accent-color/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 relative z-10">
                  <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">MC Versions</CardTitle>
                  <div className="w-14 h-14 rounded-2xl glassmorphism flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-color to-accent-color/80 flex items-center justify-center">
                      <Code className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {stats.favoriteMinecraftVersions.slice(0, 3).map((ver, index) => (
                        <Badge 
                          key={ver} 
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 shadow-sm transition-all duration-300 ${
                            index === 0 
                              ? 'bg-accent-color text-white' 
                              : index === 1
                              ? 'bg-accent-color/80 text-white'
                              : 'bg-accent-color/60 text-white'
                          }`}
                        >
                          {ver}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                      <div className="w-2 h-2 rounded-full bg-accent-color animate-pulse"></div>
                      <Code className="h-3 w-3" />
                      <span>Most popular</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="dashboard-card accent-amber group relative overflow-hidden border-0 rounded-3xl bg-black/70 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:scale-[1.025] hover:shadow-amber-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-color/10 via-transparent to-accent-color/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-5 relative z-10">
                  <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">Activity</CardTitle>
                  <div className="w-14 h-14 rounded-2xl glassmorphism flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-color to-accent-color/80 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-accent-color mb-3 drop-shadow-lg">{stats.recentPluginsList.length}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                    <div className="w-2 h-2 rounded-full bg-accent-color animate-pulse"></div>
                    <Calendar className="h-3 w-3" />
                    <span>Recent actions</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        {/* Quick Actions Section */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="space-y-6 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 md:p-4">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border border-primary/20 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Actions Hub</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-gradient-primary">
                Quick Actions
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Jump into your development workflow with our powerful tools and features
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                className="group border-2 border-amber-400/30 hover:border-amber-400 hover:bg-amber-100/10 transition-all duration-300 font-semibold px-6 py-3 rounded-2xl backdrop-blur-lg flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 shadow-lg hover:shadow-amber-500/20 animate-pulse-slow"
                onClick={() => setAnalyticsOpen(true)}
              >
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-orange-600">
                  AI Usage Analytics
                </span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 text-amber-500" />
              </Button>
              <Button
                variant="outline"
                className="group border-2 border-blue-400/30 hover:border-blue-400 hover:bg-blue-100/10 transition-all duration-300 font-semibold px-6 py-3 rounded-2xl backdrop-blur-lg flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 shadow-lg hover:shadow-blue-500/20 animate-pulse-slow"
                onClick={() => { setSelectedServerId('your-server-id-here'); setConsoleOpen(true); }}
              >
                <Code2 className="h-5 w-5 text-blue-500 icon-premium" />
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-cyan-600">
                  Open Server Console
                </span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 text-blue-500" />
              </Button>
            </div>
          </div>
        </div>
        {/* Recent Plugins */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-xl p-2 md:p-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Recent Work</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-gradient-primary">
                  Recent Projects
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Your latest plugin developments and recent activity across all projects
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/projects')}
                className="group border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 font-semibold px-6 py-3 rounded-2xl backdrop-blur-lg"
              >
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary">
                  View All Projects
                </span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300 text-primary" />
              </Button>
            </div>
            {isLoadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse rounded-2xl bg-black/60 backdrop-blur-lg">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plugins.slice(0, 6).map((plugin, index) => (
                  <Card key={plugin._id} className={`dashboard-card group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 rounded-2xl bg-black/60 backdrop-blur-lg ${
                    index % 4 === 0 ? 'accent-blue hover:shadow-blue-500/20' : 
                    index % 4 === 1 ? 'accent-emerald hover:shadow-emerald-500/20' :
                    index % 4 === 2 ? 'accent-purple hover:shadow-purple-500/20' : 'accent-amber hover:shadow-amber-500/20'
                  }`}>
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      index % 4 === 0 ? 'gradient-overlay-blue' :
                      index % 4 === 1 ? 'gradient-overlay-emerald' :
                      index % 4 === 2 ? 'gradient-overlay-purple' : 'gradient-overlay-amber'
                    }`}></div>
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1 min-w-0">
                          <CardTitle className="truncate text-xl font-black text-accent-color group-hover:text-gradient-accent transition-all duration-300">
                            {plugin.pluginName}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-sm font-medium">
                            {plugin.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <Badge className="ml-3 shrink-0 bg-accent-color/20 border-accent-color/40 text-accent-color font-bold px-3 py-1">
                          {plugin.minecraftVersion || 'N/A'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent-color/15 border border-accent-color/30 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-accent-color" />
                          </div>
                          <span>{plugin.files?.length || 0} files</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent-color/15 border border-accent-color/30 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-accent-color" />
                          </div>
                          <span>{new Date(plugin.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Separator className="bg-border/50" />
                      <div className="flex gap-3 border-2 border-red-500 bg-black/30 p-2 rounded-xl"> {/* DEBUG: Add border and bg to see button row */}
                        <Button 
                          size="sm" 
                          onClick={() => handleEditPlugin(plugin.pluginName)}
                          className="flex-1 matte-button hover:bg-accent-color hover:border-accent-color font-bold rounded-xl text-white border-2 border-accent-color/80 bg-gradient-to-br from-accent-color/80 to-accent-color/60 shadow-lg"
                          style={{ opacity: 1, zIndex: 10 }}
                        >
                          <Edit className="h-4 w-4 mr-2 text-white" style={{ opacity: 1 }} />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => handleDownloadJar(e, plugin.pluginName)}
                          className="px-4 border-accent-color/40 hover:border-accent-color hover:bg-accent-color/15 transition-all duration-300 rounded-xl"
                        >
                          <Download className="h-4 w-4 text-accent-color" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/10 to-background shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-2xl backdrop-blur-lg">
                <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center mb-8 shadow-lg">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Package className="h-12 w-12 text-primary/70" />
                    </div>
                  </div>
                  <h3 className="font-black text-2xl mb-4 text-foreground">No plugins yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm text-lg font-medium leading-relaxed">
                    Get started by creating your first Minecraft plugin with our AI-powered generator.
                  </p>
                  <Button onClick={handleCreateNewPlugin} className="matte-button font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 rounded-xl">
                    <Plus className="h-5 w-5 mr-3" />
                    Create Your First Plugin
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {/* Create Plugin Modal */}
        <CreatePluginModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onCreatePlugin={handleCreatePlugin}
          isLoading={isLoading}
          userId={currentUserId}
        />
        {/* Analytics Sheet */}
        <Sheet open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
          <SheetContent side="right" className="max-w-lg w-full bg-background/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                AI Usage Analytics
              </SheetTitle>
              <SheetDescription>
                Monitor your OpenRouter API token consumption and optimize your AI-powered development workflow.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <TokenUsageStats userId={currentUserId} />
            </div>
          </SheetContent>
        </Sheet>
        {/* Server Console Sheet */}
        <Sheet open={consoleOpen} onOpenChange={setConsoleOpen}>
          <SheetContent side="right" className="max-w-2xl w-full bg-background/95 backdrop-blur-2xl border-l border-blue-500/20 shadow-2xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-blue-500 icon-premium" />
                Server Console
              </SheetTitle>
              <SheetDescription>
                Live Minecraft/game server console. View output and send commands in real time.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {selectedServerId && apiToken ? (
                <ServerConsolePanel serverId={selectedServerId} apiToken={apiToken} onClose={() => setConsoleOpen(false)} />
              ) : (
                <div className="text-muted-foreground">No server selected or missing API token.</div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
