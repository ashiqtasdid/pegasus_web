"use client";
import React, { useState, useEffect } from "react";

interface AnalyticsData {
  userGrowth: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  ticketAnalytics: {
    total: number;
    resolved: number;
    pending: number;
    avgResolutionTime: number;
    satisfactionScore: number;
  };
  systemMetrics: {
    uptime: string;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
  pluginUsage: {
    total: number;
    active: number;
    popular: Array<{
      name: string;
      downloads: number;
      rating: number;
    }>;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // For now, we'll use mock data since the analytics API isn't implemented
        setTimeout(() => {
          setAnalytics({
            userGrowth: {
              total: 1247,
              thisMonth: 89,
              lastMonth: 67,
              growth: 32.8
            },
            ticketAnalytics: {
              total: 342,
              resolved: 298,
              pending: 44,
              avgResolutionTime: 2.4,
              satisfactionScore: 4.2
            },
            systemMetrics: {
              uptime: "99.9%",
              memoryUsage: 68,
              cpuUsage: 23,
              diskUsage: 45,
              activeConnections: 156
            },
            pluginUsage: {
              total: 89,
              active: 67,
              popular: [
                { name: "Economy System", downloads: 234, rating: 4.8 },
                { name: "Chat Filter", downloads: 189, rating: 4.6 },
                { name: "World Guard", downloads: 156, rating: 4.7 }
              ]
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        color: '#fff'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid #333', 
            borderTop: '2px solid #fff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        color: '#dc2626'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Analytics
          </h1>
          <p style={{ color: '#b3b3b3' }}>
            System performance and usage statistics
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#232326',
            color: '#fff'
          }}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* User Growth */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          User Growth
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.userGrowth.total}
            </p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>This Month</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              +{analytics.userGrowth.thisMonth}
            </p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Growth Rate</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              +{analytics.userGrowth.growth}%
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Support Tickets
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>Total Tickets</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.ticketAnalytics.total}
            </p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>Resolved</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.ticketAnalytics.resolved}
            </p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Pending</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.ticketAnalytics.pending}
            </p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6' }}>Avg Resolution</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.ticketAnalytics.avgResolutionTime}h
            </p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          System Metrics
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>System Uptime</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.systemMetrics.uptime}
            </p>
            <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>
              Excellent reliability
            </p>
          </div>
          
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1d4ed8' }}>Memory Usage</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.systemMetrics.memoryUsage}%
            </p>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#333', 
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: `${analytics.systemMetrics.memoryUsage}%`, 
                height: '100%', 
                background: '#1d4ed8',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f59e0b' }}>CPU Usage</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.systemMetrics.cpuUsage}%
            </p>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#333', 
              borderRadius: '4px'
            }}>
              <div style={{ 
                width: `${analytics.systemMetrics.cpuUsage}%`, 
                height: '100%', 
                background: '#f59e0b',
                borderRadius: '4px'
              }}></div>
            </div>
          </div>

          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#8b5cf6' }}>Active Connections</h3>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              {analytics.systemMetrics.activeConnections}
            </p>
            <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>
              Real-time connections
            </p>
          </div>
        </div>
      </div>

      {/* Plugin Usage */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Plugin Usage
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 2fr', 
          gap: '1rem'
        }}>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1d4ed8' }}>Plugin Stats</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#b3b3b3' }}>Total Plugins</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {analytics.pluginUsage.total}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#b3b3b3' }}>Active Plugins</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {analytics.pluginUsage.active}
              </p>
            </div>
          </div>

          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f59e0b' }}>Popular Plugins</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.pluginUsage.popular.map((plugin, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: '#1f1f23',
                  borderRadius: '4px'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{plugin.name}</p>
                    <p style={{ margin: 0, color: '#b3b3b3', fontSize: '0.875rem' }}>
                      {plugin.downloads} downloads
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    color: '#f59e0b'
                  }}>
                    <span>⭐</span>
                    <span>{plugin.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
