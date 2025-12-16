"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Heart, ArrowRight } from "lucide-react";

const STORAGE_KEY = "nestera-welcome-shown";

export function WelcomeModal() {
  const t = useTranslations("WelcomeModal");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if already shown
    const hasShown = localStorage.getItem(STORAGE_KEY);
    if (!hasShown) {
      // Small delay for better UX
      const timer = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg border-white/10 bg-gradient-to-br from-slate-900 to-slate-950">
        <DialogHeader className="text-center">
          {/* Welcome Icon */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>

          <DialogTitle className="text-2xl font-semibold text-white">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-base">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="py-4">
          <p className="text-white/80 text-center leading-relaxed">
            {t("body")}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
              <Heart className="h-4 w-4 text-pink-400" />
              {t("features.noJudgment")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
              <span className="text-base">🇲🇽</span>
              {t("features.mexican")}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
              <Shield className="h-4 w-4 text-blue-400" />
              {t("features.secure")}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleStart}
            className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-full text-base font-medium">
            {t("cta")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-white/50 hover:text-white/70 hover:bg-transparent">
            {t("skip")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
