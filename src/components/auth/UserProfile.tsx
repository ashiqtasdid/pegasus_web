'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Shield, 
  Save,
  Edit3,
  X,
  LogOut,
  Loader2,
  MapPin,
  Briefcase,
  Phone,
  Link,
  Github,
  Twitter
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose?: () => void;
}

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  company: string;
  phone: string;
  website: string;
  githubUsername: string;
  twitterUsername: string;
  isPublic: boolean;
  showEmail: boolean;
}

export function UserProfile({ onClose }: UserProfileProps = {}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    location: '',
    company: '',
    phone: '',
    website: '',
    githubUsername: '',
    twitterUsername: '',
    isPublic: true,
    showEmail: false,
  });
  // Initialize profile data from session
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        bio: '',
        location: '',
        company: '',
        phone: '',
        website: '',
        githubUsername: '',
        twitterUsername: '',
        isPublic: true,
        showEmail: false,
      });
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });      if (response.ok) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Step 1: Call better-auth signOut
      await authClient.signOut();
      
      // Step 2: Call comprehensive logout endpoint
      await fetch('/api/auth/complete-logout', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Step 3: Clear client-side storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Step 4: Force navigation to clear all state
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
              <Button onClick={() => router.push('/auth')}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = session.user;
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{user.name || 'Anonymous User'}</h1>
                      <Badge variant={user.emailVerified ? "default" : "secondary"}>
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                    
                    {profileData.bio && (
                      <p className="text-sm mt-2">{profileData.bio}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                  {onClose && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company or organization"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {profileData.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                
                {profileData.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.company}</span>
                  </div>
                )}
                
                {profileData.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
                
                {profileData.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profileData.website}
                    </a>
                  </div>
                )}
                
                {!(profileData.location || profileData.company || profileData.phone || profileData.website) && (
                  <p className="text-sm text-muted-foreground">No additional information provided</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>Connect your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    value={profileData.githubUsername}
                    onChange={(e) => setProfileData(prev => ({ ...prev, githubUsername: e.target.value }))}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter Username</Label>
                  <Input
                    id="twitter"
                    value={profileData.twitterUsername}
                    onChange={(e) => setProfileData(prev => ({ ...prev, twitterUsername: e.target.value }))}
                    placeholder="username"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {profileData.githubUsername && (
                  <div className="flex items-center gap-2 text-sm">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`https://github.com/${profileData.githubUsername}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      @{profileData.githubUsername}
                    </a>
                  </div>
                )}
                
                {profileData.twitterUsername && (
                  <div className="flex items-center gap-2 text-sm">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`https://twitter.com/${profileData.twitterUsername}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      @{profileData.twitterUsername}
                    </a>
                  </div>
                )}
                
                {!(profileData.githubUsername || profileData.twitterUsername) && (
                  <p className="text-sm text-muted-foreground">No social links added</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control how your information is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    checked={profileData.isPublic}
                    onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                  </div>
                  <Switch
                    checked={profileData.showEmail}
                    onCheckedChange={(checked) => setProfileData(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Public Profile:</span>
                  <Badge variant={profileData.isPublic ? "default" : "secondary"}>
                    {profileData.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email Visibility:</span>
                  <Badge variant={profileData.showEmail ? "default" : "secondary"}>
                    {profileData.showEmail ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent actions and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-1.5 bg-primary/10 text-primary rounded-full">
                  <User className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Profile Updated</p>
                  <p className="text-xs text-muted-foreground">Updated profile information</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-1.5 bg-green-500/10 text-green-600 rounded-full">
                  <Settings className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Settings Changed</p>
                  <p className="text-xs text-muted-foreground">Updated notification preferences</p>
                  <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-full">
                  <Shield className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Security Update</p>
                  <p className="text-xs text-muted-foreground">Password changed successfully</p>
                  <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and session info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{user.id}</code>
              </div>
              
              <Separator />
              
              {user.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
