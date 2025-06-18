'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Bot, 
  Rocket, 
  MessageSquare, 
  Settings, 
  Home,
  Sparkles,
  FolderOpen,
  Briefcase
} from 'lucide-react';
import { DashboardView } from './EnhancedDashboardContent';
import { UserMenu } from './UserMenu';

const menuItems = [
  {
    title: 'Overview',
    icon: Home,
    action: 'overview' as DashboardView,
  },
  {
    title: 'Generate Plugin',
    icon: Rocket,
    action: 'generate' as DashboardView,
  },
  {
    title: 'AI Assistant',
    icon: Bot,
    action: 'chat' as DashboardView,
  },
  {
    title: 'File Manager',
    icon: FolderOpen,
    action: 'files' as DashboardView,
  },
  {
    title: 'Projects',
    icon: Briefcase,
    action: 'projects' as DashboardView,
  },
  {
    title: 'Chat History',
    icon: MessageSquare,
    action: 'history' as DashboardView,
  },
];

interface AppSidebarProps {
  currentView?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
}

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const handleNavClick = (action: DashboardView) => {
    if (onViewChange) {
      onViewChange(action);
    }
  };
  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-sidebar/95 to-sidebar/80 backdrop-blur-sm">
      <SidebarHeader className="border-b border-sidebar-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="relative p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg">
            <Sparkles className="h-7 w-7 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar animate-pulse"></div>
          </div>
          <div>
            <h1 className="font-bold text-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Pegasus
            </h1>
            <p className="text-sm text-muted-foreground font-medium">AI Plugin Generator</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`h-12 rounded-xl transition-all duration-300 hover:bg-sidebar-accent/80 hover:shadow-md group ${
                      currentView === item.action 
                        ? 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-md border border-sidebar-accent/30' 
                        : 'hover:scale-[1.02]'
                    }`}
                  >
                    <button 
                      onClick={() => handleNavClick(item.action)} 
                      className="flex items-center gap-4 font-medium w-full text-left px-4"
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        currentView === item.action 
                          ? 'bg-sidebar-accent-foreground/10' 
                          : 'group-hover:bg-sidebar-accent/20'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {currentView === item.action && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`h-12 rounded-xl transition-all duration-300 hover:bg-sidebar-accent/80 hover:shadow-md group ${
                    currentView === 'settings' 
                      ? 'bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground shadow-md border border-sidebar-accent/30' 
                      : 'hover:scale-[1.02]'
                  }`}
                >
                  <button 
                    onClick={() => handleNavClick('settings')} 
                    className="flex items-center gap-4 font-medium w-full text-left px-4"
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      currentView === 'settings' 
                        ? 'bg-sidebar-accent-foreground/10' 
                        : 'group-hover:bg-sidebar-accent/20'
                    }`}>
                      <Settings className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Settings</span>
                    {currentView === 'settings' && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border/50 p-4">
        <div className="space-y-4">
          <UserMenu variant="sidebar" />
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
              <Bot className="h-4 w-4 text-primary" />
              <span>Powered by AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              OpenRouter • NestJS • React
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
