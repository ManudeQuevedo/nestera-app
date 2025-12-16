"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Loader2,
  Check,
  Globe,
  Sparkles,
  CreditCard,
  ExternalLink,
  Camera,
  User,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "next-themes";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

type Theme = "light" | "dark" | "system";
type Currency = "USD" | "MXN" | "EUR";

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [subscription, setSubscription] = useState<{
    tier: string;
    status: string;
  } | null>(null);

  // Initialize with current theme
  useEffect(() => {
    setTheme((currentTheme as Theme) || "system");
  }, [currentTheme]);

  // Load settings on open
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "theme, currency_preference, avatar_url, subscription_tier, subscription_status"
          )
          .eq("id", user.id)
          .single();

        if (profile) {
          const loadedTheme = (profile.theme as Theme) || "system";
          setTheme(loadedTheme);
          setCurrency((profile.currency_preference as Currency) || "USD");
          setAvatarUrl(profile.avatar_url || "");
          setSubscription({
            tier: profile.subscription_tier || "FREE",
            status: profile.subscription_status || "inactive",
          });
        }
      } else {
        // Not logged in, use localStorage theme
        setTheme((currentTheme as Theme) || "system");
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setTheme((currentTheme as Theme) || "system");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Apply theme immediately via context
      setGlobalTheme(theme);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            theme,
            currency_preference: currency,
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Theme still applied locally even if Supabase fails
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to redirect to portal:", error);
    }
  };

  const currencyOptions = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "MXN", label: "Mexican Peso (MXN)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
  ];

  const isSubscribed =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isFree = !isSubscribed || subscription?.tier === "FREE";

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB"); // Valid fallback since no toast
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      // Inline success feedback could be added here if needed,
      // but the image update tells the user it worked.
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading avatar"); // Fallback
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 px-3">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <User className="h-10 w-10 text-white/90" />
                  )}
                </div>

                {/* Overlay with Camera Icon */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white drop-shadow-md" />
                </div>

                {/* Edit Indicator Badge */}
                <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-lg border-2 border-slate-50 dark:border-slate-900 text-slate-600 dark:text-slate-300">
                  <Camera className="h-3 w-3" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-3 font-medium">
                Tap to change photo
              </p>
            </div>

            {/* Subscription Section */}
            {isFree ? (
              // Scenario A: Free Plan
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/10 to-transparent p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        Plan Gratuito
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Desbloquea todo el potencial de Nestera.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => (window.location.href = "/pricing")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold tracking-wide uppercase text-xs h-9">
                    Mejorar
                  </Button>
                </div>
              </div>
            ) : (
              // Scenario B: Subscribed
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                      <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        Miembro {subscription?.tier}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="h-3 w-3" />
                          Suscripción Activa
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageSubscription}
                    className="h-8 text-xs">
                    Gestionar
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Theme Selector */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex gap-2">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      setTheme(option.value as Theme);
                      setGlobalTheme(option.value as Theme);
                    }}>
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <LanguageSwitcher variant="buttons" />
              <p className="text-xs text-muted-foreground">
                Select your preferred language for the interface.
              </p>
            </div>

            {/* Currency Selector */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be used to display amounts across the app.
              </p>
            </div>

            {/* Save Button */}
            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
