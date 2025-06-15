"use client";

import { createAuthClient } from "better-auth/react";

// Force the exact IP - no environment variables or fallbacks
const HARDCODED_BASE_URL = "http://37.114.41.124:3001";

// Log to console to verify what's being used
if (typeof window !== 'undefined') {
  console.log('=== AUTH CLIENT CONFIG ===');
  console.log('Hardcoded Base URL:', HARDCODED_BASE_URL);
  console.log('Window location:', window.location.href);
  console.log('========================');
}

export const authClient = createAuthClient({
  baseURL: HARDCODED_BASE_URL,
  fetchOptions: {
    onRequest: (context: any) => {
      console.log('Auth request to:', context.url);
      return context;
    },
    onRequestError: (context: any) => {
      console.error('Auth request error:', context.error);
      return context;
    }
  }
});

// Export useful methods for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
