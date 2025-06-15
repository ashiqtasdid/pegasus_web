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
    <Sidebar className="border-r-0 bg-sidebar/95 backdrop-blur-sm">
      <SidebarHeader className="border-b border-sidebar-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Pegasus
            </h1>
            <p className="text-sm text-muted-foreground">AI Plugin Generator</p>
          </div>
        </div>
      </SidebarHeader>
        <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`h-11 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/80 ${
                      currentView === item.action ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                    }`}
                  >
                    <button 
                      onClick={() => handleNavClick(item.action)} 
                      className="flex items-center gap-3 font-medium w-full text-left"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`h-11 rounded-xl transition-all duration-200 hover:bg-sidebar-accent/80 ${
                    currentView === 'settings' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                  }`}
                >
                  <button 
                    onClick={() => handleNavClick('settings')} 
                    className="flex items-center gap-3 font-medium w-full text-left"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/50 p-6">
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">Powered by OpenRouter AI</p>
          <p className="text-xs">Built with NestJS & React</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
