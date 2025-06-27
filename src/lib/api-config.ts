/**
 * Get the external API URL for server-side API calls
 * This utility ensures consistent external API URL resolution across all API routes
 */
export function getExternalApiUrl(): string {
  // Check for explicit external API URL first
  if (process.env.EXTERNAL_API_URL) {
    return process.env.EXTERNAL_API_URL;
  }

  // For server-side calls, prioritize BACKEND_URL over NEXT_PUBLIC_API_BASE_URL
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (backendUrl) {
    return backendUrl;
  }
  
  return 'http://localhost:3001';
}

/**
 * Get the base URL for client-side API calls (points to Next.js proxy routes)
 */
export function getClientApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api`;
}
