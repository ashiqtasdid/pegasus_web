"use client";

import { createAuthClient } from "better-auth/react";

// Hardcoded server IP for production deployment
const baseURL = "http://37.114.41.124:3001";

console.log('Auth Client Base URL (hardcoded):', baseURL);

export const authClient = createAuthClient({
  baseURL,
});

// Export useful methods for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
