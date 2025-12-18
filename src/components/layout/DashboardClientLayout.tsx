"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AskAIBubble } from "@/components/ai/AskAIBubble";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/finance";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  categories: Category[];
  plan: string;
  appSettings?: any;
  trialDaysRemaining?: number;
}

function DashboardShell({
  children,
  categories,
  plan,
  appSettings,
  trialDaysRemaining,
}: DashboardShellProps) {
  const { isCollapsed, setIsCollapsed, setIsSettingsOpen } = useSidebar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("action") === "settings") {
      setIsSettingsOpen(true);
      // Clean URL
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, setIsSettingsOpen, router, pathname]);

  // Check for Last Day trial warning
  useEffect(() => {
    if (
      trialDaysRemaining !== undefined &&
      trialDaysRemaining <= 1 &&
      trialDaysRemaining > 0
    ) {
      const dismissed = localStorage.getItem("trial_last_day_dismissed");
      if (!dismissed) {
        setShowTrialModal(true);
      }
    }
  }, [trialDaysRemaining]);

  const dismissTrialModal = () => {
    localStorage.setItem("trial_last_day_dismissed", "true");
    setShowTrialModal(false);
  };

  return (
    <>
      {/* Last Day Trial Alert Modal */}
      {showTrialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300">
            <button
              onClick={dismissTrialModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ¡Última Oportunidad!
                </h3>
                <p className="text-sm text-slate-500">
                  Tu prueba termina mañana
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              ¿Quieres conservar tus datos premium y seguir disfrutando de todas
              las funciones de Family Plus?
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  dismissTrialModal();
                  router.push("/pricing");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Conservar Premium
              </Button>
              <Button
                variant="outline"
                onClick={dismissTrialModal}
                className="text-slate-500">
                Dejar que expire
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* App Shell - Twin Pillars Layout with Gap */}
      <div className="flex min-h-[100dvh] w-full bg-[#e7ecef] dark:bg-[#020617] overflow-hidden gap-0">
        {/* Column 1: The Sidebar (Fixed Width with padding) - Desktop Only */}
        <aside
          className={cn(
            "hidden md:block flex-shrink-0 p-4 pr-0 transition-all duration-300",
            isCollapsed ? "w-[104px]" : "w-[272px]"
          )}>
          <Sidebar
            categories={categories}
            plan={plan}
            appSettings={appSettings}
          />
        </aside>

        {/* Column 2: The Main Content (Fluid) */}
        <main className="flex-1 min-h-[100dvh] overflow-y-auto p-4 pb-24 md:pb-4 relative">
          {/* Expand Sidebar Trigger (when collapsed) */}
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="absolute top-4 left-4 z-50 hidden md:flex bg-slate-800/50 backdrop-blur-md text-white hover:bg-slate-700 transition-all rounded-lg">
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Native App Tab Bar */}
      <MobileBottomNav />

      {/* Floating AI Chat Bubble - Hidden on mobile when bottom nav is visible */}
      <div className="hidden md:block">
        <AskAIBubble />
      </div>
    </>
  );
}

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  categories: Category[];
  plan: string;
  appSettings?: any;
  trialDaysRemaining?: number;
}

export function DashboardClientLayout({
  children,
  categories,
  plan,
  appSettings,
  trialDaysRemaining,
}: DashboardClientLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShell
        categories={categories}
        plan={plan}
        appSettings={appSettings}
        trialDaysRemaining={trialDaysRemaining}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
