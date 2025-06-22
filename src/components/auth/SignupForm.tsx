'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { Github, Mail, Eye, EyeOff, Loader2, User } from 'lucide-react';

// Custom icons for Google and Microsoft
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M13 1h10v10H13z"/>
    <path fill="#7FBA00" d="M1 13h10v10H1z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {      const result = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
      });

      if (result.error) {
        setError(result.error.message || 'Signup failed');
      } else {
        onSuccess?.();
      }    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard'
      });
    } catch (err) {
      console.error('GitHub signup error:', err);
      setError('GitHub signup failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('Google sign-up is coming soon! Please use GitHub or email for now.');
    return;
    
    // Will be enabled when credentials are configured
    // setIsLoading(true);
    // setError('');
    // try {
    //   await authClient.signIn.social({
    //     provider: 'google',
    //     callbackURL: '/dashboard'
    //   });
    // } catch (err) {
    //   console.error('Google signup error:', err);
    //   setError('Google signup failed');
    //   setIsLoading(false);
    // }
  };

  const handleMicrosoftSignup = async () => {
    setError('Microsoft sign-up is coming soon! Please use GitHub or email for now.');
    return;
    
    // Will be enabled when credentials are configured
    // setIsLoading(true);
    // setError('');
    // try {
    //   await authClient.signIn.social({
    //     provider: 'microsoft',
    //     callbackURL: '/dashboard'
    //   });
    // } catch (err) {
    //   console.error('Microsoft signup error:', err);
    //   setError('Microsoft signup failed');
    //   setIsLoading(false);
    // }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-lg bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>
          Get started with Pegasus Plugin Generator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social Signup Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-11 opacity-60 cursor-not-allowed"
            onClick={handleGoogleSignup}
            disabled={true}
          >
            <GoogleIcon />
            <span className="ml-2">Continue with Google (Coming Soon)</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 opacity-60 cursor-not-allowed"
            onClick={handleMicrosoftSignup}
            disabled={true}
          >
            <MicrosoftIcon />
            <span className="ml-2">Continue with Microsoft (Coming Soon)</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-11"
            onClick={handleGitHubSignup}
            disabled={isLoading}
          >
            <Github className="h-4 w-4" />
            <span className="ml-2">Continue with GitHub</span>
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
                disabled={isLoading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || !email || !password || password.length < 8}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
}
