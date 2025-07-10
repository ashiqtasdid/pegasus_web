"use client";

import { createAuthClient } from "better-auth/react";

// Get the base URL for auth endpoints
const getBaseURL = () => {
  // In production, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to environment variables or localhost
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
         process.env.NEXT_PUBLIC_APP_URL || 
         "http://localhost:3000";
};

const baseURL = getBaseURL();

// Enhanced logging for production debugging
if (typeof window !== 'undefined') {
  console.log('=== AUTH CLIENT CONFIG ===');
  console.log('Node Environment:', process.env.NODE_ENV);
  console.log('Auth API Base URL:', baseURL);
  console.log('Frontend location:', window.location.href);
  console.log('Environment Variables:');
  console.log('  NEXT_PUBLIC_BETTER_AUTH_URL:', process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
  console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('========================');
}

export const authClient = createAuthClient({
  baseURL,
  // Add fetch config for better error handling
  fetchOptions: {
    onError: (context) => {
      console.error('Auth client error:', context);
    },
    onRequest: (context) => {
      console.log('Auth request:', context.url);
    },
    onResponse: (context) => {
      console.log('Auth response:', context.response.status);
    },
  },
});

// Export useful methods for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
