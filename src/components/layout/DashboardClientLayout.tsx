"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/SidebarContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { AskAIBubble } from "@/components/ai/AskAIBubble";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/finance";

interface DashboardShellProps {
  children: React.ReactNode;
  categories: Category[];
  plan: string;
}

function DashboardShell({ children, categories, plan }: DashboardShellProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <>
      {/* App Shell - Twin Pillars Layout with Gap */}
      <div className="flex h-screen w-full bg-[#e7ecef] dark:bg-[#020617] overflow-hidden gap-0">
        {/* Column 1: The Sidebar (Fixed Width with padding) */}
        <aside
          className={cn(
            "hidden md:block flex-shrink-0 p-4 pr-0 transition-all duration-300",
            isCollapsed ? "w-[104px]" : "w-[272px]"
          )}>
          <Sidebar categories={categories} plan={plan} />
        </aside>

        {/* Column 2: The Main Content (Fluid) */}
        <main className="flex-1 h-full overflow-y-auto p-4 relative">
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

      {/* Mobile Sidebar (Sheet-based, handled in Sidebar component) */}
      <div className="md:hidden">
        <Sidebar categories={categories} plan={plan} />
      </div>

      {/* Floating AI Chat Bubble */}
      <AskAIBubble />
    </>
  );
}

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  categories: Category[];
  plan: string;
}

export function DashboardClientLayout({
  children,
  categories,
  plan,
}: DashboardClientLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShell categories={categories} plan={plan}>
        {children}
      </DashboardShell>
    </SidebarProvider>
  );
}
