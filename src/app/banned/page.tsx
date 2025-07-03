"use client";
import React, { useEffect, useState } from 'react';

interface BanInfo {
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
}

const BannedPage = () => {
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanInfo = async () => {
      try {
        const response = await fetch('/api/user/ban');
        const data = await response.json();
        
        if (response.ok) {
          setBanInfo(data);
        }
      } catch (error) {
        console.error('Error fetching ban info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear session and redirect to auth
      await fetch('/api/auth/sign-out', { method: 'POST' });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback: redirect to auth page
      window.location.href = '/auth';
    }
  };

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
          Loading...
        </div>
      </div>
    );
  }

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
        {/* Warning Icon */}
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
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <h1 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem' 
        }}>
          Account Suspended
        </h1>

        <p style={{ 
          color: '#b3b3b3', 
          fontSize: '1.1rem', 
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Your account has been suspended and you cannot access Pegasus Labs at this time.
        </p>

        {banInfo && (
          <div style={{ 
            background: '#1a1a1a', 
            border: '1px solid #333',
            borderRadius: 8, 
            padding: '1.5rem', 
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ 
              color: '#fff', 
              fontSize: '1.1rem', 
              fontWeight: 600, 
              marginBottom: '1rem' 
            }}>
              Suspension Details
            </h3>
            
            {banInfo.banReason && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#dc2626', fontSize: '0.9rem' }}>Reason:</strong>
                <p style={{ color: '#b3b3b3', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {banInfo.banReason}
                </p>
              </div>
            )}
            
            {banInfo.bannedAt && (
              <div>
                <strong style={{ color: '#dc2626', fontSize: '0.9rem' }}>Date:</strong>
                <p style={{ color: '#b3b3b3', marginTop: '0.5rem' }}>
                  {new Date(banInfo.bannedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333',
          borderRadius: 8, 
          padding: '1.5rem', 
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            marginBottom: '1rem' 
          }}>
            What can you do?
          </h3>
          
          <ul style={{ 
            color: '#b3b3b3', 
            lineHeight: 1.6,
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              If you believe this is an error, contact our support team
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Review our Terms of Service and Community Guidelines
            </li>
            <li>
              Wait for the suspension to be reviewed by our team
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSignOut}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              flex: 1,
              minWidth: 120,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.background = '#b91c1c'}
            onMouseOut={(e) => (e.target as HTMLElement).style.background = '#dc2626'}
          >
            Sign Out
          </button>
          
          <button
            onClick={() => window.open('mailto:support@pegasus-labs.com', '_blank')}
            style={{
              background: '#232326',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: 8,
              padding: '0.875rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              flex: 1,
              minWidth: 120,
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.background = '#2a2a2a'}
            onMouseOut={(e) => (e.target as HTMLElement).style.background = '#232326'}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;
