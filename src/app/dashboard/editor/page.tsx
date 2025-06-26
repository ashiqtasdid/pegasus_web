'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { VSCodeLayout } from '@/components/VSCodeLayout';
import { Loader2 } from 'lucide-react';

function EditorPageContent() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';
  
  // Get plugin info from URL
  const pluginId = searchParams.get('plugin');
  const urlUserId = searchParams.get('userId');
  
  // Use URL userId if provided, otherwise fall back to session user ID
  const userId = urlUserId || (isDevelopmentMode ? 'testuser' : session?.user?.id);
  const userEmail = isDevelopmentMode ? 'testuser@example.com' : session?.user?.email;

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
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!isDevelopmentMode && (!session || error)) {
    return null; // Will redirect to auth
  }
  
  return <VSCodeLayout pluginId={pluginId} userId={userId} userEmail={userEmail} />;
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}
