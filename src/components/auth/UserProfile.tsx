'use client';

import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { LogOut, Mail, Calendar, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserProfile() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <UserIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Please sign in to view your profile</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { user, session: sessionInfo } = session;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className="text-lg">
              {user.name
                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.email[0].toUpperCase()
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{user.name || 'Anonymous User'}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="ml-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        
        <div className="grid gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Account Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
              </div>
                <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email Verified:</span>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Session Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session ID:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {sessionInfo.id.slice(0, 8)}...
                </code>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expires:</span>
                <span className="text-xs">
                  {new Date(sessionInfo.expiresAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="text-xs">
                  {new Date(sessionInfo.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {user.createdAt && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
