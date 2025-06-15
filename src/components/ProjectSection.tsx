'use client';

import { useState } from 'react';
import { Folder, Download, Book, RefreshCw, Eye, ChevronDown, FileCode } from 'lucide-react';

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

interface ProjectSectionProps {
  projectFiles: ProjectData;
  currentProject?: {
    userId: string;
    pluginName: string;
  } | null;
  onDownloadJar: (userId: string, pluginName: string) => void;
  onDownloadInstructions: () => void;
  onRefreshProject: (userId: string, pluginName: string) => void;
}

export function ProjectSection({
  projectFiles,
  currentProject,
  onDownloadJar,
  onDownloadInstructions,
  onRefreshProject
}: ProjectSectionProps) {
  const [collapsedFiles, setCollapsedFiles] = useState<Set<number>>(new Set());

  if (!projectFiles?.projectExists || !projectFiles.pluginProject) {
    return (
      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Folder className="w-4 h-4 text-blue-500 mr-2" />
              Project Explorer
            </h3>
          </div>
          <div className="bg-gray-50">
            <div className="text-center py-8 text-gray-500">
              <Folder className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Project files not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { pluginProject } = projectFiles;

  const toggleFileCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedFiles);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
    }
    setCollapsedFiles(newCollapsed);
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
      <div key={index} className="flex">
        <span className="text-gray-400 text-xs w-8 text-right mr-2 select-none">
          {index + 1}
        </span>
        <span className="text-xs font-mono">{line || ' '}</span>
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <Folder className="w-4 h-4 text-blue-500 mr-2" />
              Project Explorer
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => currentProject && onRefreshProject(currentProject.userId, currentProject.pluginName)}
                className="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Refresh files"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Project Info */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-600">Name:</span>
              <span className="ml-1 text-gray-800">{pluginProject.projectName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Version:</span>
              <span className="ml-1 text-gray-800">{pluginProject.minecraftVersion}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Dependencies:</span>
              <span className="ml-1 text-gray-800">
                {pluginProject.dependencies?.join(', ') || 'None'}
              </span>
            </div>
          </div>
          <div className="flex justify-center space-x-2 mt-3">
            <button
              onClick={() => currentProject && onDownloadJar(currentProject.userId, currentProject.pluginName)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-3 h-3 mr-1" />
              JAR
            </button>
            <button
              onClick={onDownloadInstructions}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Book className="w-3 h-3 mr-1" />
              Guide
            </button>
          </div>
        </div>

        {/* File Tree */}
        <div className="bg-gray-50">
          <div className="max-h-80 overflow-y-auto">
            {pluginProject.files.map((file, index) => {
              const fileName = file.path.split('/').pop() || file.path;
              const isCollapsed = collapsedFiles.has(index);

              return (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleFileCollapse(index)}
                  >
                    <ChevronDown
                      className={`w-3 h-3 text-gray-400 mr-2 transition-transform ${
                        isCollapsed ? '-rotate-90' : ''
                      }`}
                    />
                    <span className="text-sm mr-2">{getFileIcon(file.path)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{fileName}</div>
                      <div className="text-xs text-gray-500">{file.path}</div>
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="px-6 pb-3">
                      <div className="bg-gray-800 rounded text-white text-xs overflow-x-auto">
                        <div className="px-3 py-1 border-b border-gray-700 text-gray-300">
                          <span>{file.path}</span>
                        </div>
                        <div className="p-3 max-h-64 overflow-y-auto">
                          {formatCodeWithLineNumbers(file.content)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
