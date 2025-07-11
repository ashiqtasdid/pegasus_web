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
 * Get multiple possible external API URLs for failover
 */
export function getExternalApiUrls(): string[] {
  const urls = [];
  
  // Primary URL from BACKEND_URL
  if (process.env.BACKEND_URL) {
    urls.push(process.env.BACKEND_URL);
  }
  
  // Fallback URLs for Docker containers
  const containerOptions = [
    'http://combined-pegasus:3001',
    'http://pegasus-backend:3001', 
    'http://pegasus:3001',
    'http://host.docker.internal:3001'
  ];
  
  urls.push(...containerOptions);
  
  // Public URL as last resort
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    urls.push(process.env.NEXT_PUBLIC_API_BASE_URL);
  }
  
  urls.push('http://localhost:3001');
  
  // Remove duplicates
  return [...new Set(urls)];
}

/**
 * Get the base URL for client-side API calls (points to Next.js proxy routes)
 */
export function getClientApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/api`;
}
