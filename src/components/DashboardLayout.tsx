'use client';

import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { DashboardView } from './EnhancedDashboardContent';
import { UserMenu } from './UserMenu';
import { Rocket, MessageSquare } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

export function DashboardLayout({ children, currentView, onViewChange }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar currentView={currentView} onViewChange={onViewChange} />
      <SidebarInset>
        <div className="flex h-screen flex-col">          {/* Enhanced Dashboard Header */}
          <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b bg-gradient-to-r from-background/95 via-background/90 to-muted/30 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tracking-tight">
                  Pegasus
                </span>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                  Dashboard
                </span>
              </div>
              {/* Breadcrumb or current view indicator */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                <span className="capitalize font-medium">{currentView || 'Overview'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
              </div>
              
              {/* Quick actions */}
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Rocket className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              
              <UserMenu variant="header" />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="max-w-8xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
