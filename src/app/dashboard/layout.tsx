'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Don't redirect if we're still loading or already redirecting
    if (isPending || redirecting) return;
    
    // If there's no session or there's an error, redirect to auth
    if (!session || error) {
      setRedirecting(true);
      router.push('/auth');
    }
  }, [session, isPending, error, router, redirecting]);

  // Show loading while checking authentication or redirecting
  if (isPending || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {redirecting ? 'Redirecting to sign in...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If no session after loading is complete, don't render children
  if (!session) {
    return null;
  }

  return <>{children}</>;
}
