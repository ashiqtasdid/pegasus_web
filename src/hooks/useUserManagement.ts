import { useState, useEffect, useCallback } from "react";

export interface UserTokenInfo {
  tokensUsed: number;
  tokenLimit: number;
  tokensRemaining: number;
  usagePercentage: number;
  canUseTokens: boolean;
}

export interface UserPermissions {
  isAdmin: boolean;
  isBanned: boolean;
  canManageUsers: boolean;
  canManageTokens: boolean;
  canBanUsers: boolean;
}

export interface UserBanInfo {
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
}

export const useUserPermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch("/api/user/admin");
      const data = await response.json();

      if (response.ok) {
        setPermissions(data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch permissions");
      }
    } catch (err) {
      console.log("Error fetching permissions:", err);
      setError("Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, loading, error, refetch: fetchPermissions };
};

export const useUserTokens = (userId?: string) => {
  const [tokenInfo, setTokenInfo] = useState<UserTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenInfo = useCallback(async () => {
    try {
      const params = userId ? `?userId=${userId}` : "";
      const response = await fetch(`/api/user/tokens${params}`);
      const data = await response.json();

      if (response.ok) {
        setTokenInfo(data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch token info");
      }
    } catch (err) {
      console.log("Error fetching permissions:", err);

      setError("Failed to fetch token info");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  return { tokenInfo, loading, error, refetch: fetchTokenInfo };
};

export const useUserBanStatus = (userId?: string) => {
  const [banInfo, setBanInfo] = useState<UserBanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanInfo = useCallback(async () => {
    try {
      const params = userId ? `?userId=${userId}` : "";
      const response = await fetch(`/api/user/ban${params}`);
      const data = await response.json();

      if (response.ok) {
        setBanInfo(data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch ban info");
      }
    } catch (err) {
      console.log("Error fetching permissions:", err);

      setError("Failed to fetch ban info");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBanInfo();
  }, [fetchBanInfo]);

  return { banInfo, loading, error, refetch: fetchBanInfo };
};

export const useTokenUsage = () => {
  const [usage, setUsage] = useState<{
    canUseTokens: boolean;
    tokensUsed: number;
    tokenLimit: number;
    tokensRemaining: number;
    usagePercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch("/api/user/tokens");
      const data = await response.json();

      if (response.ok) {
        setUsage(data);
        setError(null);
      } else {
        setError(data.error || "Failed to fetch token usage");
      }
    } catch (err) {
      console.log("Error fetching permissions:", err);

      setError("Failed to fetch token usage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, error, refetch: fetchUsage };
};

// Hook for checking if user can perform actions that require tokens
export const useCanUseTokens = (tokensNeeded: number = 1) => {
  const { tokenInfo, loading, error } = useUserTokens();

  const canUse =
    tokenInfo?.canUseTokens && tokenInfo?.tokensRemaining >= tokensNeeded;

  return { canUse, loading, error, tokenInfo };
};

// Hook for admin-only functionality
export const useAdminOnly = () => {
  const { permissions, loading, error } = useUserPermissions();

  const isAdmin = permissions?.isAdmin || false;
  const canAccess = isAdmin && !loading && !error;

  return { isAdmin, canAccess, loading, error };
};

// Hook for checking if current user is banned
export const useIsBanned = () => {
  const { banInfo, loading, error } = useUserBanStatus();

  const isBanned = banInfo?.isBanned || false;

  return { isBanned, banInfo, loading, error };
};
