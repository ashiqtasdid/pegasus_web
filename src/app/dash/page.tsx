"use client";
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { useBanRedirect } from '@/hooks/useBanCheck';

export default function DashPage() {
  // Check if user is banned (will redirect automatically if banned)
  const { isBanned, loading: banCheckLoading } = useBanRedirect();

  // Show loading while checking ban status
  if (banCheckLoading) {
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

  // If banned, don't render anything (user will be redirected)
  if (isBanned) {
    return null;
  }

  return <DashboardSidebar />;
}
