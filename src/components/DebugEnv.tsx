"use client";

import { useEffect } from 'react';

export function DebugEnv() {
  useEffect(() => {
    console.log('=== Environment Debug ===');
    console.log('NEXT_PUBLIC_BETTER_AUTH_URL:', process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
    console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Current window.location:', window.location.href);
    console.log('========================');
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded z-50">
      <div>Auth URL: {process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'undefined'}</div>
      <div>API URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined'}</div>
    </div>
  );
}
