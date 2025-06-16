'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PluginCreationPage } from '@/components/PluginCreationPage';
import { Loader2 } from 'lucide-react';

export default function CreatePluginPage() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';

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
  
  if (!mounted || (!isDevelopmentMode && isPending)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plugin creator...</p>
        </div>
      </div>
    );
  }

  if (!isDevelopmentMode && (!session || error)) {
    return null; // Will redirect to auth
  }
  
  return <PluginCreationPage />;
}
