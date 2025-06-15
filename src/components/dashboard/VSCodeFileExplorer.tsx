'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Folder, 
  FolderOpen,
  FileText,
  FileCode,
  Settings,
  Search,
  Download, 
  Book, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  FileCode2,
  File,
  Copy,
  Eye,
  Coffee
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

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  extension?: string;
}

interface VSCodeFileExplorerProps {
  projectFiles: ProjectData;
  currentProject?: {
    userId: string;
    pluginName: string;
  } | null;
  onDownloadJar: (userId: string, pluginName: string) => void;
  onDownloadInstructions: () => void;
  onRefreshProject: (userId: string, pluginName: string) => void;
}

export function VSCodeFileExplorer({
  projectFiles,
  currentProject,
  onDownloadJar,
  onDownloadInstructions,
  onRefreshProject
}: VSCodeFileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/main', 'src/main/java']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Build file tree from flat file list
  const fileTree = useMemo(() => {
    if (!projectFiles?.projectExists || !projectFiles.pluginProject?.files) return [];

    const tree: FileNode[] = [];
    const fileMap = new Map<string, FileNode>();

    // First pass: create all nodes
    projectFiles.pluginProject.files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!fileMap.has(currentPath)) {
          const isFile = index === parts.length - 1;
          const node: FileNode = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            content: isFile ? file.content : undefined,
            extension: isFile ? part.split('.').pop() : undefined
          };
          fileMap.set(currentPath, node);

          // Add to parent or root
          if (parentPath) {
            const parent = fileMap.get(parentPath);
            if (parent && parent.children) {
              parent.children.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    return tree;
  }, [projectFiles]);

  // Filter files based on search
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return projectFiles?.pluginProject?.files || [];
    return projectFiles?.pluginProject?.files?.filter(file => 
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [projectFiles, searchQuery]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      return expandedFolders.has(node.path) ? 
        <FolderOpen className="h-4 w-4 text-blue-500" /> : 
        <Folder className="h-4 w-4 text-blue-500" />;
    }

    switch (node.extension?.toLowerCase()) {
      case 'java':
        return <Coffee className="h-4 w-4 text-orange-600" />;
      case 'yml':
      case 'yaml':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'xml':
        return <FileCode className="h-4 w-4 text-green-600" />;
      case 'md':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'json':
        return <FileCode2 className="h-4 w-4 text-yellow-600" />;
      case 'properties':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderFileNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm transition-all duration-150 ${
            isSelected 
              ? 'bg-primary/20 text-primary-foreground' 
              : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node.path);
            }
          }}
        >
          {node.type === 'folder' ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <div className="w-3" />
          )}
          
          {getFileIcon(node)}
          
          <span className="truncate flex-1" title={node.name}>
            {node.name}
          </span>
          
          {node.type === 'file' && node.extension && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
              {node.extension.toUpperCase()}
            </Badge>
          )}
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children
              .sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => renderFileNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const formatCodeWithLineNumbers = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="flex text-sm hover:bg-muted/30 px-2 py-0.5 group">
        <span className="text-muted-foreground w-10 text-right mr-4 select-none text-xs leading-5 font-mono">
          {index + 1}
        </span>
        <span className="font-mono text-xs leading-5 break-all">{line || ' '}</span>
      </div>
    ));
  };

  const selectedFileContent = useMemo(() => {
    if (!selectedFile) return null;
    return projectFiles?.pluginProject?.files.find(f => f.path === selectedFile);
  }, [selectedFile, projectFiles]);

  if (!projectFiles?.projectExists || !projectFiles.pluginProject) {
    return (
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Folder className="h-5 w-5 text-primary" />
            File Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <div className="p-4 bg-muted/30 rounded-2xl w-fit mx-auto mb-4">
              <Folder className="h-12 w-12 opacity-50" />
            </div>
            <p className="text-base font-medium mb-1">No project files available</p>
            <p className="text-sm">Generate a plugin to explore the project structure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { pluginProject } = projectFiles;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Project Info Header */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="h-5 w-5 text-primary" />
              {pluginProject.projectName}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentProject && onRefreshProject(currentProject.userId, currentProject.pluginName)}
              className="rounded-lg border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl border border-muted/50">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground">MC VERSION</div>
              <div className="text-sm font-mono">{pluginProject.minecraftVersion}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground">FILES</div>
              <div className="text-sm font-mono">{pluginProject.files.length}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => currentProject && onDownloadJar(currentProject.userId, currentProject.pluginName)}
              size="sm"
              className="flex-1 h-9 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              JAR
            </Button>
            <Button
              variant="outline"
              onClick={onDownloadInstructions}
              size="sm"
              className="flex-1 h-9 rounded-lg border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
            >
              <Book className="h-4 w-4 mr-2" />
              Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Explorer */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCode2 className="h-5 w-5 text-primary" />
              Explorer
            </CardTitle>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-lg"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pt-0 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* File Tree */}
            <div className="min-h-0 flex flex-col">
              <div className="text-sm font-semibold mb-2 text-muted-foreground">PROJECT FILES</div>
              <ScrollArea className="flex-1 border border-muted/50 rounded-lg bg-muted/20">
                <div className="p-2">
                  {searchQuery ? (
                    <div className="space-y-1">
                      {filteredFiles.map((file, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer text-sm transition-all duration-150 ${
                            selectedFile === file.path 
                              ? 'bg-primary/20 text-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedFile(file.path)}
                        >
                          {getFileIcon({ 
                            name: file.path.split('/').pop() || '', 
                            path: file.path, 
                            type: 'file',
                            extension: file.path.split('.').pop()
                          })}
                          <span className="truncate flex-1" title={file.path}>
                            {file.path}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {fileTree
                        .sort((a, b) => {
                          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map(node => renderFileNode(node))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* File Viewer */}
            <div className="min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  {selectedFileContent ? 'FILE CONTENT' : 'PREVIEW'}
                </div>
                {selectedFileContent && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 border border-muted/50 rounded-lg bg-muted/20 min-h-0">
                {selectedFileContent ? (
                  <div className="h-full flex flex-col">
                    <div className="p-3 border-b border-muted/50 bg-muted/30">
                      <div className="text-xs font-mono text-muted-foreground">
                        {selectedFileContent.path}
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="bg-background/80">
                        {formatCodeWithLineNumbers(selectedFileContent.content)}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a file to view its content</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
