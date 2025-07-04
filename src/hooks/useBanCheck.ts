import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function useBanRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (isPending) return;
      
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/ban', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsBanned(data.isBanned);
          if (data.isBanned) {
            router.push('/banned');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking ban status:', error);
      }
      
      setLoading(false);
    };

    checkBanStatus();
  }, [session, isPending, router]);

  return { loading, isBanned };
}