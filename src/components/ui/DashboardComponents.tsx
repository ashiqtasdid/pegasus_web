import React from 'react';
import { Skeleton } from '@/components/ui/LoadingComponents';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string;
  onClick?: () => void;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  loading = false,
  error,
  onClick,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={className} style={{
        flex: 1,
        background: '#232326',
        borderRadius: 12,
        padding: 24,
        color: '#fff',
        minWidth: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1.5px solid #232326',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Skeleton width="60%" height="14px" />
          <Skeleton width="18px" height="18px" />
        </div>
        <Skeleton width="80px" height="32px" style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height="12px" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{
        flex: 1,
        background: '#232326',
        borderRadius: 12,
        padding: 24,
        color: '#fff',
        minWidth: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1.5px solid #dc2626',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 15,
            color: '#dc2626',
            fontWeight: 600,
          }}>
            {title}
          </div>
          <span style={{ color: '#dc2626' }}>⚠️</span>
        </div>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 2,
          color: '#dc2626',
        }}>
          Error
        </div>
        <div style={{
          fontSize: 13,
          color: '#ef4444',
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        flex: 1,
        background: '#232326',
        borderRadius: 12,
        padding: 24,
        color: '#fff',
        minWidth: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        border: '1.5px solid #232326',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        outline: 'none',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      onFocus={(e) => {
        if (onClick) {
          e.currentTarget.style.outline = '2px solid #1d4ed8';
          e.currentTarget.style.outlineOffset = '2px';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
        }
      }}
    >
      <div style={{
        fontSize: 15,
        color: '#b3b3b3',
        fontWeight: 600,
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {title}
        {icon && (
          <span style={{
            color: '#b3b3b3',
            cursor: onClick ? 'pointer' : 'default',
          }}>
            {icon}
          </span>
        )}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        marginBottom: 2,
      }}>
        {value}
      </div>
      {subtitle && (
        <div style={{
          fontSize: 13,
          color: '#888',
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionButton,
  className = '',
}) => {
  return (
    <div className={className} style={{
      textAlign: 'center',
      padding: '40px 20px',
      color: '#fff',
    }}>
      {icon && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 8,
      }}>
        {title}
      </div>
      {description && (
        <div style={{
          color: '#888',
          marginBottom: actionButton ? 24 : 0,
          lineHeight: 1.5,
        }}>
          {description}
        </div>
      )}
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          style={{
            background: '#1d4ed8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid #1d4ed8';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1e40af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1d4ed8';
          }}
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export { DashboardCard, EmptyState };
