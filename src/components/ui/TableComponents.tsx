import React from 'react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  pluginsCreated: number;
  avatar?: string;
}

interface DataTableProps {
  title: string;
  columns: string[];
  data?: (string | number | React.ReactNode)[][];
  emptyMessage: string;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  data = [],
  emptyMessage,
  actions,
  loading = false,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        background: '#232326',
        borderRadius: 12,
        padding: 0,
        color: '#fff',
        minWidth: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1.5px solid #232326',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px 12px 24px',
          fontSize: 18,
          fontWeight: 700,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottom: '1px solid #232326',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{title}</span>
        {actions && (
          <div style={{ display: 'flex', gap: 8 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div style={{ padding: '0 24px', overflowX: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>
            <div style={{
              width: 24,
              height: 24,
              border: '2px solid #333',
              borderTop: '2px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            Loading...
          </div>
        ) : data.length > 0 ? (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            color: '#fff',
            fontSize: 15,
            marginTop: 8,
          }}>
            <thead>
              <tr style={{
                color: '#b3b3b3',
                fontWeight: 700,
                textAlign: 'left',
              }}>
                {columns.map((column, index) => (
                  <th key={index} style={{ padding: '10px 0' }}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} style={{
                  borderTop: index > 0 ? '1px solid #2a2a2d' : 'none',
                }}>
                  {Object.values(row).map((cell: React.ReactNode, cellIndex) => (
                    <td key={cellIndex} style={{
                      padding: '12px 0',
                      color: '#fff',
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '18px 0', textAlign: 'center' }}>
            <span style={{ color: '#b3b3b3' }}>{emptyMessage}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 24px 16px 24px',
        color: '#b3b3b3',
        fontSize: 13,
        display: 'flex',
        justifyContent: 'flex-end',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderTop: data.length > 0 ? '1px solid #2a2a2d' : 'none',
      }}>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  size = 'medium',
}) => {
  const baseStyles = {
    border: '1px solid #444',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: size === 'small' ? 13 : 15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const variantStyles = {
    primary: {
      background: '#1d4ed8',
      color: '#fff',
      border: '1px solid #1d4ed8',
    },
    secondary: {
      background: '#232326',
      color: '#fff',
      border: '1px solid #444',
    },
  };

  const sizeStyles = {
    small: {
      padding: '4px 12px',
    },
    medium: {
      padding: '6px 16px',
    },
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...sizeStyles[size],
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.outline = '2px solid #1d4ed8';
          e.currentTarget.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#1e40af';
          } else {
            e.currentTarget.style.background = '#2a2a2d';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = '#1d4ed8';
          } else {
            e.currentTarget.style.background = '#232326';
          }
        }
      }}
    >
      {children}
    </button>
  );
};

interface LeaderboardCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  comingSoon?: boolean;
  className?: string;
  data?: LeaderboardEntry[];
  loading?: boolean;
  onRefresh?: () => void;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  title,
  subtitle,
  icon,
  comingSoon = false,
  className = '',
  data = [],
  loading = false,
  onRefresh,
}) => {
  return (
    <div
      className={className}
      style={{
        background: '#232326',
        borderRadius: 12,
        padding: 0,
        color: '#fff',
        minWidth: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1.5px solid #232326',
        marginBottom: 0,
        marginTop: 0,
      }}
    >
      <div style={{
        padding: '20px 24px 6px 24px',
        fontSize: 18,
        fontWeight: 700,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}>
        {title}
        {subtitle && (
          <div style={{
            fontSize: 14,
            color: '#b3b3b3',
            fontWeight: 400,
            marginTop: 2,
          }}>
            {subtitle}
          </div>
        )}
      </div>
      
      {comingSoon ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 220,
          color: '#888',
          fontSize: 18,
        }}>
          {icon && (
            <div style={{ marginBottom: 8 }}>
              {icon}
            </div>
          )}
          <div style={{ fontWeight: 700, fontSize: 20, color: '#888' }}>
            Coming Soon!
          </div>
          <div style={{ fontSize: 15, color: '#888', marginTop: 2 }}>
            Leaderboards are being polished.
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: '#888',
            }}>
              <div style={{
                border: '3px solid #333',
                borderTop: '3px solid #1d4ed8',
                borderRadius: '50%',
                width: 40,
                height: 40,
                animation: 'spin 1s linear infinite',
                marginBottom: 16,
              }} />
              <div style={{ fontSize: 14, color: '#888' }}>
                Loading leaderboard...
              </div>
            </div>
          ) : data.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: '#888',
            }}>
              {icon && (
                <div style={{ marginBottom: 8 }}>
                  {icon}
                </div>
              )}
              <div style={{ fontWeight: 700, fontSize: 18, color: '#888' }}>
                No data available
              </div>
              <div style={{ fontSize: 14, color: '#888', marginTop: 2 }}>
                Check back later for leaderboard updates
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#2a2a2e',
                    borderRadius: 8,
                    border: '1px solid #333',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2a2a2e';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: entry.rank === 1 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                 entry.rank === 2 ? 'linear-gradient(135deg, #d1d5db, #9ca3af)' :
                                 entry.rank === 3 ? 'linear-gradient(135deg, #cd7c2f, #92400e)' :
                                 'linear-gradient(135deg, #4b5563, #374151)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                    }}>
                      {entry.rank <= 3 ? '★' : entry.rank}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>
                        {entry.username}
                      </div>
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {entry.pluginsCreated} plugins
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                      {entry.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      points
                    </div>
                  </div>
                </div>
              ))}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #333',
                    borderRadius: 6,
                    color: '#888',
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { DataTable, ActionButton, LeaderboardCard };
