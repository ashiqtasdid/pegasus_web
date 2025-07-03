import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error Boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#fff',
            background: '#232326',
            borderRadius: '12px',
            margin: '2rem',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '1rem',
            }}>
              ⚠️
            </div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}>
              Something went wrong
            </h2>
            <p style={{
              color: '#b3b3b3',
              marginBottom: '1.5rem',
            }}>
              An error occurred while rendering this section. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
              onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '1rem',
                textAlign: 'left',
                background: '#18181b',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #232326',
              }}>
                <summary style={{ cursor: 'pointer', color: '#f87171' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  fontSize: '12px',
                  color: '#fca5a5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
