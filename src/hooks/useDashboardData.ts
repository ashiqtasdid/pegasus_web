import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { Ticket } from '@/types/ticket';

// Mock data interfaces
interface GameServer {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'maintenance';
  playerCount?: number;
  maxPlayers?: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  lastUpdate: Date;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  pluginsCreated: number;
  avatar?: string;
}

// Custom hook for dashboard data
export const useDashboardData = () => {
  const [servers, setServers] = useState<GameServer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Fetch real ticket data
  const fetchTickets = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/tickets?pageSize=100');
      if (response.ok) {
        const data = await response.json();
        const formattedTickets = data.tickets.map((ticket: Ticket) => ({
          id: ticket._id,
          subject: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          createdAt: new Date(ticket.createdAt),
          lastUpdate: new Date(ticket.updatedAt)
        }));
        setTickets(formattedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  }, [session?.user?.id]);

  // Mock data - in a real app, these would be API calls
  const fetchMockData = useCallback(() => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock servers data
      const mockServers: GameServer[] = [
        {
          id: '1',
          name: 'PegasusCraft Main',
          ipAddress: '192.168.1.100:25565',
          status: 'online',
          playerCount: 45,
          maxPlayers: 100,
        },
        {
          id: '2',
          name: 'Creative Build Server',
          ipAddress: '192.168.1.101:25565',
          status: 'online',
          playerCount: 12,
          maxPlayers: 50,
        },
        {
          id: '3',
          name: 'Test Environment',
          ipAddress: '192.168.1.102:25565',
          status: 'maintenance',
          playerCount: 0,
          maxPlayers: 20,
        },
      ];

      // Mock leaderboard data
      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, username: 'PluginMaster', score: 2850, pluginsCreated: 15 },
        { rank: 2, username: 'CodeCrafter', score: 2340, pluginsCreated: 12 },
        { rank: 3, username: 'MinecraftDev', score: 1980, pluginsCreated: 9 },
        { rank: 4, username: 'ServerAdmin', score: 1750, pluginsCreated: 8 },
        { rank: 5, username: 'BuilderPro', score: 1520, pluginsCreated: 7 },
      ];

      setServers(mockServers);
      setLeaderboard(mockLeaderboard);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchMockData();
    fetchTickets();
  }, [fetchMockData, fetchTickets]);

  const refreshData = useCallback(() => {
    fetchMockData();
    fetchTickets();
  }, [fetchMockData, fetchTickets]);

  return {
    servers,
    tickets,
    leaderboard,
    loading,
    refreshData,
  };
};

// Utility functions for formatting data (return strings/objects for styling)
export const getServerStatusStyle = (status: GameServer['status']) => {
  const statusMap = {
    online: { color: '#10b981', text: 'Online' },
    offline: { color: '#ef4444', text: 'Offline' },
    maintenance: { color: '#f59e0b', text: 'Maintenance' },
  };
  return statusMap[status];
};

export const getTicketStatusStyle = (status: SupportTicket['status']) => {
  const statusMap = {
    open: { color: '#ef4444', text: 'Open', bg: '#7f1d1d' },
    'in-progress': { color: '#f59e0b', text: 'In Progress', bg: '#78350f' },
    closed: { color: '#10b981', text: 'Closed', bg: '#064e3b' },
  };
  return statusMap[status];
};

export const getTicketPriorityStyle = (priority: SupportTicket['priority']) => {
  const priorityMap = {
    low: { color: '#10b981', text: 'Low' },
    medium: { color: '#f59e0b', text: 'Medium' },
    high: { color: '#ef4444', text: 'High' },
  };
  return priorityMap[priority];
};

export const formatPlayerCount = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  const color = percentage > 80 ? '#ef4444' : percentage > 50 ? '#f59e0b' : '#10b981';
  return { text: `${current}/${max}`, color };
};
