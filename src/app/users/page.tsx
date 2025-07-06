"use client";
import React from 'react';
import ComprehensiveAdminDashboard from '@/components/ComprehensiveAdminDashboard';
import { useAdminOnly } from '@/hooks/useUserManagement';
import { useBanRedirect } from '@/hooks/useBanCheck';

const UserManagementPage = () => {
  const { canAccess, loading } = useAdminOnly();
  const { isBanned, loading: banCheckLoading } = useBanRedirect();

  if (loading || banCheckLoading) {
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
          {banCheckLoading ? 'Checking access...' : 'Loading...'}
        </div>
      </div>
    );
  }

  // If banned, don't render anything (user will be redirected)
  if (isBanned) {
    return null;
  }

  if (!canAccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#18181b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          background: '#232326', 
          borderRadius: 16, 
          padding: '3rem', 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center',
          border: '1px solid #333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            background: '#dc2626', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <svg width="40" height="40" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"/>
            </svg>
          </div>

          <h1 style={{ 
            color: '#fff', 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            Access Denied
          </h1>

          <p style={{ 
            color: '#b3b3b3', 
            fontSize: '1.1rem', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            You don&apos;t have permission to access this page. Administrator privileges are required.
          </p>

          <button
            onClick={() => window.history.back()}
            style={{
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.background = '#1e40af'}
            onMouseOut={(e) => (e.target as HTMLElement).style.background = '#1d4ed8'}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18181b' }}>
      <ComprehensiveAdminDashboard />
    </div>
  );
};

export default UserManagementPage;
