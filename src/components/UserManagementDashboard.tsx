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

const UserManagementDashboard = () => {
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
      console.log("Error fetching permissions:", err);

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
      console.log("Error fetching permissions:", err);

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
      console.log("Error fetching permissions:", err);

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
            background: "#fee",
            color: "#c53030",
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
            background: "#e6fffa",
            color: "#0d9488",
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
          background: "#f0f9ff",
          color: "#1e40af",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid #333",
              borderTop: "2px solid #fff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#fff" }}>
        <div
          style={{
            background: "#fee",
            color: "#c53030",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #fed7d7",
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          User Management
        </h1>
        <p style={{ color: "#b3b3b3" }}>
          Manage users, permissions, and token limits
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "#232326",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {stats.totalUsers}
            </h3>
            <p style={{ color: "#b3b3b3" }}>Total Users</p>
          </div>
          <div
            style={{
              background: "#232326",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {stats.totalAdmins}
            </h3>
            <p style={{ color: "#b3b3b3" }}>Admins</p>
          </div>
          <div
            style={{
              background: "#232326",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {stats.totalBanned}
            </h3>
            <p style={{ color: "#b3b3b3" }}>Banned Users</p>
          </div>
          <div
            style={{
              background: "#232326",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <h3
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              {Math.round(stats.averageTokensUsed)}
            </h3>
            <p style={{ color: "#b3b3b3" }}>Avg Tokens Used</p>
          </div>
        </div>
      )}

      {/* Search and Actions */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1",
            minWidth: "300px",
            padding: "0.75rem",
            background: "#232326",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            setSortBy(field);
            setSortOrder(order);
          }}
          style={{
            padding: "0.75rem",
            background: "#232326",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "#fff",
          }}
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="tokensUsed-desc">Most Tokens Used</option>
          <option value="tokensUsed-asc">Least Tokens Used</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div
          style={{
            background: "#232326",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            border: "1px solid #333",
          }}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            {selectedUsers.length} user(s) selected
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowBanModal(true)}
              style={{
                padding: "0.5rem 1rem",
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Ban Selected
            </button>
            <button
              onClick={() => handleBulkAction("unban")}
              style={{
                padding: "0.5rem 1rem",
                background: "#059669",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Unban Selected
            </button>
            <button
              onClick={() => handleBulkAction("setAdmin")}
              style={{
                padding: "0.5rem 1rem",
                background: "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Make Admin
            </button>
            <button
              onClick={() => handleBulkAction("removeAdmin")}
              style={{
                padding: "0.5rem 1rem",
                background: "#6b7280",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Remove Admin
            </button>
            <button
              onClick={() => setShowTokenModal(true)}
              style={{
                padding: "0.5rem 1rem",
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Set Token Limit
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div
        style={{
          background: "#232326",
          borderRadius: "8px",
          border: "1px solid #333",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a1a" }}>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(users.map((u) => u.id));
                    } else {
                      setSelectedUsers([]);
                    }
                  }}
                />
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                User
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                Tokens
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                Joined
              </th>
              <th
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderBottom: "1px solid #333",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #333" }}>
                <td style={{ padding: "1rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((id) => id !== user.id)
                        );
                      }
                    }}
                  />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{user.name}</div>
                    <div style={{ color: "#b3b3b3", fontSize: "0.875rem" }}>
                      {user.email}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>{getStatusBadge(user)}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontSize: "0.875rem" }}>
                    <div>
                      {user.tokensUsed.toLocaleString()} /{" "}
                      {user.tokenLimit.toLocaleString()}
                    </div>
                    <div style={{ color: "#b3b3b3" }}>
                      {((user.tokensUsed / user.tokenLimit) * 100).toFixed(1)}%
                      used
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontSize: "0.875rem",
                    color: "#b3b3b3",
                  }}
                >
                  {formatDate(user.createdAt)}
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleUserAction(user.id, "toggleAdmin")}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: user.isAdmin ? "#6b7280" : "#1d4ed8",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, "toggleBan")}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: user.isBanned ? "#059669" : "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "0.5rem 1rem",
            background: currentPage === 1 ? "#333" : "#232326",
            color: currentPage === 1 ? "#666" : "#fff",
            border: "1px solid #333",
            borderRadius: "4px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Previous
        </button>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 1rem",
            color: "#b3b3b3",
          }}
        >
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "0.5rem 1rem",
            background: currentPage === totalPages ? "#333" : "#232326",
            color: currentPage === totalPages ? "#666" : "#fff",
            border: "1px solid #333",
            borderRadius: "4px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#232326",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #333",
            }}
          >
            <h3 style={{ marginBottom: "1rem", fontWeight: "bold" }}>
              Ban Users
            </h3>
            <p style={{ marginBottom: "1rem", color: "#b3b3b3" }}>
              You are about to ban {selectedUsers.length} user(s). Please
              provide a reason:
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              style={{
                width: "100%",
                height: "100px",
                padding: "0.75rem",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#fff",
                marginBottom: "1rem",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowBanModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction("ban", { banReason })}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Ban Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Limit Modal */}
      {showTokenModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#232326",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #333",
            }}
          >
            <h3 style={{ marginBottom: "1rem", fontWeight: "bold" }}>
              Set Token Limit
            </h3>
            <p style={{ marginBottom: "1rem", color: "#b3b3b3" }}>
              Set token limit for {selectedUsers.length} selected user(s):
            </p>
            <input
              type="number"
              value={newTokenLimit}
              onChange={(e) => setNewTokenLimit(e.target.value)}
              placeholder="Token limit"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#fff",
                marginBottom: "1rem",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowTokenModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleBulkAction("setTokenLimit", {
                    tokenLimit: parseInt(newTokenLimit),
                  })
                }
                style={{
                  padding: "0.5rem 1rem",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                disabled={!newTokenLimit || isNaN(parseInt(newTokenLimit))}
              >
                Update Limits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementDashboard;
