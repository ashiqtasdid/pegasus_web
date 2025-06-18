'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Rocket, 
  Code2, 
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';

interface WelcomeCardProps {
  userName?: string;
  onCreatePlugin: () => void;
  onQuickStart?: () => void;
}

export function WelcomeCard({ userName, onCreatePlugin, onQuickStart }: WelcomeCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-small opacity-5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-2xl"></div>
      
      <CardContent className="relative p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left side - Welcome content */}
          <div className="space-y-6 flex-1">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Welcome back{userName ? `, ${userName}` : ''}! 👋
                  </h1>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Build amazing Minecraft plugins with AI assistance. Generate, edit, and manage your projects all in one place.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                <Code2 className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20 px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Fast Generation
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20 px-3 py-1">
                <Star className="h-3 w-3 mr-1" />
                Professional
              </Badge>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">All Systems Online</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code2 className="h-4 w-4 text-primary" />
                <span>Latest AI Models</span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex flex-col gap-4 lg:w-80">
            <Button 
              onClick={onCreatePlugin} 
              size="lg" 
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
            >
              <Rocket className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
              Create New Plugin
              <ArrowRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </Button>
              <Button 
              variant="outline" 
              size="lg" 
              onClick={onQuickStart}
              className="w-full h-12 font-medium border-2 hover:bg-muted/50 transition-all duration-300 group"
            >
              <Zap className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
              Quick Start Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
