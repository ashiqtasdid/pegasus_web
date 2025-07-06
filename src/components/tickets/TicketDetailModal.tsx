"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useUserPermissions } from '@/hooks/useUserManagement';
import { Ticket, TicketMessage, TicketStatus, TicketPriority } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/ui/LoadingComponents';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onTicketUpdated: (ticket: Ticket) => void;
}

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

export function TicketDetailModal({ ticket, onClose, onTicketUpdated }: TicketDetailModalProps) {
  const { data: session } = useSession();
  const { permissions } = useUserPermissions();
  const { toast } = useToast();
  
  const [currentTicket, setCurrentTicket] = useState<Ticket>(ticket);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const hasInitialized = useRef(false);

  const isAdmin = permissions?.isAdmin || false;
  const canEdit = isAdmin || currentTicket.userId === session?.user?.id;

  // Fetch messages function with proper error handling
  const fetchMessages = useCallback(async () => {
    if (!ticket._id || messagesLoading) return;
    
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/tickets/${ticket._id}/messages`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [ticket._id, toast]);

  // Initialize only once
  useEffect(() => {
    if (!hasInitialized.current && ticket._id) {
      hasInitialized.current = true;
      fetchMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket._id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      const response = await fetch(`/api/tickets/${ticket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!canEdit || loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      const updatedTicket = await response.json();
      setCurrentTicket(updatedTicket);
      onTicketUpdated(updatedTicket);
      
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!isAdmin || loading) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      const updatedTicket = await response.json();
      setCurrentTicket(updatedTicket);
      onTicketUpdated(updatedTicket);
      
      toast({
        title: "Success",
        description: "Ticket priority updated successfully",
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">
              Ticket #{currentTicket.ticketNumber}
            </h2>
            <Badge className={statusColors[currentTicket.status]}>
              {currentTicket.status}
            </Badge>
            <Badge className={priorityColors[currentTicket.priority]}>
              {currentTicket.priority}
            </Badge>
            {currentTicket.isEscalated && (
              <Badge variant="destructive">Escalated</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </Button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Left Panel - Ticket Details */}
          <div className="w-1/3 border-r border-border p-6 overflow-y-auto">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{currentTicket.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {currentTicket.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <br />
                    <span className="text-foreground">
                      {new Date(currentTicket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated:</span>
                    <br />
                    <span className="text-foreground">
                      {new Date(currentTicket.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <br />
                    <span className="text-foreground capitalize">{currentTicket.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created By:</span>
                    <br />
                    <span className="text-foreground">{currentTicket.userName}</span>
                  </div>
                </div>

                {currentTicket.assignedToName && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <br />
                    <span className="text-foreground">{currentTicket.assignedToName}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Controls */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Status
                    </label>
                    <select
                      value={currentTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      disabled={loading}
                      className="w-full p-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="pending-user">Pending User</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Priority
                    </label>
                    <select
                      value={currentTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                      disabled={loading}
                      className="w-full p-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2 border-t border-border">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Quick Actions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('in-progress')}
                        disabled={loading || currentTicket.status === 'in-progress'}
                      >
                        Take Ticket
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('resolved')}
                        disabled={loading || currentTicket.status === 'resolved'}
                      >
                        Mark Resolved
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePriorityChange('urgent')}
                        disabled={loading || currentTicket.priority === 'urgent'}
                      >
                        Mark Urgent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Messages */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Messages</h3>
            </div>
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingState />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start the conversation by sending a message below
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.authorId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.authorId === session?.user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.authorName}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={sending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="self-end"
                >
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
