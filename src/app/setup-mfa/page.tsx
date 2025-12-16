"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, QrCode, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function SetupMFAPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    setIsLoading(true);
    setError(null);

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

      // Check if already has TOTP enrolled
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp && factors.totp.length > 0) {
        // Already enrolled, redirect to verify
        router.push("/verify-mfa");
        return;
      }

      // Enroll a new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Family Wealth Authenticator",
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data) {
        setQrCode(data.totp.uri);
        setFactorId(data.id);
      }
    } catch (err) {
      setError("Failed to set up 2FA. Please try again.");
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
        setIsVerifying(false);
        return;
      }

      // Success!
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError("Verification failed. Please try again.");
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up 2FA...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium">2FA Setup Complete!</p>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Up 2FA</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Scan the QR code with your authenticator app
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {qrCode ? (
            <>
              {/* QR Code Display */}
              <div className="flex justify-center p-4 bg-white rounded-xl border">
                <QRCodeSVG value={qrCode} size={200} level="M" />
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>Scan with Google Authenticator, Authy, or similar app</p>
              </div>

              {/* Verification Input */}
              <div className="space-y-2">
                <Label htmlFor="verify-code">Enter 6-digit code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, ""))
                  }
                  className="text-center text-2xl tracking-[0.5em] font-mono"
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
                {isVerifying ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <QrCode className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                Failed to generate QR code
              </p>
              <Button onClick={enrollMFA} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
