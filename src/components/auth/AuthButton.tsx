"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn, LogOut, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface AuthButtonProps {
  collapsed?: boolean;
}

export function AuthButton({ collapsed = false }: AuthButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
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
        console.error("Sign in error:", error);
        setIsSigningIn(false);
      }
      // If successful, browser redirects to Google
    } catch (err) {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center text-muted-foreground",
          collapsed ? "justify-center h-10" : "gap-3 px-3 py-2"
        )}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  // User is authenticated - show Logout button
  if (user) {
    if (collapsed) {
      return (
        <div
          role="button"
          onClick={handleSignOut}
          className="flex items-center justify-center h-10 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50">
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </div>
      );
    }

    return (
      <div
        role="button"
        onClick={handleSignOut}
        className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50">
        {isSigningOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {isSigningOut ? "Signing out..." : "Sign Out"}
      </div>
    );
  }

  // User is not authenticated - show Sign In button with modal
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {collapsed ? (
          <div
            role="button"
            className="flex items-center justify-center h-10 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50">
            <LogIn className="h-4 w-4" />
          </div>
        ) : (
          <div
            role="button"
            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-muted/50">
            <LogIn className="h-4 w-4" />
            Sign In
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Users className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Family Wealth OS
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to access your financial dashboard
          </p>
        </DialogHeader>

        <div className="pt-4">
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full h-11 gap-3"
            variant="outline">
            {isSigningIn ? (
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
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-4">
            Authorized family members only
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
