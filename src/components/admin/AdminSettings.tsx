"use client";
import React, { useState } from "react";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  security: {
    passwordMinLength: number;
    requireTwoFA: boolean;
    sessionTimeout: number;
    rateLimitRequests: number;
    rateLimitWindow: number;
    allowedIPs: string[];
  };
  api: {
    rateLimit: number;
    tokenExpiry: number;
    maxTokensPerUser: number;
    defaultTokenLimit: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    slackWebhook: string;
    discordWebhook: string;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number;
    retentionDays: number;
    backupLocation: string;
  };
}

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "Pegasus Admin",
      siteDescription: "Advanced server management platform",
      maintenanceMode: false,
      registrationEnabled: true,
      maxFileSize: 10,
      allowedFileTypes: ["jar", "zip", "txt", "json", "yml", "yaml"]
    },
    security: {
      passwordMinLength: 8,
      requireTwoFA: false,
      sessionTimeout: 24,
      rateLimitRequests: 100,
      rateLimitWindow: 15,
      allowedIPs: []
    },
    api: {
      rateLimit: 1000,
      tokenExpiry: 30,
      maxTokensPerUser: 10,
      defaultTokenLimit: 1000
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: false,
      slackWebhook: "",
      discordWebhook: ""
    },
    backup: {
      autoBackup: true,
      backupInterval: 24,
      retentionDays: 30,
      backupLocation: "/backups"
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof SystemSettings>('general');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      // Reset to default values
      setSettings({
        general: {
          siteName: "Pegasus Admin",
          siteDescription: "Advanced server management platform",
          maintenanceMode: false,
          registrationEnabled: true,
          maxFileSize: 10,
          allowedFileTypes: ["jar", "zip", "txt", "json", "yml", "yaml"]
        },
        security: {
          passwordMinLength: 8,
          requireTwoFA: false,
          sessionTimeout: 24,
          rateLimitRequests: 100,
          rateLimitWindow: 15,
          allowedIPs: []
        },
        api: {
          rateLimit: 1000,
          tokenExpiry: 30,
          maxTokensPerUser: 10,
          defaultTokenLimit: 1000
        },
        notifications: {
          emailEnabled: true,
          pushEnabled: false,
          slackWebhook: "",
          discordWebhook: ""
        },
        backup: {
          autoBackup: true,
          backupInterval: 24,
          retentionDays: 30,
          backupLocation: "/backups"
        }
      });
      setSuccess("Settings reset to defaults");
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: string | number | boolean | string[]) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'api', label: 'API', icon: '🔌' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'backup', label: 'Backup', icon: '💾' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>General Settings</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Site Name
              </label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Site Description
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                />
                Maintenance Mode
              </label>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
                Temporarily disable site access for maintenance
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.general.registrationEnabled}
                  onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
                />
                Allow User Registration
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                value={settings.general.maxFileSize}
                onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        );

      case 'security':
        return (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Security Settings</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.security.requireTwoFA}
                  onChange={(e) => updateSetting('security', 'requireTwoFA', e.target.checked)}
                />
                Require Two-Factor Authentication
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Session Timeout (hours)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Rate Limit (requests per window)
              </label>
              <input
                type="number"
                value={settings.security.rateLimitRequests}
                onChange={(e) => updateSetting('security', 'rateLimitRequests', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Rate Limit Window (minutes)
              </label>
              <input
                type="number"
                value={settings.security.rateLimitWindow}
                onChange={(e) => updateSetting('security', 'rateLimitWindow', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        );

      case 'api':
        return (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>API Settings</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                API Rate Limit (requests per minute)
              </label>
              <input
                type="number"
                value={settings.api.rateLimit}
                onChange={(e) => updateSetting('api', 'rateLimit', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Token Expiry (days)
              </label>
              <input
                type="number"
                value={settings.api.tokenExpiry}
                onChange={(e) => updateSetting('api', 'tokenExpiry', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Max Tokens Per User
              </label>
              <input
                type="number"
                value={settings.api.maxTokensPerUser}
                onChange={(e) => updateSetting('api', 'maxTokensPerUser', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Default Token Limit for New Users
              </label>
              <input
                type="number"
                value={settings.api.defaultTokenLimit}
                onChange={(e) => updateSetting('api', 'defaultTokenLimit', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Notification Settings</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) => updateSetting('notifications', 'emailEnabled', e.target.checked)}
                />
                Enable Email Notifications
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.pushEnabled}
                  onChange={(e) => updateSetting('notifications', 'pushEnabled', e.target.checked)}
                />
                Enable Push Notifications
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Slack Webhook URL
              </label>
              <input
                type="url"
                value={settings.notifications.slackWebhook}
                onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Discord Webhook URL
              </label>
              <input
                type="url"
                value={settings.notifications.discordWebhook}
                onChange={(e) => updateSetting('notifications', 'discordWebhook', e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>
          </div>
        );

      case 'backup':
        return (
          <div>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Backup Settings</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b3b3b3' }}>
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
                />
                Enable Automatic Backups
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Backup Interval (hours)
              </label>
              <input
                type="number"
                value={settings.backup.backupInterval}
                onChange={(e) => updateSetting('backup', 'backupInterval', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Retention Period (days)
              </label>
              <input
                type="number"
                value={settings.backup.retentionDays}
                onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#b3b3b3' }}>
                Backup Location
              </label>
              <input
                type="text"
                value={settings.backup.backupLocation}
                onChange={(e) => updateSetting('backup', 'backupLocation', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: '#18181b',
                  color: '#fff'
                }}
              />
            </div>

            <div style={{ 
              background: '#232326',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #333'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Manual Backup</h4>
              <p style={{ margin: '0 0 1rem 0', color: '#b3b3b3', fontSize: '0.875rem' }}>
                Create a backup immediately
              </p>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: '#1d4ed8',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Create Backup Now
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ color: '#fff' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            System Settings
          </h1>
          <p style={{ color: '#b3b3b3' }}>
            Configure system-wide settings and preferences
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1rem',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#333' : '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && (
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #666', 
                borderTop: '2px solid #fff', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
            )}
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333',
        marginBottom: '2rem'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as keyof SystemSettings)}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              color: activeTab === tab.id ? '#fff' : '#b3b3b3',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #1d4ed8' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        background: '#232326',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #333'
      }}>
        {renderTabContent()}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: '#059669',
          color: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p style={{ margin: 0 }}>{success}</p>
        </div>
      )}

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

export default AdminSettings;
