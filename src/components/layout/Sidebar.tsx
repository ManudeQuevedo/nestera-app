"use client";

import { Link } from "@/navigation";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { canAccess } from "@/lib/permissions";
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
  Lock,
  CalendarDays,
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
import { useSidebar } from "@/components/layout/SidebarContext";
import { SidebarFamilyGreeting } from "@/components/layout/sidebar/SidebarFamilyGreeting";

interface SidebarProps {
  categories: Category[];
  plan: string;
  appSettings?: {
    sidebar_labels?: Record<string, string>;
    enabled_modules?: string[];
  };
}

interface NavItem {
  id: string; // Stable ID for DB lookups
  translationKey:
    | "dashboard"
    | "debts"
    | "transactions"
    | "insights"
    | "antExpenses"
    | "budget"
    | "goals"
    | "jfkSchool"
    | "mealPlanner";
  href: string;
  icon: React.ElementType;
  badge?: number;
  requiredFeature?: string;
}

const mainNavItems: NavItem[] = [
  {
    id: "dashboard",
    translationKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  { id: "debts", translationKey: "debts", href: "/debts", icon: Wallet },
  {
    id: "transactions",
    translationKey: "transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    id: "insights",
    translationKey: "insights",
    href: "/report",
    icon: FileText,
  },
  {
    id: "antExpenses",
    translationKey: "antExpenses",
    href: "/ant-expenses",
    icon: Activity,
  },
  { id: "budget", translationKey: "budget", href: "/budget", icon: PieChart },
  { id: "goals", translationKey: "goals", href: "/goals", icon: Target },
  {
    id: "school_payments",
    translationKey: "jfkSchool",
    href: "/jfk-school",
    icon: GraduationCap,
    requiredFeature: "school_expenses", // Will be checked against has_school_expenses
  },
  // Events - Financial Calendar
  {
    id: "events",
    translationKey: "events" as any,
    href: "/events",
    icon: CalendarDays,
  },
  // Meal Planner - Premium Feature Demo
  {
    id: "mealPlanner",
    translationKey: "mealPlanner" as any,
    href: "/planning",
    icon: Menu,
    requiredFeature: "meal_planner",
  },
];

interface SidebarContentProps {
  pathname: string;
  onLinkClick?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  plan: string;
  appSettings?: {
    sidebar_labels?: Record<string, string>;
    enabled_modules?: string[];
  };
}

function SidebarContent({
  pathname,
  onLinkClick,
  collapsed,
  onToggleCollapse,
  plan,
  appSettings,
}: SidebarContentProps) {
  const t = useTranslations("Sidebar");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { isSettingsOpen, setIsSettingsOpen } = useSidebar();

  const labels = appSettings?.sidebar_labels || {};
  const enabledModules = appSettings?.enabled_modules || null; // If null, show all (allow default)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300",
          // Capsule styling
          "rounded-3xl",
          // Light mode
          "bg-white",
          // Dark mode: Glass panel
          "dark:bg-[#0B1121]/80 dark:backdrop-blur-xl",
          // Subtle edge
          "border border-slate-200/50 dark:border-white/5",
          // Shadow for separation
          "shadow-sm dark:shadow-2xl",
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

        {/* Family Greeting Identity Card */}
        <div className={cn("px-2 pt-3", collapsed && "px-1")}>
          <SidebarFamilyGreeting
            familyName={null}
            firstName={null}
            email={null}
            avatarUrl={null}
            collapsed={collapsed}
          />
        </div>

        {/* Main Nav */}
        <div
          className={cn(
            "flex-1 overflow-y-auto py-3",
            collapsed ? "px-2" : "px-2"
          )}>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              // 1. Check Visibility (if enabled_modules is present)
              if (enabledModules && !enabledModules.includes(item.id)) {
                return null;
              }

              const Icon = item.icon;
              const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));

              const hasAccess = item.requiredFeature
                ? canAccess(item.requiredFeature, plan)
                : true;

              // 2. Resolve Label (Custom > Translation)
              const label =
                labels[item.id] ||
                (item.translationKey === "mealPlanner"
                  ? "Meal Planner"
                  : t(item.translationKey));

              // LOCKED STATE
              if (!hasAccess) {
                const lockedItem = (
                  <div
                    key={item.href}
                    onClick={() => {
                      alert("Upgrade required for " + label);
                      // setUpgradeModalOpen(true);
                    }}
                    className={cn(
                      "group flex items-center h-9 relative rounded-lg transition-all duration-200 cursor-pointer overflow-hidden",
                      "text-slate-400 dark:text-slate-600 opacity-70 hover:bg-slate-50 dark:hover:bg-white/5",
                      collapsed
                        ? "justify-center px-0"
                        : "justify-start gap-3 px-3"
                    )}>
                    <Icon
                      className={cn(
                        "flex-shrink-0",
                        collapsed ? "h-6 w-6" : "h-4 w-4"
                      )}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate text-left text-[13px] font-medium tracking-tight">
                        {label}
                      </span>
                    )}
                    {!collapsed && (
                      <Lock className="h-3 w-3 text-slate-300 dark:text-slate-700 ml-2" />
                    )}
                  </div>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{lockedItem}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="font-medium text-xs bg-slate-900 text-white border-slate-800 dark:glass-tooltip dark:border-white/10">
                        {label}{" "}
                        <span className="ml-1 opacity-50">(Locked)</span>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return lockedItem;
              }

              // UNLOCKED STATE
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
                        {label}
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
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </nav>
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

export function Sidebar({ categories, plan, appSettings }: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } =
    useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <SidebarContent
          pathname={pathname}
          collapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          plan={plan}
          appSettings={appSettings}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 border-none bg-transparent w-[300px]">
          <SidebarContent
            pathname={pathname}
            onLinkClick={() => setIsMobileOpen(false)}
            collapsed={false}
            plan={plan}
            appSettings={appSettings}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
