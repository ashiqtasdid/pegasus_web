"use client";

import React, { useState } from 'react';
import { TicketPriority, TicketCategory, Ticket } from '@/types/ticket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketModalProps {
  onClose: () => void;
  onTicketCreated: (ticket: Ticket) => void;
}

// Simple select component
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

export function CreateTicketModal({ onClose, onTicketCreated }: CreateTicketModalProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as TicketPriority,
    category: 'support' as TicketCategory,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const ticket = await response.json();
      onTicketCreated(ticket);
      onClose();
      
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create New Ticket</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Detailed description of the issue..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={6}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <SimpleSelect
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TicketPriority }))}
                  placeholder="Select priority"
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
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TicketCategory }))}
                  placeholder="Select category"
                  options={[
                    { value: 'bug', label: 'Bug Report' },
                    { value: 'feature-request', label: 'Feature Request' },
                    { value: 'support', label: 'General Support' },
                    { value: 'billing', label: 'Billing' },
                    { value: 'account', label: 'Account' },
                    { value: 'technical', label: 'Technical' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
