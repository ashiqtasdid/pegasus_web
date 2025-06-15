"use client";

import { createAuthClient } from "better-auth/react";

// Function to determine the correct base URL
function getAuthBaseURL(): string {
  // Check for environment variable first
  const envURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (envURL) {
    return envURL;
  }
  
  // Fallback to window location if available (client-side)
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    // If we're on port 3001, use that, otherwise default to 3001
    const authPort = port === '3001' ? port : '3001';
    return `${protocol}//${hostname}:${authPort}`;
  }
  
  // Final fallback
  return "http://localhost:3001";
}

const baseURL = getAuthBaseURL();

console.log('Auth Client Base URL:', baseURL);

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
