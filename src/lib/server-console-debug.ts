// Server Console Debug Utilities
// This file provides debugging utilities for the server console toggle issue

export interface ServerConsoleDebugState {
  isOpen: boolean;
  lastToggleTime: string;
  lastToggleSource: string;
  clickCount: number;
  keyboardShortcutCount: number;
}

export class ServerConsoleDebugger {
  private static instance: ServerConsoleDebugger;
  private debugState: ServerConsoleDebugState;
  private listeners: ((state: ServerConsoleDebugState) => void)[] = [];

  private constructor() {
    this.debugState = {
      isOpen: false,
      lastToggleTime: '',
      lastToggleSource: '',
      clickCount: 0,
      keyboardShortcutCount: 0
    };
  }

  static getInstance(): ServerConsoleDebugger {
    if (!ServerConsoleDebugger.instance) {
      ServerConsoleDebugger.instance = new ServerConsoleDebugger();
    }
    return ServerConsoleDebugger.instance;
  }

  recordToggle(source: string, newState: boolean) {
    const timestamp = new Date().toISOString();
    
    this.debugState = {
      ...this.debugState,
      isOpen: newState,
      lastToggleTime: timestamp,
      lastToggleSource: source,
      clickCount: source.includes('click') ? this.debugState.clickCount + 1 : this.debugState.clickCount,
      keyboardShortcutCount: source === 'keyboard' ? this.debugState.keyboardShortcutCount + 1 : this.debugState.keyboardShortcutCount
    };

    console.log(`[ServerConsoleDebugger] ${timestamp}: ${source} -> ${newState}`, this.debugState);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.debugState));
  }

  getState(): ServerConsoleDebugState {
    return { ...this.debugState };
  }

  subscribe(listener: (state: ServerConsoleDebugState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  reset() {
    this.debugState = {
      isOpen: false,
      lastToggleTime: '',
      lastToggleSource: '',
      clickCount: 0,
      keyboardShortcutCount: 0
    };
    this.listeners.forEach(listener => listener(this.debugState));
  }

  // Utility method to check if the button is working
  testButton() {
    console.log('Testing server console button...');
    
    // Find the button element
    const buttons = document.querySelectorAll('button[title*="Server Console"]');
    if (buttons.length === 0) {
      console.error('Server console button not found!');
      return false;
    }

    const button = buttons[0] as HTMLButtonElement;
    console.log('Found server console button:', button);

    // Test click
    button.click();
    
    setTimeout(() => {
      console.log('Button test completed. Check debug state for results.');
      console.log('Current state:', this.getState());
    }, 100);

    return true;
  }
}

// Global utility for browser console
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).serverConsoleDebugger = ServerConsoleDebugger.getInstance();
}
