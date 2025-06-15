'use client';

import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { DashboardView } from './EnhancedDashboardContent';

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
        <div className="flex h-screen flex-col">
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
