"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ShieldAlert,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type AuthView = "login" | "signup" | "forgot_password";
type AuthStatus = "idle" | "loading" | "success" | "error";

export function LoginClient() {
  const t = useTranslations("Auth.login");
  const [view, setView] = useState<AuthView>("login");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setStatus("loading");
    setError(null);

    try {
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

      if (error) throw error;
      // Redirect happens automatically
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error(t("accessDenied")); // Generic error for safety or specific if needed
        }
        throw error;
      }

      // Success - router will handle redirect in page.tsx or middleware usually,
      // but here we just wait or refresh. page.tsx usually handles the redirect logic on mount/update.
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setStatus("success");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
      });

      if (error) throw error;

      setStatus("success");
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setStatus("idle");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 px-4">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-8 ring-1 ring-white/5">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center text-center space-y-6 py-8">
                <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    {view === "forgot_password"
                      ? t("recoverySent")
                      : t("checkEmail")}
                  </h2>
                  <p className="text-slate-400 max-w-[280px] mx-auto">
                    {view === "forgot_password"
                      ? t("recoverySentDesc")
                      : t("checkEmailDesc")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => switchView("login")}
                  className="text-white hover:text-emerald-400 hover:bg-emerald-950/30">
                  {t("backToLogin")}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                {/* Dynamic Header */}
                <div className="flex flex-col items-center text-center space-y-6 mb-8">
                  {view === "login" && (
                    <motion.div className="h-12 w-12 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Wallet className="h-6 w-6 text-white" />
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      {view === "login" && t("welcomeBack")}
                      {view === "signup" && t("startLegacy")}
                      {view === "forgot_password" && t("recoverAccess")}
                    </h1>
                    <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                      {view === "login" && t("subtitle")}
                      {view === "signup" && t("subtitle")}
                      {view === "forgot_password" && t("recoverySentDesc")}
                    </p>
                  </div>
                </div>

                {/* Main Action (Google) - Only on Login/Signup */}
                {view !== "forgot_password" && (
                  <>
                    <Button
                      onClick={handleGoogleLogin}
                      disabled={status === "loading"}
                      className="w-full h-12 bg-white hover:bg-slate-200 text-black font-medium text-base transition-all duration-300 hover:scale-[1.02] border-0 mb-6">
                      {status === "loading" ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                      {t("googleButton")}
                    </Button>

                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0f1115] px-2 text-slate-500 rounded-full border border-white/5">
                          {t("divider")}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Email Form */}
                <form
                  onSubmit={
                    view === "login"
                      ? handleEmailLogin
                      : view === "signup"
                      ? handleSignUp
                      : handleResetPassword
                  }
                  className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-slate-400 ml-1">
                        {t("emailLabel")}
                      </Label>
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-11"
                        placeholder={t("emailPlaceholder")}
                      />
                    </div>

                    {view !== "forgot_password" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-slate-400 ml-1">
                            {t("passwordLabel")}
                          </Label>
                          {view === "login" && (
                            <button
                              type="button"
                              onClick={() => switchView("forgot_password")}
                              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                              {t("forgotPassword")}
                            </button>
                          )}
                        </div>
                        <Input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-11"
                          placeholder={t("passwordPlaceholder")}
                        />
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-200 mt-2">
                    {status === "loading" && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    {view === "login" && t("submitLogin")}
                    {view === "signup" && t("submitSignup")}
                    {view === "forgot_password" && t("submitRecovery")}
                  </Button>
                </form>

                {/* Footer Links */}
                <div className="mt-6 text-center">
                  {view === "login" && (
                    <button
                      onClick={() => switchView("signup")}
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {t("noAccount")}
                    </button>
                  )}

                  {view === "signup" && (
                    <button
                      onClick={() => switchView("login")}
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {t("hasAccount")}
                    </button>
                  )}

                  {view === "forgot_password" && (
                    <button
                      onClick={() => switchView("login")}
                      className="flex items-center justify-center w-full text-sm text-slate-400 hover:text-white transition-colors gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {t("backToLogin")}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
