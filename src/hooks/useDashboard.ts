import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastMessage } from '@/types/dashboard';
import { TOAST_DURATION } from '@/config/dashboard';

// Custom hook for managing toast notifications
export const useToast = () => {
  const toastRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const animationRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addToast = useCallback((
    message: string,
    type: ToastMessage['type'] = 'info',
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const toastDuration = duration || TOAST_DURATION[type];

    // Clean up existing toast if any
    const existingToast = toastRefs.current.get(id);
    if (existingToast) {
      removeToast(id);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = id;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    
    // Apply styles
    const colors = {
      success: { bg: '#059669', border: '#10b981' },
      error: { bg: '#dc2626', border: '#ef4444' },
      info: { bg: '#1d4ed8', border: '#3b82f6' },
      warning: { bg: '#d97706', border: '#f59e0b' },
    };

    const color = colors[type];
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color.bg};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid ${color.border};
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      cursor: pointer;
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    `;
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.onmouseover = () => closeButton.style.opacity = '1';
    closeButton.onmouseout = () => closeButton.style.opacity = '0.8';
    closeButton.onclick = (e) => {
      e.stopPropagation();
      removeToast(id);
    };

    // Add content
    const content = document.createElement('span');
    content.textContent = message;
    content.style.cssText = 'display: inline-block; margin-right: 8px;';

    toast.appendChild(content);
    toast.appendChild(closeButton);

    // Add click to dismiss
    toast.onclick = () => removeToast(id);

    // Add to DOM
    document.body.appendChild(toast);
    toastRefs.current.set(id, toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });

    // Auto remove
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, toastDuration);

    animationRefs.current.set(id, timeoutId);

    return id;
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const removeToast = useCallback((id: string) => {
    const toast = toastRefs.current.get(id);
    const timeoutId = animationRefs.current.get(id);

    if (timeoutId) {
      clearTimeout(timeoutId);
      animationRefs.current.delete(id);
    }

    if (toast && toast.parentNode) {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        toastRefs.current.delete(id);
      }, 300);
    }
  }, []);

  const clearAllToasts = useCallback(() => {
    toastRefs.current.forEach((_, id) => {
      removeToast(id);
    });
  }, [removeToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllToasts();
    };
  }, [clearAllToasts]);

  return {
    addToast,
    removeToast,
    clearAllToasts,
  };
};

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key
      if (event.key === 'Escape') {
        // Close modals, clear search, etc.
        const activeModal = document.querySelector('[role="dialog"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"]') as HTMLElement;
          closeButton?.click();
        }
      }

      // Handle tab navigation
      if (event.key === 'Tab') {
        // Let browser handle tab navigation naturally
        return;
      }

      // Handle arrow keys for navigation
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
        
        if (currentIndex !== -1) {
          event.preventDefault();
          const nextIndex = event.key === 'ArrowDown' 
            ? (currentIndex + 1) % focusableElements.length
            : (currentIndex - 1 + focusableElements.length) % focusableElements.length;
          
          (focusableElements[nextIndex] as HTMLElement)?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
};

// Custom hook for responsive design
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else if (width < 1280) setScreenSize('desktop');
      else setScreenSize('wide');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const { addToast } = useToast();

  const handleError = useCallback((error: Error, context?: string) => {
    console.error('Dashboard Error:', error, context);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
    
    addToast(fullMessage, 'error');
    
    // Report error to monitoring service if configured
    if (process.env.NODE_ENV === 'production') {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('event', 'exception', {
          description: fullMessage,
          fatal: false,
        });
      }
    }
  }, [addToast]);

  return { handleError };
};

// Custom hook for API calls with retry logic
export const useApiCall = <T>(
  apiFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const { handleError } = useErrorHandler();

  const execute = useCallback(async (retries = 3) => {
    setState((prev: typeof state) => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return execute(retries - 1);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      setState({ data: null, loading: false, error: errorMessage });
      handleError(error instanceof Error ? error : new Error(errorMessage), 'API Call');
      throw error;
    }
  }, [apiFunction, handleError]);

  useEffect(() => {
    execute();
  }, [execute, ...dependencies]);  // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, refetch: execute };
};
