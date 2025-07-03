// Dashboard configuration and constants
export const DASHBOARD_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.pegasuslabs.io',
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/pegasus',
  supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL || 'mailto:support@pegasuslabs.io',
  maxRetries: 3,
  retryDelay: 1000,
} as const;

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1920,
} as const;

export const SIDEBAR_WIDTH = {
  expanded: 270,
  collapsed: 60,
} as const;

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const TOAST_DURATION = {
  success: 3000,
  error: 5000,
  info: 3000,
  warning: 4000,
} as const;

export const Z_INDEX = {
  sidebar: 20,
  navbar: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

export const KEYBOARD_SHORTCUTS = {
  search: 'ctrl+k',
  settings: 'ctrl+,',
  dashboard: 'ctrl+d',
  projects: 'ctrl+p',
  help: 'ctrl+h',
} as const;

export const ARIA_LABELS = {
  sidebar: 'Main navigation sidebar',
  navbar: 'Top navigation bar',
  searchBox: 'Search projects and resources',
  userMenu: 'User account menu',
  notifications: 'Notifications',
  mainContent: 'Main dashboard content',
  logoLink: 'Go to dashboard home',
  navItem: (label: string) => `Navigate to ${label}`,
  resourceLink: (label: string) => `Open ${label}`,
} as const;
