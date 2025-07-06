"use client";
import React, { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  tokensUsed: number;
  tokenLimit: number;
  tokensRemaining: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

interface UserManagementStats {
  totalUsers: number;
  totalAdmins: number;
  totalBanned: number;
  totalTokensUsed: number;
  averageTokensUsed: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newTokenLimit, setNewTokenLimit] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/user/manage?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.log("Error fetching users:", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, sortBy, sortOrder, fetchUsers]);

  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    if (selectedUsers.length === 0) return;

    try {
      const response = await fetch("/api/user/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userIds: selectedUsers,
          data,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchUsers();
        setSelectedUsers([]);
        setShowBanModal(false);
        setShowTokenModal(false);
        setBanReason("");
        setNewTokenLimit("");
      } else {
        setError(result.error || "Failed to perform action");
      }
    } catch (err) {
      console.log("Error performing bulk action:", err);
      setError("Failed to perform action");
    }
  };

  const handleUserAction = async (
    userId: string,
    action: string,
    data?: Record<string, unknown>
  ) => {
    try {
      let url = "";
      const method = "POST";
      let body: Record<string, unknown> = {};

      switch (action) {
        case "toggleAdmin":
          url = "/api/user/admin";
          body = {
            userId,
            isAdmin: !users.find((u) => u.id === userId)?.isAdmin,
          };
          break;
        case "toggleBan":
          url = "/api/user/ban";
          const user = users.find((u) => u.id === userId);
          body = {
            userId,
            isBanned: !user?.isBanned,
            banReason: data?.banReason,
          };
          break;
        case "updateTokens":
          url = "/api/user/tokens";
          body = { userId, action: data?.action, tokenLimit: data?.tokenLimit };
          break;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        fetchUsers();
      } else {
        setError(result.error || "Failed to perform action");
      }
    } catch (err) {
      console.log("Error performing user action:", err);
      setError("Failed to perform action");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            background: "#fecaca",
            color: "#dc2626",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Banned
        </span>
      );
    }
    if (user.isAdmin) {
      return (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            background: "#d1fae5",
            color: "#059669",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Admin
        </span>
      );
    }
    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          background: "#e5e7eb",
          color: "#6b7280",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        User
      </span>
    );
  };

  const getTokenUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return "#dc2626";
    if (percentage >= 70) return "#f59e0b";
    return "#10b981";
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        color: '#fff'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid #333', 
            borderTop: '2px solid #fff', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}></div>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          User Management
        </h1>
        <p style={{ color: '#b3b3b3' }}>
          Manage users, permissions, and token limits
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>Total Users</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>Admins</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalAdmins}</p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>Banned</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalBanned}</p>
          </div>
          <div style={{ 
            background: '#232326', 
            padding: '1.5rem', 
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Tokens Used</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalTokensUsed}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#232326',
            color: '#fff',
            minWidth: '200px'
          }}
        />
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#232326',
            color: '#fff'
          }}
        >
          <option value="createdAt">Created Date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="tokensUsed">Tokens Used</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#232326',
            color: '#fff'
          }}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        {selectedUsers.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowBanModal(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Ban Selected ({selectedUsers.length})
            </button>
            <button
              onClick={() => setShowTokenModal(true)}
              style={{
                padding: '0.5rem 1rem',
                background: '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Update Tokens
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div style={{ 
        background: '#232326', 
        borderRadius: '8px',
        border: '1px solid #333',
        overflow: 'hidden'
      }}>
        <div style={{ 
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ background: '#1f1f23' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Select
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>Tokens</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>Last Login</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                      <div style={{ color: '#b3b3b3', fontSize: '0.875rem' }}>{user.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(user)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ 
                      color: getTokenUsageColor(user.tokensUsed, user.tokenLimit),
                      fontWeight: 'bold'
                    }}>
                      {user.tokensUsed} / {user.tokenLimit}
                    </div>
                    <div style={{ 
                      width: '100px', 
                      height: '4px', 
                      background: '#333', 
                      borderRadius: '2px',
                      marginTop: '4px'
                    }}>
                      <div style={{ 
                        width: `${Math.min((user.tokensUsed / user.tokenLimit) * 100, 100)}%`, 
                        height: '100%', 
                        background: getTokenUsageColor(user.tokensUsed, user.tokenLimit),
                        borderRadius: '2px'
                      }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#b3b3b3' }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#b3b3b3' }}>
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUserAction(user.id, 'toggleAdmin')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: user.isAdmin ? '#dc2626' : '#059669',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'toggleBan')}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: user.isBanned ? '#059669' : '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === 1 ? '#333' : '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{ color: '#b3b3b3' }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              background: currentPage === totalPages ? '#333' : '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#232326',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #333',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Ban Users</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#b3b3b3' }}>
              Are you sure you want to ban {selectedUsers.length} user(s)?
            </p>
            <textarea
              placeholder="Ban reason (optional)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                background: '#18181b',
                color: '#fff',
                resize: 'vertical',
                minHeight: '80px',
                marginBottom: '1rem'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowBanModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('ban', { banReason })}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Ban Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Modal */}
      {showTokenModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#232326',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #333',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Update Token Limits</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#b3b3b3' }}>
              Set new token limit for {selectedUsers.length} user(s)
            </p>
            <input
              type="number"
              placeholder="New token limit"
              value={newTokenLimit}
              onChange={(e) => setNewTokenLimit(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #333',
                background: '#18181b',
                color: '#fff',
                marginBottom: '1rem'
              }}
            />
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowTokenModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('setTokenLimit', { tokenLimit: parseInt(newTokenLimit) })}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1d4ed8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={!newTokenLimit || isNaN(parseInt(newTokenLimit))}
              >
                Update Limits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: '#dc2626',
          color: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p style={{ margin: 0 }}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
