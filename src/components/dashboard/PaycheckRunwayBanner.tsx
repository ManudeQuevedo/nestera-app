"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { RunwayStatus } from "@/hooks/useFinancialRunway";

interface PaycheckRunwayBannerProps {
  daysUntilPayday: number;
  projectedBalance: number;
  status: RunwayStatus;
  currency?: string;
  className?: string;
}

function formatCurrency(amount: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaycheckRunwayBanner({
  daysUntilPayday,
  projectedBalance,
  status,
  currency = "MXN",
  className,
}: PaycheckRunwayBannerProps) {
  const t = useTranslations("Dashboard.compass");

  const statusConfig = {
    safe: {
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/5",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
    },
    warning: {
      icon: TrendingDown,
      bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    danger: {
      icon: AlertTriangle,
      bgColor: "bg-rose-500/10 dark:bg-rose-500/5",
      borderColor: "border-rose-500/20",
      iconColor: "text-rose-500",
      textColor: "text-rose-700 dark:text-rose-400",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        config.bgColor,
        config.borderColor,
        className
      )}>
      <StatusIcon className={cn("h-5 w-5 flex-shrink-0", config.iconColor)} />

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", config.textColor)}>
          {t(`runway.${status}`, { days: daysUntilPayday })}
        </p>

        {status !== "safe" && projectedBalance < 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Déficit proyectado:{" "}
            {formatCurrency(Math.abs(projectedBalance), currency)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{daysUntilPayday}d</span>
      </div>
    </div>
  );
}
