"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, Users } from "lucide-react";

export function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        // Check if it's an access restriction error
        if (
          error.message.includes("Access Restricted") ||
          error.message.includes("authorized")
        ) {
          setError(
            "Access Restricted: This application is for authorized family members only."
          );
        } else {
          setError(error.message);
        }
        setIsLoading(false);
      }
      // If successful, the browser will redirect to Google
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Family Wealth OS</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Secure access for authorized family members only
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Access Denied</p>
                <p className="mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 text-base gap-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 hover:bg-muted/80"
            variant="outline">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            2FA verification is required for all users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
