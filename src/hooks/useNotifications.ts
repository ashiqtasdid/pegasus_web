import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { TicketNotification } from '@/types/ticket';

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/tickets/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: TicketNotification) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/tickets/notifications/${notificationId}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [notifications, markAsRead]);

  const addNotification = useCallback((notification: TicketNotification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  };
}
