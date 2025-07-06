// hooks/useDownloadToken.ts
'use client';

import { useState, useCallback } from 'react';
import { DownloadToken } from '../types/download';

export const useDownloadToken = () => {
  const [tokens, setTokens] = useState<Map<string, DownloadToken>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = useCallback(async (
    userId: string,
    pluginName: string,
    options?: {
      maxDownloads?: number;
      expirationHours?: number;
      ipRestrictions?: string[];
    }
  ): Promise<DownloadToken | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plugin/download/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          pluginName,
          options
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate token');
      }

      const token: DownloadToken = {
        token: data.token,
        expiresAt: data.expiresAt,
        maxDownloads: data.maxDownloads
      };

      const key = `${userId}-${pluginName}`;
      setTokens(prev => new Map(prev).set(key, token));

      return token;
    } catch (err: unknown) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getToken = useCallback((userId: string, pluginName: string): DownloadToken | undefined => {
    const key = `${userId}-${pluginName}`;
    return tokens.get(key);
  }, [tokens]);

  const isTokenValid = useCallback((token: DownloadToken): boolean => {
    return new Date(token.expiresAt) > new Date();
  }, []);

  return {
    generateToken,
    getToken,
    isTokenValid,
    loading,
    error,
    tokens: Array.from(tokens.entries()).map(([key, token]) => ({
      key,
      ...token
    }))
  };
};
