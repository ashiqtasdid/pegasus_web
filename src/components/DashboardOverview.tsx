'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Edit, 
  Package,
  Code,
  FileText,
  TrendingUp,
  Download,
  Code2,
  Server,
  Terminal,
  Search,
  Bell,
  Settings,
  Activity,
  Users,
  BarChart3,
  Zap,

  ArrowUp,
  MoreVertical,
  Filter,
  Layout,
  Sparkles,
  Database,
  
  Cpu,
  HardDrive,
  Wifi,
  
} from 'lucide-react';
import { DownloadButton } from './DownloadButton';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';
import { DashboardLoadingState } from './DashboardLoadingState';
import { CreatePluginModal } from './CreatePluginModal';
import { useDashboardData } from '@/hooks/useDashboardData';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

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
  const { generatePlugin, isLoading: isGenerating } = usePluginGenerator();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [stats, setStats] = useState<PluginStats | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{
    canUseTokens: boolean;
    tokensUsed: number;
    tokenLimit: number;
    tokensRemaining: number;
    usagePercentage: number;
    totalTokensUsed?: number;
    monthlyLimit?: number;
  } | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dashboard data hook
  const { } = useDashboardData();

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
    loadTokenUsage();
  }, []);

  const loadPlugins = async () => {
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

  const loadTokenUsage = async () => {
    try {
      setTokenLoading(true);
      const response = await fetch('/api/user/tokens');
      const data = await response.json();
      
      if (response.ok) {
        setTokenUsage(data);
        setTokenError(null);
        console.log('Loaded token usage:', data);
      } else {
        setTokenError(data.error || 'Failed to load token usage');
      }
    } catch (err) {
      console.error('Error loading token usage:', err);
      setTokenError('Failed to load token usage');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCreateNewPlugin = () => {
    setCreateModalOpen(true);
  };

  const handleCreatePlugin = (data: { prompt: string; userId: string; pluginName?: string }) => {
    // Check if user has tokens before generating
    if (tokenUsage && !tokenUsage.canUseTokens) {
      alert('You have reached your token limit. Please upgrade your plan or wait for the limit to reset.');
      return;
    }
    
    // Generate plugin and handle success/error
    generatePlugin(data);
    
    // Listen for plugin generation completion
    const handlePluginGenerated = (event: CustomEvent) => {
      const { success } = event.detail;
      if (success) {
        // Refresh data after successful generation
        setTimeout(() => {
          loadPlugins();
          loadStats();
          loadTokenUsage();
        }, 1000);
      }
    };
    
    // Add event listener for this generation
    if (typeof window !== 'undefined') {
      window.addEventListener('plugin-generated', handlePluginGenerated as EventListener);
      
      // Clean up listener after 30 seconds (generation should complete by then)
      setTimeout(() => {
        window.removeEventListener('plugin-generated', handlePluginGenerated as EventListener);
      }, 30000);
    }
  };

  const handleEditPlugin = (pluginName: string) => {
    router.push(`/dashboard/editor?plugin=${pluginName}&userId=${encodeURIComponent(currentUserId)}`);
  };

  const filteredPlugins = plugins.filter(plugin => 
    plugin.pluginName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingData) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Image 
                      src="/pegasus-logo.svg" 
                      alt="Pegasus Logo" 
                      width={24}
                      height={24}
                      className="w-6 h-6 text-white" 
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Pegasus
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Plugin Development Studio</p>
                </div>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search plugins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-white/50 backdrop-blur-sm border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                />
              </div>
              
              <Button size="sm" variant="outline" className="bg-white/50 backdrop-blur-sm">
                <Bell className="w-4 h-4 mr-2" />
                <Badge variant="destructive" className="ml-1 text-xs">3</Badge>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@username" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {currentUserEmail.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUserEmail}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUserId}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Team</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back, {currentUserEmail.split('@')[0]}! 👋
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Ready to build something amazing? Your workspace is waiting.
              </p>
            </div>
            <Button 
              onClick={handleCreateNewPlugin}
              disabled={tokenUsage ? !tokenUsage.canUseTokens : false}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              {tokenUsage && !tokenUsage.canUseTokens ? 'Token Limit Reached' : 'Create New Plugin'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Plugins</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalPlugins || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-slate-600 dark:text-slate-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Projects</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.recentPlugins || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+8%</span>
                <span className="text-slate-600 dark:text-slate-400 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Downloads</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">1,234</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+23%</span>
                <span className="text-slate-600 dark:text-slate-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">98.5%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+2.1%</span>
                <span className="text-slate-600 dark:text-slate-400 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Plugins */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
                      Recent Plugins
                    </CardTitle>
                    <CardDescription>
                      Your latest plugin projects and their status
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Layout className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPlugins.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No plugins yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Start building your first plugin with our AI assistant
                      </p>
                      <Button 
                        onClick={handleCreateNewPlugin}
                        disabled={tokenUsage ? !tokenUsage.canUseTokens : false}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {tokenUsage && !tokenUsage.canUseTokens ? 'Token Limit Reached' : 'Create Your First Plugin'}
                      </Button>
                    </div>
                  ) : (
                    filteredPlugins.map((plugin) => (
                      <div
                        key={plugin._id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
                        onClick={() => handleEditPlugin(plugin.pluginName)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Code className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {plugin.pluginName}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {plugin.description || 'No description'}
                              </p>
                              <div className="flex items-center space-x-3 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {plugin.minecraftVersion || 'Unknown'}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {new Date(plugin.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DownloadButton
                              userId={currentUserId}
                              pluginName={plugin.pluginName}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                              onDownloadComplete={() => {
                                console.log('Download completed for', plugin.pluginName);
                              }}
                              onDownloadError={(error) => {
                                console.error('Download error for', plugin.pluginName, error);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </DownloadButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditPlugin(plugin.pluginName)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DownloadButton
                                    userId={currentUserId}
                                    pluginName={plugin.pluginName}
                                    className="flex items-center w-full text-sm"
                                    onDownloadComplete={() => {
                                      console.log('Download completed for', plugin.pluginName);
                                    }}
                                    onDownloadError={(error) => {
                                      console.error('Download error for', plugin.pluginName, error);
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DownloadButton>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={handleCreateNewPlugin} 
                    disabled={tokenUsage ? !tokenUsage.canUseTokens : false}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {tokenUsage && !tokenUsage.canUseTokens ? 'No Tokens' : 'New Plugin'}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Code2 className="w-4 h-4 mr-2" />
                    Open Editor
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Terminal className="w-4 h-4 mr-2" />
                    Server Console
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">CPU Usage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">65%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Storage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">82%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Database</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Online</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Network</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Stable</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Usage Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tokenLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Loading token usage...</p>
                  </div>
                ) : tokenError ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-sm">{tokenError}</div>
                  </div>
                ) : tokenUsage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Used</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tokenUsage.totalTokensUsed?.toLocaleString() || 0} / {tokenUsage.monthlyLimit?.toLocaleString() || 0}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          tokenUsage.canUseTokens ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
                        }`}
                        style={{ width: `${Math.min(100, tokenUsage.usagePercentage || 0)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        {tokenUsage.tokensRemaining?.toLocaleString() || 0} remaining
                      </span>
                      <span className={`font-semibold ${tokenUsage.canUseTokens ? 'text-green-600' : 'text-red-600'}`}>
                        {tokenUsage.canUseTokens ? 'Available' : 'Limit Reached'}
                      </span>
                    </div>
                    
                    {!tokenUsage.canUseTokens && (
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="text-red-500">⚠️</div>
                          <div className="text-sm text-red-700 dark:text-red-300">
                            <strong>Token limit reached!</strong>
                            <p className="mt-1">Plugin generation is disabled. Please upgrade your plan or wait for the limit to reset.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-600 dark:text-slate-400">No token usage data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
          {/* My Game Servers */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  My Game Servers
                </CardTitle>
                <Button size="sm" variant="outline" disabled>
                  🚧 Coming Soon
                </Button>
              </div>
              <CardDescription>
                Server management feature under construction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl">🚧</div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Under Construction
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Game server management is coming soon! Monitor and control your Minecraft servers directly from the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My Support Tickets */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  My Support Tickets
                </CardTitle>
                <Button size="sm" variant="outline" disabled>
                  🚧 Coming Soon
                </Button>
              </div>
              <CardDescription>
                Support ticket system under construction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl">🚧</div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Under Construction
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Support ticket system is coming soon! Get help and track your support requests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Leaderboard */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200 dark:bg-slate-800/70 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Weekly Leaderboard
                </CardTitle>
                <Button size="sm" variant="outline" disabled>
                  🚧 Coming Soon
                </Button>
              </div>
              <CardDescription>
                Leaderboard system under construction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-4xl">🚧</div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Under Construction
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Leaderboard and competition features are coming soon! Compete with other creators and earn achievements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreatePluginModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreatePlugin={handleCreatePlugin}
        isLoading={isGenerating}
        userId={currentUserId}
      />
    </div>
  );
}
