'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileCode, MessageSquare, Clock } from 'lucide-react';

interface DashboardStatsCardsProps {
  currentProject: {
    userId: string;
    pluginName: string;
  } | null;
  projectFiles: {
    projectExists: boolean;
    pluginProject?: {
      projectName: string;
      minecraftVersion: string;
      dependencies?: string[];
      files: Array<{ path: string; content: string }>;
    };
  } | null;
  chatMessages: Array<{
    type: string;
    content: string;
    timestamp: Date;
  }>;
}

export function DashboardStatsCards({ 
  currentProject, 
  projectFiles, 
  chatMessages 
}: DashboardStatsCardsProps) {
  const stats = [
    {
      title: 'Active Project',
      value: currentProject?.pluginName || 'None',
      icon: FileCode,
      description: currentProject ? 'Currently selected' : 'No project selected',
    },
    {
      title: 'Project Files',
      value: projectFiles?.pluginProject?.files?.length || 0,
      icon: Activity,
      description: 'Generated files',
    },
    {
      title: 'Chat Messages',
      value: chatMessages.length,
      icon: MessageSquare,
      description: 'AI conversations',
    },
    {
      title: 'Session Time',
      value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: Clock,
      description: 'Current session',
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
