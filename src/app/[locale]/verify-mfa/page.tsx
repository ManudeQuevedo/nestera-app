"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";

export default function VerifyMFAPage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check AAL level
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel === "aal2") {
        // Already verified, redirect to dashboard
        router.push("/");
        return;
      }

      // Get factors
      const { data: factors } = await supabase.auth.mfa.listFactors();

      if (!factors?.totp || factors.totp.length === 0) {
        // No factors enrolled, need to set up
        router.push("/setup-mfa");
        return;
      }

      // Get the first verified TOTP factor
      const verifiedFactor = factors.totp.find((f) => f.status === "verified");
      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
      } else {
        // Has unverified factor, redirect to setup
        router.push("/setup-mfa");
        return;
      }
    } catch (err) {
      setError("Failed to check MFA status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || verifyCode.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const supabase = createClient();

      // Challenge the factor
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError) {
        setError(challengeError.message);
        setIsVerifying(false);
        return;
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });

      if (verifyError) {
        setError("Invalid code. Please try again.");
        setVerifyCode("");
        setIsVerifying(false);
        return;
      }

      // Success!
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      setError("Verification failed. Please try again.");
      setIsVerifying(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && verifyCode.length === 6) {
      handleVerify();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking security status...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium">Verified!</p>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <KeyRound className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Identity</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Verification Input */}
          <div className="space-y-2">
            <Label htmlFor="verify-code" className="sr-only">
              Verification Code
            </Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDown}
              className="text-center text-3xl tracking-[0.5em] font-mono h-14"
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || verifyCode.length !== 6}
            className="w-full h-12">
            {isVerifying ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-5 w-5 mr-2" />
            )}
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Open your authenticator app and enter the current code
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
