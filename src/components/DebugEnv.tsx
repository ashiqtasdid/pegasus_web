"use client";

import { useEffect, useState } from 'react';

export function DebugEnv() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('=== Environment Debug ===');
    console.log('NEXT_PUBLIC_BETTER_AUTH_URL:', process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Current window.location:', window.location.href);
    console.log('Build timestamp:', new Date().toISOString());
    console.log('========================');
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50 max-w-xs">
        <div>Auth URL: {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'undefined'}</div>
        <div>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}</div>
        <div>Location: Loading...</div>
        <div>Hardcoded: Frontend:3000, API:3001</div>
        <div className="text-green-400">Build: Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50 max-w-xs">
      <div>Auth URL: {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'undefined'}</div>
      <div>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}</div>
      <div>Location: {window.location.host}</div>
      <div>Hardcoded: Frontend:3000, API:3001</div>
      <div className="text-green-400">Build: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}
