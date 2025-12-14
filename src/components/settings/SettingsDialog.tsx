"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  User,
  Globe,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/components/theme/ThemeProvider";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

type Theme = "light" | "dark" | "system";
type Currency = "USD" | "MXN" | "EUR";

export function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [theme, setTheme] = useState<Theme>("light");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Initialize with current theme
  useEffect(() => {
    setTheme(currentTheme);
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
          .select("theme, currency_preference, avatar_url")
          .eq("id", user.id)
          .single();

        if (profile) {
          const loadedTheme = (profile.theme as Theme) || "system";
          setTheme(loadedTheme);
          setCurrency((profile.currency_preference as Currency) || "USD");
          setAvatarUrl(profile.avatar_url || "");
        }
      } else {
        // Not logged in, use localStorage theme
        setTheme(currentTheme);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setTheme(currentTheme);
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

  const currencyOptions = [
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "MXN", label: "Mexican Peso (MXN)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
  ];

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
