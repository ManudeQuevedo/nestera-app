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
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Users,
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
  { translationKey: "dashboard", href: "/", icon: LayoutDashboard },
  { translationKey: "debts", href: "/debts", icon: Wallet },
  {
    translationKey: "transactions",
    href: "/transactions",
    icon: Receipt,
  },
  { translationKey: "insights", href: "/report", icon: FileText },
  {
    translationKey: "antExpenses",
    href: "/ant-expenses",
    icon: Activity,
  },
  {
    translationKey: "budget",
    href: "/budget",
    icon: PieChart,
  },
  { translationKey: "goals", href: "/goals", icon: Target },
  {
    translationKey: "jfkSchool",
    href: "/jfk-school",
    icon: GraduationCap,
  },
];

const bottomNavItems: {
  name: string;
  href: string;
  icon: typeof HelpCircle;
}[] = [];

interface SidebarContentProps {
  pathname: string;
  onLinkClick?: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  pathname,
  onLinkClick,
  collapsed,
  onToggleCollapse,
}: SidebarContentProps) {
  const t = useTranslations("Sidebar");
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-white dark:bg-sidebar text-sidebar-foreground shadow-sm transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}>
        {/* Header - App Title */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-border/30",
            collapsed ? "justify-center px-2 gap-1" : "justify-between px-4"
          )}>
          <div
            className={cn(
              "flex items-center gap-3 font-semibold",
              collapsed && "gap-0"
            )}>
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0">
              <Users className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="text-base font-semibold tracking-tight">
                {t("familyWealth")}
              </span>
            )}
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 text-muted-foreground shrink-0",
                collapsed && "h-7 w-7"
              )}
              onClick={onToggleCollapse}>
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Main Nav */}
        <div className={cn("flex-1 overflow-y-auto space-y-1 px-3")}>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            // Handle locale-prefixed paths for active state
            // e.g. /es/budget should match /budget
            const currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" && currentPath.startsWith(item.href));

            const button = (
              <Link key={item.href} href={item.href} onClick={onLinkClick}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 relative rounded-lg",
                    collapsed
                      ? "justify-center px-0"
                      : "justify-start gap-3 px-3",
                    isActive &&
                      "bg-slate-100 text-slate-900 font-medium dark:bg-white/10 dark:text-white"
                  )}>
                  {/* Active pill indicator */}
                  {/* Icon with badge container */}
                  <span className="relative inline-flex shrink-0">
                    <Icon className="h-4 w-4" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 text-left text-sm">
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
                  <TooltipContent side="right" className="font-medium">
                    {t(item.translationKey)}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </div>

        {/* Bottom Section */}
        <div className={cn("space-y-1", collapsed ? "p-3" : "p-4")}>
          {/* Bottom Nav Items */}
          {bottomNavItems.map((item) => {
            const button = (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 text-muted-foreground hover:text-foreground",
                    collapsed
                      ? "justify-center px-0"
                      : "justify-start gap-3 px-3"
                  )}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </Button>
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}

          {/* Settings - Opens Dialog instead of Link */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <SettingsDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-full h-10 text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {t("settings")}
              </TooltipContent>
            </Tooltip>
          ) : (
            <SettingsDialog />
          )}

          {/* Sign In / Sign Out - Dynamic */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AuthButton collapsed={true} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
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
            className="fixed top-4 left-4 z-40 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-background border-r">
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

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}>
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      </div>
    </>
  );
}
