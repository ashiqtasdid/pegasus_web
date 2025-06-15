'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Pegasus</h1>
          <p className="text-muted-foreground">
            AI-Powered Minecraft Plugin Generator
          </p>
        </div>

        {isLogin ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}
