'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { UserProfile } from '@/components/auth/UserProfile';
import { UserSettings } from '@/components/UserSettings';
import { useBanRedirect } from '@/hooks/useBanCheck';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Check if user is banned (will redirect automatically if banned)
  const { isBanned, loading: banCheckLoading } = useBanRedirect();
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';
  
  // Get view parameter from URL
  const view = searchParams.get('view');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Skip authentication check in development mode
    if (isDevelopmentMode) {
      return;
    }
    
    if (mounted && !isPending && (!session || error)) {
      router.push('/auth');
    }
  }, [session, isPending, error, router, mounted, isDevelopmentMode]);
  
  if (!mounted || (!isDevelopmentMode && isPending) || banCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {banCheckLoading ? 'Checking access...' : 
             isDevelopmentMode ? 'Loading dashboard...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // If banned, don't render anything (user will be redirected)
  if (isBanned) {
    return null;
  }

  if (!isDevelopmentMode && (!session || error)) {
    return null; // Will redirect to auth
  }
  
  // Handle different views
  switch (view) {
    case 'profile':
      return (
        <UserProfile 
          onClose={() => router.push('/dashboard')}
        />
      );
    case 'settings':
      return (
        <UserSettings 
          onClose={() => router.push('/dashboard')}
        />
      );
    default:
      return <DashboardSidebar />;
  }
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
