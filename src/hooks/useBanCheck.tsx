"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsBanned } from './useUserManagement';

/**
 * Hook to automatically redirect banned users to the banned page
 * Use this in your main layout or dashboard components
 */
export const useBanRedirect = () => {
  const { isBanned, loading } = useIsBanned();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isBanned) {
      // Redirect to banned page
      router.replace('/banned');
    }
  }, [isBanned, loading, router]);

  return { isBanned, loading };
};

/**
 * Component wrapper that automatically handles ban redirects
 */
export const withBanCheck = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function BanCheckedComponent(props: P) {
    const { isBanned, loading } = useBanRedirect();

    // Show loading while checking ban status
    if (loading) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          background: '#18181b', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12 
          }}>
            <div style={{ 
              width: 20, 
              height: 20, 
              border: '2px solid #333', 
              borderTop: '2px solid #fff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            Checking access...
          </div>
        </div>
      );
    }

    // If banned, don't render the component (user will be redirected)
    if (isBanned) {
      return null;
    }

    // Render the component normally
    return <Component {...props} />;
  };
};
