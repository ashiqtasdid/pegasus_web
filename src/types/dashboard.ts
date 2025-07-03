// Dashboard-specific types and interfaces
export interface NavItem {
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  href?: string;
  action?: () => void;
}

export interface PluginStats {
  totalPlugins: number;
  recentPlugins: number;
  favoriteMinecraftVersions: string[];
  recentPluginsList: {
    id: string;
    pluginName: string;
    description: string;
    minecraftVersion: string;
    createdAt: Date;
    filesCount: number;
  }[];
  lastUpdated?: Date;
}

export interface ServerStats {
  totalServers: number;
  activeServers: number;
  lastUpdated?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export interface DashboardConfig {
  apiBaseUrl: string;
  docsUrl: string;
  discordUrl: string;
  supportUrl: string;
  maxRetries: number;
  retryDelay: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  timestamp: Date;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface DashboardState {
  currentView: string;
  searchTerm: string;
  sidebarCollapsed: boolean;
  notifications: ToastMessage[];
  pluginStats: PluginStats & LoadingState;
  serverStats: ServerStats & LoadingState;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  role?: string;
  tabIndex?: number;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export type ViewType = 'dashboard' | 'projects' | 'settings' | 'admin';

export interface DashboardContextType {
  state: DashboardState;
  user: UserProfile | null;
  config: DashboardConfig;
  actions: {
    setCurrentView: (view: ViewType) => void;
    setSearchTerm: (term: string) => void;
    addNotification: (message: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    refreshStats: () => Promise<void>;
    handleError: (error: Error, context?: string) => void;
  };
}
