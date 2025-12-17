"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Home, Receipt, Target, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  isAction?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const locale = useLocale();

  const navItems: NavItem[] = [
    {
      href: `/${locale}/dashboard`,
      icon: <Home className="h-5 w-5" />,
      label: "Inicio",
    },
    {
      href: `/${locale}/dashboard/transactions`,
      icon: <Receipt className="h-5 w-5" />,
      label: "Movimientos",
    },
    {
      href: `/${locale}/dashboard/upload`,
      icon: <Plus className="h-6 w-6" />,
      label: "Subir",
      isAction: true,
    },
    {
      href: `/${locale}/dashboard/goals`,
      icon: <Target className="h-5 w-5" />,
      label: "Metas",
    },
    {
      href: `/${locale}/dashboard/settings`,
      icon: <User className="h-5 w-5" />,
      label: "Perfil",
    },
  ];

  const isActive = (href: string) => {
    if (href.endsWith("/dashboard") && pathname === `/${locale}/dashboard`) {
      return true;
    }
    return pathname.startsWith(href) && !href.endsWith("/dashboard");
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);

          if (item.isAction) {
            // Central action button (Upload)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center -mt-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                  {item.icon}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 rounded-xl transition-colors active:scale-95",
                active
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              )}>
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
