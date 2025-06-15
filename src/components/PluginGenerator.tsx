'use client';

import { DashboardLayout } from './DashboardLayout';
import { EnhancedDashboardContent, DashboardView } from './EnhancedDashboardContent';
import { usePluginGenerator } from '../hooks/usePluginGenerator';
import { useEffect, useState } from 'react';

export function PluginGenerator() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const pluginGeneratorProps = usePluginGenerator();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Pegasus...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      currentView={currentView} 
      onViewChange={handleViewChange}
    >
      <EnhancedDashboardContent 
        {...pluginGeneratorProps} 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
    </DashboardLayout>
  );
}
