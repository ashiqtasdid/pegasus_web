'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPluginForm } from './dashboard/DashboardPluginForm';
import { DashboardChatSection } from './dashboard/DashboardChatSection';
import { VSCodeFileExplorer } from './dashboard/VSCodeFileExplorer';
import { DashboardStatsCards } from './dashboard/DashboardStatsCards';
import { Rocket, Bot } from 'lucide-react';

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

interface DashboardContentProps {
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
}

export function DashboardContent(props: DashboardContentProps) {
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
    projectStatus
  } = props;  return (
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

      {/* Stats Cards */}
      <DashboardStatsCards 
        currentProject={currentProject}
        projectFiles={projectFiles}
        chatMessages={chatMessages}
      />      {/* Main Grid Layout - Enhanced for better chat and file manager */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-20rem)]">
        {/* Plugin Generation Form - Takes 1 column */}
        <div className="xl:col-span-1 space-y-6 overflow-y-auto">
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
            <CardContent className="pt-2">
              <DashboardPluginForm
                onSubmit={generatePlugin}
                isLoading={isLoading}
                onPluginNameChange={checkExistingProject}
                onUserIdChange={checkExistingProject}
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

        {/* VSCode-like File Manager Section - Takes 1 column */}
        <div className="xl:col-span-1 min-h-0">
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
                  <Bot className="h-5 w-5 text-primary" />
                  File Explorer
                </CardTitle>
                <CardDescription className="text-base">
                  Generate a plugin to explore project files
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <div className="p-4 bg-muted/30 rounded-2xl w-fit mx-auto mb-4">
                    <Bot className="h-12 w-12 opacity-50" />
                  </div>
                  <p className="text-base font-medium mb-1">No project files available</p>
                  <p className="text-sm">Generate a plugin to explore the file structure</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Chat Section - Takes 2 columns */}
        <div className="xl:col-span-2 min-h-0">
          <Card className="h-full flex flex-col border-0 shadow-lg bg-card/50 backdrop-blur-sm min-h-[600px]">
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
          </Card>        </div>
      </div>
    </div>
  );
}
