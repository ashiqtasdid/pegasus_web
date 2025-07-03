'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  BarChart3,
  Clock,
  Activity
} from 'lucide-react';

interface TokenUsageData {
  userId: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
  lastRequestAt: string | null;
  dailyUsage?: Array<{
    date: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestCount: number;
  }>;
  monthlyUsage?: Array<{
    month: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    requestCount: number;
  }>;
  recentSessions?: Array<{
    operation: string;
    tokens: number;
    timestamp: string;
  }>;
}

interface TokenUsageStatsProps {
  userId: string;
}

export function TokenUsageStats({ userId }: TokenUsageStatsProps) {
  const [usage, setUsage] = useState<TokenUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get today's usage
  const getTodayUsage = (usage: TokenUsageData): number => {
    if (!usage.dailyUsage || usage.dailyUsage.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    const todayData = usage.dailyUsage.find(day => day.date === today);
    return todayData?.totalTokens || 0;
  };

  // Helper function to get this month's usage
  const getThisMonthUsage = (usage: TokenUsageData): number => {
    if (!usage.monthlyUsage || usage.monthlyUsage.length === 0) return 0;
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthData = usage.monthlyUsage.find(month => month.month === thisMonth);
    return monthData?.totalTokens || 0;
  };

  // Helper function to calculate average tokens per request
  const getAverageTokensPerRequest = (usage: TokenUsageData): number => {
    return usage.requestCount > 0 ? Math.round(usage.totalTokens / usage.requestCount) : 0;
  };

  useEffect(() => {
    const loadTokenUsageData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/user/tokens?userId=${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (response.ok) {
          // Map the simple token data to the expected format
          const sanitizedData: TokenUsageData = {
            userId: data.userId || userId,
            totalTokens: data.tokensUsed || 0,
            promptTokens: 0, // Not available in simple format
            completionTokens: 0, // Not available in simple format
            requestCount: 0, // Not available in simple format
            lastRequestAt: null, // Not available in simple format
            dailyUsage: [], // Not available in simple format
            monthlyUsage: [], // Not available in simple format
            recentSessions: [] // Not available in simple format
          };
          
          console.log('📊 Token usage data loaded:', sanitizedData);
          setUsage(sanitizedData);
        } else {
          console.error('API Error:', data);
          setError(data.error || 'Failed to load token usage');
        }
      } catch (err) {
        console.error('Error loading token usage:', err);
        setError('Failed to load token usage data');
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for real-time token usage updates
    const handleTokenUsageUpdate = (event: CustomEvent) => {
      const { userId: eventUserId, tokenUsage } = event.detail;
      if (eventUserId === userId && tokenUsage) {
        console.log('🔄 Real-time token usage update received:', tokenUsage);
        // Reload token usage data to get the updated totals
        loadTokenUsageData();
      }
    };

    // Initial load
    loadTokenUsageData();

    // Add event listener for real-time updates
    window.addEventListener('token-usage-updated', handleTokenUsageUpdate as EventListener);

    // Cleanup event listener
    return () => {
      window.removeEventListener('token-usage-updated', handleTokenUsageUpdate as EventListener);
    };
  }, [userId]);

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const hasUsage = (usage.totalTokens || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Main Token Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(usage.totalTokens)}</div>
            <p className="text-xs text-muted-foreground">
              All time usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Usage</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(getTodayUsage(usage))}</div>
            <p className="text-xs text-muted-foreground">
              Tokens used today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.requestCount}</div>
            <p className="text-xs text-muted-foreground">
              Total requests made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Request</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageTokensPerRequest(usage)}</div>
            <p className="text-xs text-muted-foreground">
              Tokens per request
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Information */}
      {hasUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Token Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-2">Token Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prompt Tokens:</span>
                  <Badge variant="outline">{formatNumber(usage.promptTokens)}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completion Tokens:</span>
                  <Badge variant="outline">{formatNumber(usage.completionTokens)}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Usage Timeline */}
            <div>
              <h4 className="text-sm font-medium mb-2">Usage Timeline</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">First Used:</span>
                  <span>{usage.lastRequestAt ? formatDate(usage.lastRequestAt) : 'Never'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Used:</span>
                  <span>{formatDate(usage.lastRequestAt)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Monthly Usage */}
            <div>
              <h4 className="text-sm font-medium mb-2">This Month</h4>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tokens Used:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formatNumber(getThisMonthUsage(usage))}</Badge>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {usage.recentSessions && usage.recentSessions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {usage.recentSessions.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{session.operation}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {formatNumber(session.tokens)} tokens
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Usage State */}
      {!hasUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Token Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No AI Usage Yet</h3>
            <p className="text-muted-foreground">
              Start using AI features like plugin generation or chat to see your token usage here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
