'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Code,
  Palette,
  Shield,
  Zap,
  Save,
  Loader2,
  Volume2,
  VolumeX,
  Smartphone,
  RefreshCw,
  Bug,
  BarChart3,  TestTube,
  Key,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  browserNotifications: boolean;
  autoSave: boolean;
  codeCompletion: boolean;
  language: string;
  timezone: string;
  editorFontSize: number;
  editorFontFamily: string;
  editorTabSize: number;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  editorLineNumbers: boolean;
  chatAutoScroll: boolean;
  chatSoundEnabled: boolean;
  pluginAutoReload: boolean;
  debugMode: boolean;
  analyticsEnabled: boolean;
  crashReporting: boolean;
  betaFeatures: boolean;
}

interface UserSettingsProps {
  onClose?: () => void;
}

export function UserSettings({ onClose }: UserSettingsProps = {}) {
  const { isPending } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'appearance' | 'editor' | 'notifications' | 'privacy' | 'advanced'>('appearance');

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Set default settings if API fails
        setSettings({
          theme: 'dark',
          emailNotifications: true,
          browserNotifications: false,
          autoSave: true,
          codeCompletion: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          editorFontSize: 14,
          editorFontFamily: 'Monaco, Consolas, monospace',
          editorTabSize: 2,
          editorWordWrap: true,
          editorMinimap: true,
          editorLineNumbers: true,
          chatAutoScroll: true,
          chatSoundEnabled: false,
          pluginAutoReload: false,
          debugMode: false,
          analyticsEnabled: true,
          crashReporting: true,
          betaFeatures: false,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });      if (response.ok) {
        // Show success message with toast notification
        toast.success('Settings saved successfully!');
        
        // Apply theme immediately if changed
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } else {
        toast.error('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setIsPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (isPending || isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Customize your workspace and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {sections.map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    variant={activeSection === id ? 'default' : 'ghost'}
                    onClick={() => setActiveSection(id as 'appearance' | 'editor' | 'notifications' | 'privacy' | 'advanced')}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Appearance Settings */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme
                  </CardTitle>
                  <CardDescription>Choose your preferred color scheme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Monitor },
                    ].map(({ id, label, icon: Icon }) => (
                      <div
                        key={id}
                        className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          settings.theme === id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => updateSetting('theme', id as 'light' | 'dark' | 'system')}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="w-6 h-6" />
                          <span className="font-medium">{label}</span>
                        </div>
                        {settings.theme === id && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Options</CardTitle>
                  <CardDescription>Customize your display preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      placeholder="en"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Editor Settings */}
          {activeSection === 'editor' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Editor
                  </CardTitle>
                  <CardDescription>Configure your coding environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Input
                        id="fontSize"
                        type="number"
                        min="8"
                        max="32"
                        value={settings.editorFontSize}
                        onChange={(e) => updateSetting('editorFontSize', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tabSize">Tab Size</Label>
                      <Input
                        id="tabSize"
                        type="number"
                        min="1"
                        max="8"
                        value={settings.editorTabSize}
                        onChange={(e) => updateSetting('editorTabSize', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Input
                      id="fontFamily"
                      value={settings.editorFontFamily}
                      onChange={(e) => updateSetting('editorFontFamily', e.target.value)}
                      placeholder="Monaco, Consolas, monospace"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Save</Label>
                        <p className="text-sm text-muted-foreground">Automatically save changes</p>
                      </div>
                      <Switch
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Code Completion</Label>
                        <p className="text-sm text-muted-foreground">Enable intelligent suggestions</p>
                      </div>
                      <Switch
                        checked={settings.codeCompletion}
                        onCheckedChange={(checked) => updateSetting('codeCompletion', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Word Wrap</Label>
                        <p className="text-sm text-muted-foreground">Wrap long lines</p>
                      </div>
                      <Switch
                        checked={settings.editorWordWrap}
                        onCheckedChange={(checked) => updateSetting('editorWordWrap', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Minimap</Label>
                        <p className="text-sm text-muted-foreground">Show code overview</p>
                      </div>
                      <Switch
                        checked={settings.editorMinimap}
                        onCheckedChange={(checked) => updateSetting('editorMinimap', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Line Numbers</Label>
                        <p className="text-sm text-muted-foreground">Show line numbers</p>
                      </div>
                      <Switch
                        checked={settings.editorLineNumbers}
                        onCheckedChange={(checked) => updateSetting('editorLineNumbers', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Control how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Browser Notifications</Label>
                          <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.browserNotifications}
                        onCheckedChange={(checked) => updateSetting('browserNotifications', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {settings.chatSoundEnabled ? (
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div>
                          <Label>Chat Sounds</Label>
                          <p className="text-sm text-muted-foreground">Play sound for chat messages</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.chatSoundEnabled}
                        onCheckedChange={(checked) => updateSetting('chatSoundEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Chat Auto Scroll</Label>
                          <p className="text-sm text-muted-foreground">Automatically scroll to new messages</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.chatAutoScroll}
                        onCheckedChange={(checked) => updateSetting('chatAutoScroll', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy & Data
                  </CardTitle>
                  <CardDescription>Control your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Analytics</Label>
                          <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.analyticsEnabled}
                        onCheckedChange={(checked) => updateSetting('analyticsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bug className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Crash Reporting</Label>
                          <p className="text-sm text-muted-foreground">Send crash reports to help fix issues</p>
                        </div>
                      </div>                      <Switch
                        checked={settings.crashReporting}
                        onCheckedChange={(checked) => updateSetting('crashReporting', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Security
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <Label>Password</Label>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                      </div>
                    </div>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Change Password
                          </DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new secure password.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter current password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password (min 8 characters)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          >
                            {isChangingPassword ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Changing...
                              </>
                            ) : (
                              'Change Password'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Advanced Settings */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Experimental features and advanced options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Plugin Auto Reload</Label>
                          <p className="text-sm text-muted-foreground">Automatically reload plugins when files change</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.pluginAutoReload}
                        onCheckedChange={(checked) => updateSetting('pluginAutoReload', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bug className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-sm text-muted-foreground">Enable debug logging and tools</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.debugMode}
                        onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TestTube className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label>Beta Features</Label>
                          <p className="text-sm text-muted-foreground">Enable experimental features</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.betaFeatures}
                        onCheckedChange={(checked) => updateSetting('betaFeatures', checked)}
                      />
                    </div>
                  </div>

                  {settings.betaFeatures && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <TestTube className="w-4 h-4" />
                        <span className="font-medium">Beta Features Enabled</span>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                        You have access to experimental features that may be unstable.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
