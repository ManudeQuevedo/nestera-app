"use client";

import { Link, usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  FileText,
  Activity,
  PieChart,
  Target,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Category } from "@/types/finance";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { AuthButton } from "@/components/auth/AuthButton";

interface SidebarProps {
  categories: Category[];
}

interface NavItem {
  translationKey:
    | "dashboard"
    | "debts"
    | "transactions"
    | "insights"
    | "antExpenses"
    | "budget"
    | "goals"
    | "jfkSchool";
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { translationKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { translationKey: "debts", href: "/debts", icon: Wallet },
  { translationKey: "transactions", href: "/transactions", icon: Receipt },
  { translationKey: "insights", href: "/report", icon: FileText },
  { translationKey: "antExpenses", href: "/ant-expenses", icon: Activity },
  { translationKey: "budget", href: "/budget", icon: PieChart },
  { translationKey: "goals", href: "/goals", icon: Target },
  { translationKey: "jfkSchool", href: "/jfk-school", icon: GraduationCap },
];

interface SidebarContentProps {
  pathname: string;
  onLinkClick?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  isFloating?: boolean;
}

function SidebarContent({
  pathname,
  onLinkClick,
  collapsed,
  onToggleCollapse,
  isFloating = false,
}: SidebarContentProps) {
  const t = useTranslations("Sidebar");

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300",
          // Light mode
          "bg-white dark:bg-transparent",
          // Dark mode: Glass panel
          "dark:glass-panel",
          // Width
          collapsed ? "w-[72px]" : "w-60"
        )}>
        {/* Header */}
        <div
          className={cn(
            "h-14 flex items-center border-b border-slate-200/50 dark:border-white/5",
            collapsed ? "justify-center px-2" : "justify-between px-4"
          )}>
          <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
            {/* Logo */}
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
              N
            </div>
            {!collapsed && (
              <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Nestera
              </span>
            )}
          </div>
          {onToggleCollapse && !collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              onClick={onToggleCollapse}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {onToggleCollapse && collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-white absolute -right-3 top-4 bg-white dark:bg-slate-900 rounded-full shadow-md border border-slate-200 dark:border-white/10"
              onClick={onToggleCollapse}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Main Nav */}
        <div
          className={cn(
            "flex-1 overflow-y-auto py-3",
            collapsed ? "px-2" : "px-2"
          )}>
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));

              const button = (
                <Link key={item.href} href={item.href} onClick={onLinkClick}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-9 relative rounded-lg transition-all duration-200",
                      "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80",
                      "dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5",
                      collapsed
                        ? "justify-center px-0"
                        : "justify-start gap-3 px-3",
                      isActive &&
                        "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                    )}>
                    {/* Glow Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden dark:block glow-indicator" />
                    )}

                    <span className="relative inline-flex shrink-0">
                      <Icon className="h-4 w-4" />
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <span className="flex-1 text-left text-[13px] font-medium tracking-tight">
                        {t(item.translationKey)}
                      </span>
                    )}
                  </Button>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="font-medium text-xs bg-slate-900 text-white border-slate-800 dark:glass-tooltip dark:border-white/10">
                      {t(item.translationKey)}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={cn(
            "space-y-1 border-t border-slate-200/50 dark:border-white/5",
            collapsed ? "p-2" : "p-2"
          )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SettingsDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-9 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                        <Settings className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-medium text-xs bg-slate-900 text-white border-slate-800 dark:glass-tooltip dark:border-white/10">
                {t("settings")}
              </TooltipContent>
            </Tooltip>
          ) : (
            <SettingsDialog />
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AuthButton collapsed={true} />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-medium text-xs bg-slate-900 text-white border-slate-800 dark:glass-tooltip dark:border-white/10">
                {t("signOut")}
              </TooltipContent>
            </Tooltip>
          ) : (
            <AuthButton collapsed={false} />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-lg">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-60 bg-white dark:bg-slate-900/95 dark:backdrop-blur-2xl border-r border-slate-200 dark:border-white/5">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent
            pathname={pathname}
            collapsed={false}
            onLinkClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Floating */}
      <div
        className={cn(
          "hidden md:block fixed z-30 transition-all duration-300",
          // Floating: margins on all sides except right
          "top-4 bottom-4 left-4",
          collapsed ? "w-[72px]" : "w-60"
        )}>
        <div className="h-full">
          <SidebarContent
            pathname={pathname}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            isFloating={true}
          />
        </div>
      </div>
    </>
  );
}
