'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { UserProfile } from '@/components/auth/UserProfile';
import { UserSettings } from '@/components/UserSettings';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Get view parameter from URL
  const view = searchParams.get('view');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
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
