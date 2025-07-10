'use client';

import { useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';

export default function AuthDebugPage() {
  const { data: session, isPending, error } = useSession();
  const [cookies, setCookies] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [userAgent, setUserAgent] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookies(document.cookie);
      setOrigin(window.location.origin);
      setUserAgent(navigator.userAgent);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Information</h1>
        
        <div className="grid gap-6">
          {/* Session Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Session Information</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><strong>isPending:</strong> {isPending ? 'true' : 'false'}</div>
              <div><strong>error:</strong> {error ? JSON.stringify(error, null, 2) : 'null'}</div>
              <div><strong>session:</strong> <pre className="mt-2 bg-muted p-2 rounded overflow-auto">{JSON.stringify(session, null, 2)}</pre></div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</div>
              <div><strong>NEXT_PUBLIC_APP_URL:</strong> {process.env.NEXT_PUBLIC_APP_URL || 'undefined'}</div>
              <div><strong>NEXT_PUBLIC_BETTER_AUTH_URL:</strong> {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'undefined'}</div>
            </div>
          </div>

          {/* Browser Information */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
            <div className="space-y-2 font-mono text-sm">
              <div><strong>Origin:</strong> {origin}</div>
              <div><strong>User Agent:</strong> {userAgent}</div>
              <div><strong>Cookies:</strong> <pre className="mt-2 bg-muted p-2 rounded overflow-auto">{cookies || 'No cookies'}</pre></div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/api/auth/session'}
                className="bg-primary text-primary-foreground px-4 py-2 rounded mr-4 mb-2"
              >
                Test Auth API (/api/auth/session)
              </button>
              
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/force-cookie-sync', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      const result = await response.json();
                      console.log('Cookie sync result:', result);
                      alert(response.ok ? 'Cookie sync successful! Check console for details. Refresh page to see cookies.' : `Cookie sync failed: ${result.error}`);
                      if (response.ok) {
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    } catch (error) {
                      console.error('Cookie sync error:', error);
                      alert('Cookie sync failed: ' + error);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-4 mb-2"
                >
                  🔄 Force Cookie Sync (Manual)
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/auth/better-auth-sync', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      const result = await response.json();
                      console.log('Better Auth sync result:', result);
                      alert(response.ok ? 'Better Auth sync successful! Check console for details. Refresh page to see cookies.' : `Better Auth sync failed: ${result.error}`);
                      if (response.ok) {
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    } catch (error) {
                      console.error('Better Auth sync error:', error);
                      alert('Better Auth sync failed: ' + error);
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded mr-4 mb-2"
                >
                  🔄 Better Auth Cookie Sync
                </button>

                <button
                  onClick={async () => {
                    try {
                      // Clear all possible auth cookies
                      const cookieNames = [
                        'better-auth.session_token',
                        'better-auth.session', 
                        'authjs.session-token',
                        'session_token'
                      ];
                      
                      cookieNames.forEach(name => {
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.moonlitservers.com`;
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=moonlitservers.com`;
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                      });
                      
                      alert('All auth cookies cleared! Refresh page to see updated cookie state.');
                      setTimeout(() => window.location.reload(), 1000);
                    } catch (error) {
                      alert('Failed to clear cookies: ' + error);
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded mr-4 mb-2"
                >
                  🗑️ Clear All Cookies
                </button>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded mr-4"
                >
                  Go to Auth Page
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-accent text-accent-foreground px-4 py-2 rounded"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
