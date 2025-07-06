"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TicketDashboard } from '@/components/tickets/TicketDashboard';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import UserManagement from '@/components/admin/UserManagement';
import AdminAnalyticsComponent from '@/components/admin/AdminAnalytics';
import AdminSettingsComponent from '@/components/admin/AdminSettings';

type AdminView = 'overview' | 'users' | 'tickets' | 'settings' | 'analytics';

interface UserManagementStats {
  totalUsers: number;
  totalAdmins: number;
  totalBanned: number;
  totalTokensUsed: number;
  averageTokensUsed: number;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number;
  satisfactionRating: number;
}

interface SystemStats {
  totalUsers: number;
  totalTickets: number;
  activeServers: number;
  totalPlugins: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
}

// Admin Overview Component
const AdminOverview: React.FC<{ userStats: UserManagementStats | null, ticketStats: TicketStats | null, systemStats: SystemStats | null }> = ({ userStats, ticketStats, systemStats }) => {
  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#b3b3b3' }}>
          Welcome to the admin control panel
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* User Stats */}
        <div style={{ 
          background: '#232326', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#1d4ed8', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Users</h3>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>Total registered</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {userStats?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
            {userStats?.totalAdmins || 0} admins, {userStats?.totalBanned || 0} banned
          </div>
        </div>

        {/* Ticket Stats */}
        <div style={{ 
          background: '#232326', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#dc2626', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Tickets</h3>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>Support requests</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {ticketStats?.total || 0}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
            {ticketStats?.open || 0} open, {ticketStats?.inProgress || 0} in progress
          </div>
        </div>

        {/* System Stats */}
        <div style={{ 
          background: '#232326', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#10b981', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>System</h3>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>Server status</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#10b981' }}>
            Online
          </div>
          <div style={{ fontSize: '0.875rem', color: '#b3b3b3' }}>
            Uptime: {systemStats?.systemUptime || '99.9%'}
          </div>
        </div>

        {/* Performance Stats */}
        <div style={{ 
          background: '#232326', 
          padding: '1.5rem', 
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#7c3aed', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M3 3v18h18M7 12l4-4 4 4 4-4"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Performance</h3>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>System metrics</p>
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {systemStats?.cpuUsage || 15}%
          </div>
          <div style={{ fontSize: '0.875rem', color: '#b3b3b3' }}>
            CPU usage, {systemStats?.memoryUsage || 45}% memory
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ 
        background: '#232326', 
        padding: '1.5rem', 
        borderRadius: '12px',
        border: '1px solid #333'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
          Recent Activity
        </h3>
        <div style={{ margin: '1rem 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem 0',
            borderBottom: '1px solid #333'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#10b981', 
              borderRadius: '50%',
              marginRight: '1rem'
            }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff' }}>New user registration</p>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>2 minutes ago</p>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem 0',
            borderBottom: '1px solid #333'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#f59e0b', 
              borderRadius: '50%',
              marginRight: '1rem'
            }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff' }}>Support ticket created</p>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>5 minutes ago</p>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem 0'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              background: '#1d4ed8', 
              borderRadius: '50%',
              marginRight: '1rem'
            }}></div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff' }}>Plugin generated</p>
              <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>10 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComprehensiveAdminDashboard = () => {
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [userStats, setUserStats] = useState<UserManagementStats | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data functions
  const fetchStats = useCallback(async () => {
    try {
      // Fetch user stats
      const userResponse = await fetch("/api/user/manage?statsOnly=true");
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserStats(userData.stats);
      }

      // Fetch ticket stats
      const ticketResponse = await fetch("/api/tickets/stats");
      if (ticketResponse.ok) {
        const ticketData = await ticketResponse.json();
        setTicketStats(ticketData);
      }

      // Mock system stats for now
      setSystemStats({
        totalUsers: userStats?.totalUsers || 0,
        totalTickets: ticketStats?.total || 0,
        activeServers: 3,
        totalPlugins: 125,
        systemUptime: "99.9%",
        memoryUsage: 45,
        cpuUsage: 15
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [userStats?.totalUsers, ticketStats?.total]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#18181b' }}>
      {/* Admin Sidebar */}
      <div style={{ 
        width: '280px', 
        background: '#232326', 
        borderRight: '1px solid #333',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '2rem 1.5rem', 
          borderBottom: '1px solid #333' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#fff',
              margin: 0
            }}>
              Admin Panel
            </h1>
            <NotificationBell />
          </div>
          <p style={{ 
            color: '#b3b3b3', 
            margin: 0,
            fontSize: '0.875rem'
          }}>
            System Administration
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {[
            { 
              id: 'overview', 
              label: 'Overview', 
              icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              )
            },
            { 
              id: 'users', 
              label: 'User Management', 
              icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              )
            },
            { 
              id: 'tickets', 
              label: 'Support Tickets', 
              icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
              )
            },
            { 
              id: 'analytics', 
              label: 'Analytics', 
              icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M3 3v18h18M7 12l4-4 4 4 4-4"/>
                </svg>
              )
            },
            { 
              id: 'settings', 
              label: 'Settings', 
              icon: (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              )
            }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AdminView)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '0.875rem 1.5rem',
                background: currentView === item.id ? '#1d4ed8' : 'transparent',
                color: currentView === item.id ? '#fff' : '#b3b3b3',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: currentView === item.id ? '3px solid #3b82f6' : '3px solid transparent'
              }}
              onMouseOver={(e) => {
                if (currentView !== item.id) {
                  (e.target as HTMLElement).style.background = '#2a2a2e';
                  (e.target as HTMLElement).style.color = '#fff';
                }
              }}
              onMouseOut={(e) => {
                if (currentView !== item.id) {
                  (e.target as HTMLElement).style.background = 'transparent';
                  (e.target as HTMLElement).style.color = '#b3b3b3';
                }
              }}
            >
              <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ 
          padding: '1.5rem', 
          borderTop: '1px solid #333',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>Pegasus Admin v1.0</p>
          <p style={{ margin: 0 }}>System Status: Online</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {currentView === 'overview' && (
          <AdminOverview 
            userStats={userStats} 
            ticketStats={ticketStats} 
            systemStats={systemStats} 
          />
        )}
        
        {currentView === 'users' && (
          <div style={{ padding: '2rem' }}>
            <UserManagement />
          </div>
        )}
        
        {currentView === 'tickets' && (
          <div style={{ padding: '2rem' }}>
            <TicketDashboard />
          </div>
        )}
        
        {currentView === 'analytics' && (
          <div style={{ padding: '2rem' }}>
            <AdminAnalyticsComponent />
          </div>
        )}
        
        {currentView === 'settings' && (
          <div style={{ padding: '2rem' }}>
            <AdminSettingsComponent />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: '#dc2626',
          color: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p style={{ margin: 0 }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveAdminDashboard;
