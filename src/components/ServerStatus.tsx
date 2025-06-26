'use client';

import { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff, Clock } from 'lucide-react';

interface ServerStatusProps {
  userId: string;
}

export function ServerStatus({ userId }: ServerStatusProps) {
  const [serverStatus, setServerStatus] = useState<{
    hasServer: boolean;
    status?: string;
    name?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServerStatus = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/pterodactyl/server-info/${userId}`);
        const data = await response.json();
        
        if (data.success && data.hasServer) {
          setServerStatus({
            hasServer: true,
            status: data.server?.status,
            name: data.server?.name
          });
        } else {
          setServerStatus({ hasServer: false });
        }
      } catch (error) {
        console.error('Failed to load server status:', error);
        setServerStatus({ hasServer: false });
      } finally {
        setLoading(false);
      }
    };

    loadServerStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadServerStatus, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-3 w-3 animate-pulse" />;
    
    switch (serverStatus?.status) {
      case 'running': return <Wifi className="h-3 w-3 text-green-500" />;
      case 'offline': return <WifiOff className="h-3 w-3 text-red-500" />;
      case 'starting': 
      case 'stopping': return <Clock className="h-3 w-3 text-yellow-500 animate-pulse" />;
      default: return <Server className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (loading) return 'Server: Checking...';
    if (!serverStatus?.hasServer) return 'Server: None';
    return `Server: ${serverStatus.status || 'Unknown'}`;
  };

  const getStatusColor = () => {
    if (loading) return 'text-gray-500';
    if (!serverStatus?.hasServer) return 'text-gray-500';
    
    switch (serverStatus.status) {
      case 'running': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'starting':
      case 'stopping': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={`flex items-center gap-1 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}
