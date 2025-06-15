'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPluginForm } from './dashboard/DashboardPluginForm';
import { DashboardChatSection } from './dashboard/DashboardChatSection';
import { VSCodeFileExplorer } from './dashboard/VSCodeFileExplorer';
import { DashboardStatsCards } from './dashboard/DashboardStatsCards';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Rocket, 
  Bot, 
  FileCode, 
  MessageSquare, 
  Clock,
  ChevronRight
} from 'lucide-react';

interface ProjectFile {
  path: string;
  content: string;
}

interface ProjectData {
  projectExists: boolean;
  pluginProject?: {
    projectName: string;
    minecraftVersion: string;
    dependencies?: string[];
    files: ProjectFile[];
  };
}

interface Results {
  result: string;
  requestData: {
    userId: string;
    name?: string;
  };
}

interface CurrentProject {
  userId: string;
  pluginName: string;
}

interface Message {
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: string;
    contextLoaded?: boolean;
    filesAnalyzed?: number;
  };
}

export type DashboardView = 'overview' | 'generate' | 'chat' | 'files' | 'projects' | 'history' | 'settings';

interface EnhancedDashboardContentProps {
  isLoading: boolean;
  results: Results | null;
  currentProject: CurrentProject | null;
  projectFiles: ProjectData | null;
  generatePlugin: (data: { prompt: string; userId: string; pluginName?: string }) => void;
  downloadJar: (userId: string, pluginName: string) => void;
  downloadInstructions: () => void;
  loadProjectFiles: (userId: string, pluginName: string) => void;
  checkExistingProject: (pluginName: string, userId: string) => void;
  sendChatMessage: (message: string) => void;
  chatMessages: Message[];
  clearChat: () => void;
  addChatMessage: (type: Message['type'], content: string, metadata?: Message['metadata']) => void;
  projectStatus: string | null;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export function EnhancedDashboardContent(props: EnhancedDashboardContentProps) {
  const {
    isLoading,
    results,
    currentProject,
    projectFiles,
    generatePlugin,
    downloadJar,
    downloadInstructions,
    loadProjectFiles,
    checkExistingProject,
    sendChatMessage,
    chatMessages,
    clearChat,
    projectStatus,
    currentView,
    onViewChange
  } = props;

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome to Pegasus
          </h1>
          <p className="text-lg text-muted-foreground">
            AI-powered Minecraft plugin development platform
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Rocket className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Stats Cards */}
      <DashboardStatsCards 
        currentProject={currentProject}
        projectFiles={projectFiles}
        chatMessages={chatMessages}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewChange('generate')}>
          <CardHeader className="pb-4">
            <div className="p-3 bg-primary/10 rounded-xl w-fit">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Generate Plugin</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a new Minecraft plugin with AI assistance</p>
            <Button size="sm" className="w-full">
              Get Started
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewChange('chat')}>
          <CardHeader className="pb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit">
              <Bot className="h-8 w-8 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
            <p className="text-sm text-muted-foreground mb-4">Get help with plugin development and coding</p>
            <Button size="sm" variant="outline" className="w-full">
              Start Chat
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewChange('files')}>
          <CardHeader className="pb-4">
            <div className="p-3 bg-green-500/10 rounded-xl w-fit">
              <FileCode className="h-8 w-8 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">File Manager</h3>
            <p className="text-sm text-muted-foreground mb-4">Explore and manage your plugin project files</p>
            <Button size="sm" variant="outline" className="w-full">
              Browse Files
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewChange('projects')}>
          <CardHeader className="pb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl w-fit">
              <Rocket className="h-8 w-8 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Projects</h3>
            <p className="text-sm text-muted-foreground mb-4">Manage and organize your plugin projects</p>
            <Button size="sm" variant="outline" className="w-full">
              View Projects
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => onViewChange('history')}>
          <CardHeader className="pb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl w-fit">
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Chat History</h3>
            <p className="text-sm text-muted-foreground mb-4">Review previous conversations and solutions</p>
            <Button size="sm" variant="outline" className="w-full">
              View History
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {(currentProject || chatMessages.length > 0) && (
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentProject && (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileCode className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Current Project</p>
                    <p className="text-sm text-muted-foreground">{currentProject.pluginName}</p>
                  </div>
                </div>                <Button size="sm" onClick={() => onViewChange('files')}>
                  View Files
                </Button>
              </div>
            )}
            {chatMessages.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Recent Chat</p>
                    <p className="text-sm text-muted-foreground">{chatMessages.length} messages</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onViewChange('chat')}>
                  Continue Chat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderGenerate = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Plugin Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Create Minecraft plugins with AI assistance
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Rocket className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Main Generation Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plugin Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                Generate Plugin
              </CardTitle>
              <CardDescription className="text-base">
                Describe your plugin idea and let AI create it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">              <DashboardPluginForm
                onSubmit={generatePlugin}
                isLoading={isLoading}
                onPluginNameChange={checkExistingProject}
                projectStatus={projectStatus}
              />
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && (
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Generation Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border transition-all duration-300 ${
                    results.result.includes('COMPILATION SUCCESSFUL') 
                      ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800/50' 
                      : 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800/50'
                  }`}>
                    <pre className="text-sm overflow-auto whitespace-pre-wrap font-mono max-h-40">
                      {results.result}
                    </pre>
                  </div>
                  
                  {results.result.includes('COMPILATION SUCCESSFUL') && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadJar(results.requestData.userId, results.requestData.name || 'plugin')}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Download JAR
                      </button>
                      <button
                        onClick={downloadInstructions}
                        className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-secondary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Installation Guide
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Help Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Getting Started</h4>
                  <p className="text-xs text-muted-foreground">Enter a plugin idea and let AI generate the code</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Best Practices</h4>
                  <p className="text-xs text-muted-foreground">Be specific about features and functionality</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Need Help?</h4>
                  <p className="text-xs text-muted-foreground">Use the AI Assistant for guidance</p>
                </div>
              </div>
              <Button 
                onClick={() => onViewChange('chat')} 
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <Bot className="h-4 w-4 mr-2" />
                Ask AI Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            AI Assistant
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentProject?.pluginName 
              ? `Get help with ${currentProject.pluginName}` 
              : 'Ask questions about plugin development'
            }
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Bot className="h-4 w-4" />
          AI-Powered
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Full-Size Chat Interface */}
      <Card className="h-[calc(100vh-20rem)] flex flex-col border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bot className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription className="text-base">
            {currentProject?.pluginName 
              ? `Chat about ${currentProject.pluginName}` 
              : 'Ask questions about plugin development'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden pt-2 flex flex-col min-h-0">
          <DashboardChatSection
            messages={chatMessages}
            onSendMessage={sendChatMessage}
            onClearChat={clearChat}
            currentProject={currentProject}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
  const renderFiles = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            File Manager
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentProject?.pluginName 
              ? `Explore ${currentProject.pluginName} files` 
              : 'Browse and manage your plugin project files'
            }
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <FileCode className="h-4 w-4" />
          VSCode-like
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Full-Size File Explorer */}
      <div className="h-[calc(100vh-20rem)]">
        {projectFiles ? (
          <VSCodeFileExplorer
            projectFiles={projectFiles}
            currentProject={currentProject}
            onDownloadJar={downloadJar}
            onDownloadInstructions={downloadInstructions}
            onRefreshProject={loadProjectFiles}
          />
        ) : (
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileCode className="h-5 w-5 text-primary" />
                File Explorer
              </CardTitle>
              <CardDescription className="text-base">
                Generate a plugin to explore project files
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <div className="p-4 bg-muted/30 rounded-2xl w-fit mx-auto mb-4">
                  <FileCode className="h-12 w-12 opacity-50" />
                </div>
                <p className="text-base font-medium mb-1">No project files available</p>
                <p className="text-sm mb-4">Generate a plugin to explore the file structure</p>
                <Button onClick={() => onViewChange('generate')}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Generate Plugin
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Projects
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and organize your plugin projects
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <Rocket className="h-4 w-4" />
          Project Hub
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Project Management Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Project Card */}
        {currentProject ? (
          <Card className="lg:col-span-2 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                Current Project
              </CardTitle>
              <CardDescription className="text-base">
                {currentProject.pluginName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Info */}
              {projectFiles?.pluginProject && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/30 rounded-2xl border border-muted">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Project Name</div>
                    <div className="text-sm text-muted-foreground font-mono">{projectFiles.pluginProject.projectName}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Minecraft Version</div>
                    <div className="text-sm text-muted-foreground font-mono">{projectFiles.pluginProject.minecraftVersion}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Files</div>
                    <div className="text-sm text-muted-foreground">
                      {projectFiles.pluginProject.files.length} files
                    </div>
                  </div>
                </div>
              )}

              {/* Project Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => onViewChange('files')}
                  className="h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FileCode className="h-5 w-5 mr-2" />
                  Browse Files
                </Button>
                <Button
                  onClick={() => onViewChange('chat')}
                  variant="outline"
                  className="h-12 rounded-xl border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
                >
                  <Bot className="h-5 w-5 mr-2" />
                  Ask AI About Project
                </Button>
              </div>

              {/* Download Actions */}
              {projectFiles?.pluginProject && (
                <div className="flex gap-3 pt-4 border-t border-muted/50">
                  <Button
                    onClick={() => downloadJar(currentProject.userId, currentProject.pluginName)}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-0 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all duration-200"
                  >
                    Download JAR
                  </Button>
                  <Button
                    onClick={downloadInstructions}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl border-0 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all duration-200"
                  >
                    Installation Guide
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Rocket className="h-5 w-5 text-primary" />
                No Active Project
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <div className="p-4 bg-muted/30 rounded-2xl w-fit mx-auto mb-4">
                  <Rocket className="h-12 w-12 opacity-50" />
                </div>
                <p className="text-base font-medium mb-1">No project loaded</p>
                <p className="text-sm mb-4">Generate a plugin to get started</p>
                <Button onClick={() => onViewChange('generate')}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Generate Plugin
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => onViewChange('generate')} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Rocket className="h-4 w-4 mr-2" />
                New Plugin
              </Button>
              <Button 
                onClick={() => onViewChange('files')} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                disabled={!projectFiles}
              >
                <FileCode className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              <Button 
                onClick={() => onViewChange('chat')} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
              <Button 
                onClick={() => onViewChange('history')} 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat History
              </Button>
            </CardContent>
          </Card>

          {/* Project Stats */}
          {projectFiles?.pluginProject && (
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Files</span>
                    <span className="text-sm font-medium">{projectFiles.pluginProject.files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Java Files</span>
                    <span className="text-sm font-medium">
                      {projectFiles.pluginProject.files.filter(f => f.path.endsWith('.java')).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Config Files</span>
                    <span className="text-sm font-medium">
                      {projectFiles.pluginProject.files.filter(f => f.path.endsWith('.yml') || f.path.endsWith('.yaml')).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dependencies</span>
                    <span className="text-sm font-medium">
                      {projectFiles.pluginProject.dependencies?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Chat History
          </h1>
          <p className="text-lg text-muted-foreground">
            Review previous conversations and solutions
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
          <MessageSquare className="h-4 w-4" />
          {chatMessages.length} messages
        </Badge>
      </div>

      <Separator className="my-8" />

      {/* Chat History Interface */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Recent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chatMessages.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-[80%] p-4 rounded-xl ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 border border-muted'
                    }`}>
                      <div className="text-sm break-words">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-base font-medium mb-1">No chat history yet</p>
              <p className="text-sm mb-4">Start a conversation with the AI assistant</p>
              <Button onClick={() => onViewChange('chat')}>
                <Bot className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Configure your Pegasus experience
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  // Render based on current view
  switch (currentView) {
    case 'overview':
      return renderOverview();
    case 'generate':
      return renderGenerate();
    case 'chat':
      return renderChat();
    case 'files':
      return renderFiles();
    case 'projects':
      return renderProjects();
    case 'history':
      return renderHistory();
    case 'settings':
      return renderSettings();
    default:
      return renderOverview();
  }
}
