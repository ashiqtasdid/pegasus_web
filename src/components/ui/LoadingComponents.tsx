import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#fff',
  className = '' 
}) => {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `2px solid transparent`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  fullScreen = false 
}) => {
  const containerStyle = fullScreen 
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#18181b',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px',
      };

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        color: '#fff',
      }}>
        <LoadingSpinner size="large" />
        <div style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#b3b3b3',
        }}>
          {message}
        </div>
      </div>
    </div>
  );
};

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #232326 25%, #2a2a2d 50%, #232326 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
        borderRadius: '4px',
        ...style,
      }}
      role="status"
      aria-label="Loading content"
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export { LoadingSpinner, LoadingState, Skeleton };
