"use client";

import { createAuthClient } from "better-auth/react";

// Frontend runs on port 3000 (with auth endpoints), external API runs on port 3001
const HARDCODED_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "http://37.114.41.124:3000" 
  : "http://localhost:3000";

// Log to console to verify what's being used
if (typeof window !== 'undefined') {
  console.log('=== AUTH CLIENT CONFIG ===');
  console.log('Auth API Base URL:', HARDCODED_BASE_URL);
  console.log('Frontend location:', window.location.href);
  console.log('========================');
}

export const authClient = createAuthClient({
  baseURL: HARDCODED_BASE_URL,
});

// Export useful methods for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
