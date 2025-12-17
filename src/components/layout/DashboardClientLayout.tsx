"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AskAIBubble } from "@/components/ai/AskAIBubble";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/finance";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  categories: Category[];
  plan: string;
  appSettings?: any;
}

function DashboardShell({
  children,
  categories,
  plan,
  appSettings,
}: DashboardShellProps) {
  const { isCollapsed, setIsCollapsed, setIsSettingsOpen } = useSidebar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("action") === "settings") {
      setIsSettingsOpen(true);
      // Clean URL
      const params = new URLSearchParams(searchParams);
      params.delete("action");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, setIsSettingsOpen, router, pathname]);

  return (
    <>
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
}

export function DashboardClientLayout({
  children,
  categories,
  plan,
  appSettings,
}: DashboardClientLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShell
        categories={categories}
        plan={plan}
        appSettings={appSettings}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
