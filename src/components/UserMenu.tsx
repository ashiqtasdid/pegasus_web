'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  Settings, 
  ChevronUp, 
  Shield,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserMenuProps {
  variant?: 'sidebar' | 'header';
  showEmail?: boolean;
}

export function UserMenu({ variant = 'sidebar', showEmail = true }: UserMenuProps) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Check if we're in development mode
  const isDevelopmentMode = process.env.DEVELOP === 'true';

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push('/auth');
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleViewProfile = () => {
    router.push('/dashboard?view=profile');
  };

  const handleSettings = () => {
    router.push('/dashboard?view=settings');
  };

  // Development mode display
  if (isDevelopmentMode) {
    return (
      <div className={`flex items-center gap-3 ${variant === 'sidebar' ? 'p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-yellow-500/20 text-yellow-700">
            <Shield className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-700">Dev Mode</p>
          {showEmail && (
            <p className="text-xs text-yellow-600 truncate">Authentication Disabled</p>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isPending) {
    return (
      <div className={`flex items-center gap-3 ${variant === 'sidebar' ? 'p-3' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Loader2 className="h-4 w-4 animate-spin" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Loading...</p>
          {showEmail && (
            <p className="text-xs text-muted-foreground">Please wait</p>
          )}
        </div>
      </div>
    );
  }

  // Error or no session state
  if (error || !session) {
    return (
      <div className={`flex items-center gap-3 ${variant === 'sidebar' ? 'p-3' : ''}`}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/auth')}
          className="w-full"
        >
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </div>
    );
  }

  // Get user info
  const user = session.user;
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U';
  // Sidebar variant - more compact
  if (variant === 'sidebar') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto hover:bg-sidebar-accent/80 rounded-xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-sidebar"></div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {user.name || 'User'}
                </p>
                {showEmail && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-64 shadow-xl border-0 bg-background/95 backdrop-blur-sm" 
          align="end" 
          side="top"
          sideOffset={12}
        >
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{user.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewProfile} className="p-3 cursor-pointer">
            <User className="mr-3 h-4 w-4" />
            <span className="font-medium">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings} className="p-3 cursor-pointer">
            <Settings className="mr-3 h-4 w-4" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            disabled={isSigningOut}
            className="text-red-600 focus:text-red-600 p-3 cursor-pointer"
          >
            {isSigningOut ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-3 h-4 w-4" />
            )}
            <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  // Header variant - more horizontal
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-300">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 shadow-xl border-0 bg-background/95 backdrop-blur-sm" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">{user.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile} className="p-3 cursor-pointer">
          <User className="mr-3 h-4 w-4" />
          <span className="font-medium">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSettings} className="p-3 cursor-pointer">
          <Settings className="mr-3 h-4 w-4" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          disabled={isSigningOut}
          className="text-red-600 focus:text-red-600 p-3 cursor-pointer"
        >
          {isSigningOut ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-3 h-4 w-4" />
          )}
          <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
