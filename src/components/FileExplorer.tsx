'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  MoreHorizontal,
  Code,
  Image,
  FileJson,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  path: string;
}

// Sample file structure - you can replace this with real data
const sampleFileStructure: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        children: [
          {
            id: '3',
            name: 'Button.tsx',
            type: 'file',
            path: '/src/components/Button.tsx',
            language: 'typescript',
            content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}`
          },
          {
            id: '4',
            name: 'Modal.tsx',
            type: 'file',
            path: '/src/components/Modal.tsx',
            language: 'typescript',
            content: `import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}`
          }
        ]
      },
      {
        id: '5',
        name: 'utils',
        type: 'folder',
        path: '/src/utils',
        children: [
          {
            id: '6',
            name: 'helpers.ts',
            type: 'file',
            path: '/src/utils/helpers.ts',
            language: 'typescript',
            content: `export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}`
          }
        ]
      },
      {
        id: '7',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        language: 'typescript',
        content: `import React from 'react';
import { Button } from './components/Button';
import { Modal } from './components/Modal';

function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="app">
      <h1>My Application</h1>
      <Button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </Button>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p>This is an example modal content.</p>
      </Modal>
    </div>
  );
}

export default App;`
      }
    ]
  },
  {
    id: '8',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    language: 'json',
    content: `{
  "name": "pegasus-project",
  "version": "1.0.0",
  "description": "A Next.js project with TypeScript",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`
  },
  {
    id: '9',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    language: 'markdown',
    content: `# Pegasus Project

This is a sample project structure for the Pegasus code editor.

## Features

- File explorer
- Monaco code editor
- Chat system
- VS Code-like interface

## Getting Started

1. Install dependencies
2. Run the development server
3. Start coding!

## Project Structure

\`\`\`
src/
  components/
    Button.tsx
    Modal.tsx
  utils/
    helpers.ts
  App.tsx
package.json
README.md
\`\`\`
`
  }
];

interface FileExplorerProps {
  onFileSelect?: (file: FileNode) => void;
  selectedFileId?: string;
  files?: FileNode[];
  isLoading?: boolean;
}

export function FileExplorer({ onFileSelect, selectedFileId, files, isLoading }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [searchTerm, setSearchTerm] = useState('');
  const [fileStructure, setFileStructure] = useState<FileNode[]>(sampleFileStructure);

  // Function to convert flat file list to folder structure
  const buildFileStructure = (flatFiles: FileNode[]): FileNode[] => {
    const root: FileNode[] = [];
    const folderMap = new Map<string, FileNode>();

    flatFiles.forEach(file => {
      const pathParts = file.path.split('/');
      let currentLevel = root;
      let currentPath = '';

      // Build folder structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let folder = folderMap.get(currentPath);
        if (!folder) {
          folder = {
            id: currentPath,
            name: part,
            type: 'folder',
            path: currentPath,
            children: []
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }
        currentLevel = folder.children!;
      }

      // Add the file to the current level
      currentLevel.push({
        ...file,
        name: pathParts[pathParts.length - 1]
      });
    });

    return root;
  };

  // Handle file structure updates in useEffect to prevent infinite re-renders
  useEffect(() => {
    if (files && files.length > 0) {
      // Convert flat files to folder structure
      const newFileStructure = buildFileStructure(files);
      setFileStructure(newFileStructure);
      
      // Auto-expand root folders when files are loaded
      if (newFileStructure.length > 0) {
        const rootFolderIds = newFileStructure
          .filter(item => item.type === 'folder')
          .map(folder => folder.id);
        
        if (rootFolderIds.length > 0) {
          setExpandedFolders(new Set(rootFolderIds));
        }
      }
    } else {
      setFileStructure(sampleFileStructure);
    }
  }, [files]);

  // Debug logging
  console.log('FileExplorer received files:', files);
  console.log('FileExplorer files length:', files?.length);
  console.log('FileExplorer built structure:', fileStructure);
  console.log('FileExplorer structure length:', fileStructure.length);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return expandedFolders.has(file.id) ? FolderOpen : Folder;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'jsx':
        return Code;
      case 'json':
        return FileJson;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return Image;
      case 'md':
        return FileText;
      default:
        return File;
    }
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const Icon = getFileIcon(node);
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFileId === node.id;
    
    if (searchTerm && !node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1 px-2 hover:bg-muted/50 cursor-pointer group ${
            isSelected ? 'bg-accent text-accent-foreground' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.id);
            } else {
              onFileSelect?.(node);
            }
          }}
        >
          {node.type === 'folder' && (
            <span className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate flex-1">{node.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Handle file actions
            }}
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Explorer</h2>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-7 h-7 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-xs text-muted-foreground">Loading files...</p>
              </div>
            </div>
          ) : (
            fileStructure.map(node => renderFileNode(node))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
