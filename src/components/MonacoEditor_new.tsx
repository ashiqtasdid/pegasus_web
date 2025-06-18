'use client';

import { Editor } from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Download, Copy, FileText } from 'lucide-react';

interface MonacoEditorProps {
  file?: {
    name: string;
    content: string;
    language: string;
  };
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

export function MonacoEditor({ file, onSave, readOnly = false }: MonacoEditorProps) {
  const [content, setContent] = useState(file?.content || '// Welcome to Pegasus Code Editor\n// Select a file from the explorer to start coding\n');
  const [isDirty, setIsDirty] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setIsDirty(false);
    }
  }, [file]);

  // Add zoom functionality with Ctrl + scroll wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setFontSize(prev => Math.max(8, Math.min(32, prev + delta)));
      }
    };

    // Add event listener to the document
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsDirty(value !== file?.content);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setIsDirty(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name || 'untitled.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  // Configure Monaco editor with dark theme only
  const handleEditorDidMount = (editor: unknown, monaco: unknown) => {
    // Force apply dark theme immediately to ensure it's never light mode
    const monacoEditor = monaco as {
      editor: {
        setTheme: (themeName: string) => void;
      };
    };
    
    // Ensure dark mode is always applied
    monacoEditor.editor.setTheme('vs-dark');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">
            {file?.name || 'Untitled'}
            {isDirty && <span className="text-orange-500 ml-1">●</span>}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {fontSize}px
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {!readOnly && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              disabled={!isDirty}
              className="h-7 px-2"
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopy}
            className="h-7 px-2"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            className="h-7 px-2"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={file?.language || 'javascript'}
          value={content}
          onChange={handleEditorChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: fontSize,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            // Enhanced editor appearance
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            fontLigatures: true,
            renderLineHighlight: 'line',
            renderWhitespace: 'boundary',
            showFoldingControls: 'always',
            foldingHighlight: true,
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </div>
    </div>
  );
}
