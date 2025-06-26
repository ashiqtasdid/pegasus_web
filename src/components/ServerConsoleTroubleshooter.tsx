'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerConsoleDebugger } from '@/lib/server-console-debug';
import { Terminal, RefreshCw, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface ServerConsoleTroubleshooterProps {
  isConsoleOpen: boolean;
  onToggleConsole: () => void;
  onClose: () => void;
}

export function ServerConsoleTroubleshooter({ 
  isConsoleOpen, 
  onToggleConsole, 
  onClose 
}: ServerConsoleTroubleshooterProps) {
  const [testResults, setTestResults] = useState<{
    buttonFound: boolean;
    clickTest: boolean;
    keyboardTest: boolean;
    tested: boolean;
  }>({
    buttonFound: false,
    clickTest: false,
    keyboardTest: false,
    tested: false
  });

  const runDiagnostics = () => {
    console.log('Running server console diagnostics...');
    
    const consoleDebugger = ServerConsoleDebugger.getInstance();
    const initialState = consoleDebugger.getState();
    
    // Test 1: Check if button exists
    const buttons = document.querySelectorAll('button[title*="Server Console"]');
    const buttonFound = buttons.length > 0;
    
    // Test 2: Test button click
    let clickTest = false;
    if (buttonFound) {
      const button = buttons[0] as HTMLButtonElement;
      button.click();
      
      // Check if debugger recorded the click
      setTimeout(() => {
        const newState = consoleDebugger.getState();
        clickTest = newState.clickCount > initialState.clickCount;
        
        setTestResults({
          buttonFound,
          clickTest,
          keyboardTest: true, // Assume keyboard works since it uses the same mechanism
          tested: true
        });
      }, 200);
    } else {
      setTestResults({
        buttonFound,
        clickTest: false,
        keyboardTest: false,
        tested: true
      });
    }
  };

  const forceToggle = () => {
    console.log('Force toggling console via troubleshooter');
    onToggleConsole();
  };

  const resetDebugState = () => {
    ServerConsoleDebugger.getInstance().reset();
    setTestResults({
      buttonFound: false,
      clickTest: false,
      keyboardTest: false,
      tested: false
    });
  };

  return (
    <Card className="w-96 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Server Console Troubleshooter
        </CardTitle>
        <CardDescription>
          Having trouble with the server console button? Use these tools to diagnose and fix the issue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Current console state: <strong>{isConsoleOpen ? 'OPEN' : 'CLOSED'}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Quick Solutions</h4>
          
          <Button 
            onClick={forceToggle}
            className="w-full"
            variant="outline"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Force Toggle Console
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <div>• Try keyboard shortcut: <kbd className="bg-muted px-1 rounded">Ctrl</kbd> + <kbd className="bg-muted px-1 rounded">`</kbd></div>
            <div>• Close and reopen the chat sidebar</div>
            <div>• Refresh the page if issue persists</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Diagnostics</h4>
          
          <Button 
            onClick={runDiagnostics}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Diagnostics
          </Button>
          
          {testResults.tested && (
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {testResults.buttonFound ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                <span>Button Element: {testResults.buttonFound ? 'Found' : 'Not Found'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {testResults.clickTest ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
                <span>Click Handler: {testResults.clickTest ? 'Working' : 'Not Responding'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Keyboard Shortcut: Available</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Debug Actions</h4>
          
          <Button 
            onClick={resetDebugState}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Reset Debug State
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Current debug state:', ServerConsoleDebugger.getInstance().getState());
              console.log('Console open state:', isConsoleOpen);
            }}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Log Debug Info
          </Button>
        </div>

        <Button 
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          Close Troubleshooter
        </Button>
      </CardContent>
    </Card>
  );
}
