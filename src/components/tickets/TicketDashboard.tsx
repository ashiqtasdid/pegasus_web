"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useUserPermissions } from '@/hooks/useUserManagement';
import { Ticket, TicketStats, TicketFilter, TicketStatus, TicketPriority } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/ui/LoadingComponents';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';
import { TicketStatsCards } from './TicketStatsCards';

interface TicketDashboardProps {
  onClose?: () => void;
}

// Simple select component for now
const SimpleSelect = ({ value, onValueChange, options, placeholder }: {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const statusColors: Record<TicketStatus, string> = {
  'open': 'bg-blue-500/20 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
  'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
  'pending-user': 'bg-orange-500/20 text-orange-400 border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  'resolved': 'bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  'closed': 'bg-gray-500/20 text-gray-400 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30',
};

const priorityColors: Record<TicketPriority, string> = {
  'low': 'bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  'normal': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
  'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30',
  'urgent': 'bg-red-500/20 text-red-400 border-red-500/30 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  'critical': 'bg-purple-500/20 text-purple-400 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
};

export function TicketDashboard({ onClose }: TicketDashboardProps) {
  const { data: session, isPending } = useSession();
  const { permissions } = useUserPermissions();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filter, setFilter] = useState<TicketFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const isAdmin = permissions?.isAdmin || false;

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilter(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchTickets = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      
      // For non-admin users, automatically filter by their user ID
      const effectiveFilter = isAdmin ? filter : { ...filter, userId: session.user.id };
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '10',
        ...(effectiveFilter.status?.length && { status: effectiveFilter.status.join(',') }),
        ...(effectiveFilter.priority?.length && { priority: effectiveFilter.priority.join(',') }),
        ...(effectiveFilter.category?.length && { category: effectiveFilter.category.join(',') }),
        ...(effectiveFilter.search && { search: effectiveFilter.search }),
        ...(effectiveFilter.assignedTo?.length && { assignedTo: effectiveFilter.assignedTo.join(',') }),
        ...(effectiveFilter.userId && { userId: effectiveFilter.userId }),
      });

      const response = await fetch(`/api/tickets?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again.",
        variant: "destructive",
      });
      // Set empty state to prevent infinite loading
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin || statsLoading) return;
    
    try {
      setStatsLoading(true);
      const response = await fetch('/api/tickets/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      setIsInitialized(true);
      fetchTickets();
      if (isAdmin) {
        fetchStats();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, isInitialized, isAdmin]);

  // Handle filter changes (but not on initial load)
  useEffect(() => {
    if (isInitialized && session?.user?.id) {
      fetchTickets();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filter.status, filter.priority, filter.category, filter.search, filter.assignedTo, filter.userId]);

  const handleFilterChange = (key: keyof TicketFilter, value: string | string[]) => {
    setFilter(prev => ({ 
      ...prev, 
      [key]: value === '' ? undefined : value 
    }));
    setCurrentPage(1);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
  };

  const handleTicketCreated = (ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    setShowCreateModal(false);
    if (isAdmin) {
      fetchStats(); // Refresh stats for admin
    }
    toast({
      title: "Success",
      description: "Ticket created successfully",
    });
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(ticket => 
      ticket._id === updatedTicket._id ? updatedTicket : ticket
    ));
    setSelectedTicket(updatedTicket);
    fetchStats(); // Refresh stats
  };

  if (isPending || !session) {
    return <LoadingState />;
  }

  if (!session?.user?.id) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please log in to view tickets</p>
      </div>
    );
  }

  if (loading && !isInitialized) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage support tickets' : 'View your support tickets'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-2">
              <path d="M12 6v12m6-6H6"/>
            </svg>
            New Ticket
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {isAdmin && stats && (
        <div className="mb-6">
          <TicketStatsCards stats={stats} />
        </div>
      )}

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          {isAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <SimpleSelect
                    value={filter.status?.[0] || ''}
                    onValueChange={(value) => handleFilterChange('status', value === '' ? [] : [value])}
                    placeholder="All statuses"
                    options={[
                      { value: 'open', label: 'Open' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'pending-user', label: 'Pending User' },
                      { value: 'resolved', label: 'Resolved' },
                      { value: 'closed', label: 'Closed' },
                    ]}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <SimpleSelect
                    value={filter.priority?.[0] || ''}
                    onValueChange={(value) => handleFilterChange('priority', value === '' ? [] : [value])}
                    placeholder="All priorities"
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'critical', label: 'Critical' },
                    ]}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <SimpleSelect
                    value={filter.category?.[0] || ''}
                    onValueChange={(value) => handleFilterChange('category', value === '' ? [] : [value])}
                    placeholder="All categories"
                    options={[
                      { value: 'bug', label: 'Bug' },
                      { value: 'feature-request', label: 'Feature Request' },
                      { value: 'support', label: 'Support' },
                      { value: 'billing', label: 'Billing' },
                      { value: 'account', label: 'Account' },
                      { value: 'technical', label: 'Technical' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>
                
                {/* Admin-only filters */}
                {isAdmin && (
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-2 block">Admin View</label>
                    <div className="flex gap-2">
                      <Button
                        variant={filter.userId ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFilterChange('userId', '')}
                      >
                        All Tickets
                      </Button>
                      <Button
                        variant={filter.userId ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('userId', session?.user?.id)}
                      >
                        My Tickets
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <LoadingState />
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tickets found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isAdmin ? 'No tickets match your current filters' : 'Create your first ticket to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground">
                              #{ticket.ticketNumber}
                            </h3>
                            <Badge className={statusColors[ticket.status]}>
                              {ticket.status}
                            </Badge>
                            <Badge className={priorityColors[ticket.priority]}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-foreground mb-1">{ticket.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By {ticket.userName}</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            {ticket.assignedToName && (
                              <span>Assigned to {ticket.assignedToName}</span>
                            )}
                            {ticket.messageCount > 0 && (
                              <span>{ticket.messageCount} messages</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {ticket.isEscalated && (
                            <Badge variant="destructive">Escalated</Badge>
                          )}
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-muted-foreground">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Status Distribution</h3>
                    {stats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Open</span>
                          <span>{stats.open}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>In Progress</span>
                          <span>{stats.inProgress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending User</span>
                          <span>{stats.pendingUser}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolved</span>
                          <span>{stats.resolved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Closed</span>
                          <span>{stats.closed}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-4">Performance Metrics</h3>
                    {stats && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Avg Resolution Time</span>
                          <span>{stats.averageResolutionTime.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg First Response</span>
                          <span>{stats.firstResponseTime.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction Rating</span>
                          <span>{stats.satisfactionAverage.toFixed(1)}/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SLA Breaches</span>
                          <span>{stats.slaBreaches}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
      
      {showDetailModal && selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setShowDetailModal(false)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </div>
  );
}
