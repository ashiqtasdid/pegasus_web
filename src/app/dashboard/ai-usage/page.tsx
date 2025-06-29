"use client";
import { TokenUsageStats } from "@/components/TokenUsageStats";
import { useSession } from "@/lib/auth-client";
import { TrendingUp } from "lucide-react";

export default function AIUsagePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "testuser";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full matte-surface border border-amber-200/50 dark:border-amber-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Analytics</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gradient-primary">
            AI Usage Analytics
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
            Monitor your OpenRouter API token consumption and optimize your AI-powered development workflow
          </p>
        </div>
        <TokenUsageStats userId={userId} />
      </div>
    </div>
  );
}
