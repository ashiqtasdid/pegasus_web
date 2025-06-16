'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending) {
      if (session || isDevelopmentMode) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    }
  }, [session, isPending, router, mounted, isDevelopmentMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Rocket className="h-16 w-16 text-primary mr-4" />
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pegasus
          </h1>
        </div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">
          {!mounted || isPending ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
