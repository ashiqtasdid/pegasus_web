'use client';

import { Editor } from '@monaco-editor/react';
import { useState, useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';

interface FileEditorProps {
  fileName: string;
  content: string;
  language: string;
  readOnly?: boolean;
  onChange?: (content: string) => void;
  onSave?: () => void;
}

export function FileEditor({ 
  content, 
  language, 
  readOnly = false, 
  onChange,
  onSave 
}: Omit<FileEditorProps, 'fileName'>) {
  const [editorContent, setEditorContent] = useState(content);
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Update editor content when external content changes
  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Add zoom functionality with Ctrl + scroll wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        setFontSize(prev => Math.max(8, Math.min(32, prev + delta)));
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (onSave && !readOnly) {
          onSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSave, readOnly]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      onChange?.(value);
    }
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    
    // Set dark theme
    monaco.editor.setTheme('vs-dark');
    
    // Configure editor settings
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: false,
      renderWhitespace: 'selection',
      minimap: { enabled: true },
      lineNumbers: 'on',
      folding: true,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  // Update font size when it changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={language}
        value={editorContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: false,
          renderWhitespace: 'selection',
          minimap: { enabled: true },
          lineNumbers: 'on',
          folding: true,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
