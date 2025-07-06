"use client";

import React from 'react';
import { TicketStats } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TicketStatsCardsProps {
  stats: TicketStats;
}

export function TicketStatsCards({ stats }: TicketStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.open} open, {stats.resolved} resolved
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageResolutionTime.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground">
            First response: {stats.firstResponseTime.toFixed(1)}h
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction Rating</CardTitle>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.satisfactionAverage.toFixed(1)}/5</div>
          <p className="text-xs text-muted-foreground">
            Based on user feedback
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.slaBreaches}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
