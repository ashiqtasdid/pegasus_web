"use client";
import React from 'react';
import { useUserTokens, useUserPermissions, useIsBanned } from '@/hooks/useUserManagement';

const TokenUsageCard = () => {
  const { tokenInfo, loading: tokenLoading, error: tokenError } = useUserTokens();
  const { permissions, loading: permLoading } = useUserPermissions();
  const { isBanned, banInfo } = useIsBanned();

  if (tokenLoading || permLoading) {
    return (
      <div style={{ 
        background: '#232326', 
        borderRadius: 12, 
        padding: 24, 
        color: '#fff', 
        border: '1.5px solid #232326',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 16, 
            height: 16, 
            border: '2px solid #333', 
            borderTop: '2px solid #fff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          <span style={{ color: '#b3b3b3' }}>Loading token usage...</span>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div style={{ 
        background: '#232326', 
        borderRadius: 12, 
        padding: 24, 
        color: '#fff', 
        border: '1.5px solid #dc2626',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
      }}>
        <div style={{ fontSize: 15, color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>
          Error loading token usage
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>{tokenError}</div>
      </div>
    );
  }

  if (!tokenInfo) {
    return null;
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#dc2626';
    if (percentage >= 75) return '#f59e0b';
    return '#059669';
  };

  const usagePercentage = tokenInfo.usagePercentage;
  const usageColor = getUsageColor(usagePercentage);

  return (
    <div style={{ 
      background: '#232326', 
      borderRadius: 12, 
      padding: 24, 
      color: '#fff', 
      border: `1.5px solid ${isBanned ? '#dc2626' : '#232326'}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
    }}>
      <div style={{ 
        fontSize: 15, 
        color: '#b3b3b3', 
        fontWeight: 600, 
        marginBottom: 8, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        Token Usage
        {permissions?.isAdmin && (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: '#1d4ed8', 
            color: '#fff', 
            fontSize: '12px', 
            fontWeight: 600 
          }}>
            Admin
          </span>
        )}
        {isBanned && (
          <span style={{ 
            padding: '4px 8px', 
            borderRadius: '4px', 
            background: '#dc2626', 
            color: '#fff', 
            fontSize: '12px', 
            fontWeight: 600 
          }}>
            Banned
          </span>
        )}
      </div>
      
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 2 }}>
        {tokenInfo.tokensUsed.toLocaleString()} / {tokenInfo.tokenLimit.toLocaleString()}
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          width: '100%', 
          height: 6, 
          background: '#333', 
          borderRadius: 3, 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            width: `${Math.min(100, usagePercentage)}%`, 
            height: '100%', 
            background: usageColor, 
            transition: 'width 0.3s ease' 
          }}></div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#888' }}>
          {tokenInfo.tokensRemaining.toLocaleString()} remaining ({usagePercentage.toFixed(1)}% used)
        </div>
        <div style={{ 
          fontSize: 13, 
          color: tokenInfo.canUseTokens ? '#059669' : '#dc2626', 
          fontWeight: 600 
        }}>
          {tokenInfo.canUseTokens ? 'Available' : isBanned ? 'Banned' : 'Limit Reached'}
        </div>
      </div>
      
      {isBanned && banInfo && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          background: '#dc2626', 
          borderRadius: 8, 
          fontSize: 13 
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Account Banned</div>
          {banInfo.banReason && (
            <div style={{ opacity: 0.9 }}>Reason: {banInfo.banReason}</div>
          )}
          {banInfo.bannedAt && (
            <div style={{ opacity: 0.7, marginTop: 2 }}>
              Banned on: {new Date(banInfo.bannedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenUsageCard;
