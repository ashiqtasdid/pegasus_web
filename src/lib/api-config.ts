/**
 * Get the external API URL for server-side API calls
 * This utility ensures consistent external API URL resolution across all API routes
 */
export function getExternalApiUrl(): string {
  // Check for explicit external API URL first
  if (process.env.EXTERNAL_API_URL) {
    return process.env.EXTERNAL_API_URL;
  }

  // Fallback based on environment
  if (process.env.NODE_ENV === 'production') {
    return 'http://37.114.41.124:3001';
  }
  
  return 'http://localhost:3001';
}

/**
 * Get the base URL for client-side API calls (points to Next.js proxy routes)
 */
export function getClientApiUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'http://37.114.41.124:3000/api';
  }
  
  return 'http://localhost:3000/api';
}
