'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Folder, 
  Download, 
  Book, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  FileCode2
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

interface DashboardProjectSectionProps {
  projectFiles: ProjectData;
  currentProject?: {
    userId: string;
    pluginName: string;
  } | null;
  onDownloadJar: (userId: string, pluginName: string) => void;
  onDownloadInstructions: () => void;
  onRefreshProject: (userId: string, pluginName: string) => void;
}

export function DashboardProjectSection({
  projectFiles,
  currentProject,
  onDownloadJar,
  onDownloadInstructions,
  onRefreshProject
}: DashboardProjectSectionProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<number>>(new Set([0])); // Expand first file by default
  if (!projectFiles?.projectExists || !projectFiles.pluginProject) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Folder className="h-5 w-5 text-primary" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-center py-12 text-muted-foreground">
            <div className="p-4 bg-muted/30 rounded-2xl w-fit mx-auto mb-4">
              <Folder className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-base font-medium mb-1">No project files available</p>
            <p className="text-sm">Generate a plugin to see the project structure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { pluginProject } = projectFiles;

  const toggleFile = (index: number) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFiles(newExpanded);
  };

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'java':
        return '☕';
      case 'yml':
      case 'yaml':
        return '⚙️';
      case 'xml':
        return '📄';
      case 'md':
        return '📝';
      case 'json':
        return '🔧';
      default:
        return '📄';
    }
  };

  const formatCodeWithLineNumbers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="flex text-xs">
        <span className="text-muted-foreground w-8 text-right mr-3 select-none">
          {index + 1}
        </span>
        <span className="font-mono">{line || ' '}</span>
      </div>
    ));
  };  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Folder className="h-5 w-5 text-primary" />
            Project Files
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => currentProject && onRefreshProject(currentProject.userId, currentProject.pluginName)}
            className="rounded-xl border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-2">
        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/30 rounded-2xl border border-muted">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Project Name</div>
            <div className="text-sm text-muted-foreground font-mono">{pluginProject.projectName}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold">Minecraft Version</div>
            <div className="text-sm text-muted-foreground font-mono">{pluginProject.minecraftVersion}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold">Dependencies</div>
            <div className="text-sm text-muted-foreground">
              {pluginProject.dependencies?.join(', ') || 'None'}
            </div>
          </div>
        </div>

        {/* Download Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => currentProject && onDownloadJar(currentProject.userId, currentProject.pluginName)}
            className="flex-1 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Download JAR
          </Button>
          <Button
            variant="outline"
            onClick={onDownloadInstructions}
            className="flex-1 h-12 rounded-xl border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
          >
            <Book className="h-5 w-5 mr-2" />
            Guide
          </Button>
        </div>

        <Separator className="my-6" />

        {/* File Tree */}
        <div>
          <div className="text-base font-semibold mb-4 flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-primary" />
            Project Structure
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {pluginProject.files.map((file, index) => {
                const fileName = file.path.split('/').pop() || file.path;
                const isExpanded = expandedFiles.has(index);

                return (
                  <div key={index} className="border-0 rounded-2xl overflow-hidden bg-muted/20 hover:bg-muted/30 transition-all duration-200">
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left group"
                      onClick={() => toggleFile(index)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <span className="text-xl mr-2">{getFileIcon(file.path)}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold group-hover:text-primary transition-colors">{fileName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{file.path}</div>
                      </div>
                      <Badge variant="outline" className="text-xs rounded-lg border-0 bg-primary/10 text-primary">
                        {file.path.split('.').pop()?.toUpperCase()}
                      </Badge>
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-muted/50">
                        <div className="p-4 bg-muted/50">
                          <div className="bg-background/80 rounded-xl border border-muted p-4">
                            <div className="text-xs text-muted-foreground mb-3 font-mono font-semibold">
                              {file.path}
                            </div>
                            <ScrollArea className="h-[200px]">
                              <div className="space-y-1">
                                {formatCodeWithLineNumbers(file.content)}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
