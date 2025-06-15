'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/components/auth/UserProfile';
import { DashboardLayout } from '@/components/DashboardLayout';
import { EnhancedDashboardContent, DashboardView } from '@/components/EnhancedDashboardContent';
import { usePluginGenerator } from '@/hooks/usePluginGenerator';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const pluginGeneratorProps = usePluginGenerator();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending && (!session || error)) {
      router.push('/auth');
    }
  }, [session, isPending, error, router, mounted]);

  const handleViewChange = (view: DashboardView) => {
    setCurrentView(view);
  };

  if (!mounted || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!mounted ? 'Loading dashboard...' : 'Verifying authentication...'}
          </p>
        </div>
      </div>
    );
  }

  if (!session || error) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardLayout 
        currentView={currentView} 
        onViewChange={handleViewChange}
      >
        <div className="space-y-6">          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user.name || 'Developer'}!
            </h1>
            <p className="text-muted-foreground">
              Ready to build amazing Minecraft plugins? Let's get started with your personalized dashboard.
            </p>
          </div>

          {/* User Profile Section */}
          <div className="mb-6">
            <UserProfile />
          </div>

          {/* Main Dashboard Content */}
          <EnhancedDashboardContent 
            {...pluginGeneratorProps} 
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </DashboardLayout>
    </div>
  );
}
