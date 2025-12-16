"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuincenaProgressProps {
  budgetForQuincena: number;
  spentThisQuincena: number;
  currency?: string;
}

// Calculate Quincena cycle (1st-15th or 16th-end of month)
function getQuincenaCycle(date: Date = new Date()) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  if (day <= 15) {
    // First quincena (1st-15th)
    return {
      currentDay: day,
      totalDays: 15,
      startDate: new Date(year, month, 1),
      endDate: new Date(year, month, 15),
      quincenaNumber: 1,
    };
  } else {
    // Second quincena (16th-end of month)
    const daysInSecondQuincena = lastDayOfMonth - 15;
    return {
      currentDay: day - 15,
      totalDays: daysInSecondQuincena,
      startDate: new Date(year, month, 16),
      endDate: new Date(year, month, lastDayOfMonth),
      quincenaNumber: 2,
    };
  }
}

function formatCurrency(amount: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuincenaProgress({
  budgetForQuincena,
  spentThisQuincena,
  currency = "MXN",
}: QuincenaProgressProps) {
  const t = useTranslations("Dashboard");

  const cycle = useMemo(() => getQuincenaCycle(), []);

  const safeToSpend = budgetForQuincena - spentThisQuincena;
  const spentPercent =
    budgetForQuincena > 0
      ? Math.min(100, (spentThisQuincena / budgetForQuincena) * 100)
      : 0;
  const dayPercent = (cycle.currentDay / cycle.totalDays) * 100;

  // Determine status based on spending vs time elapsed
  const status = useMemo(() => {
    if (spentPercent <= dayPercent) {
      return "onTrack"; // Spent less than expected for this point in time
    } else if (spentPercent <= dayPercent + 20) {
      return "warning"; // Slightly over, be careful
    } else {
      return "danger"; // Significantly over budget pace
    }
  }, [spentPercent, dayPercent]);

  const statusConfig = {
    onTrack: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      barColor: "bg-emerald-500",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      barColor: "bg-amber-500",
    },
    danger: {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      barColor: "bg-red-500",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Days remaining
  const daysRemaining = cycle.totalDays - cycle.currentDay;

  // Daily budget remaining
  const dailyBudget = daysRemaining > 0 ? safeToSpend / daysRemaining : 0;

  return (
    <Card className="bg-white dark:bg-card shadow-sm rounded-xl border-none overflow-hidden">
      {/* Top accent bar */}
      <div className={cn("h-1", config.barColor)} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {t("quincena.title")}
          </CardTitle>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              config.bgColor,
              config.color
            )}>
            <StatusIcon className="h-3.5 w-3.5" />
            {t(`quincena.status.${status}`)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Day counter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("quincena.day", {
              current: cycle.currentDay,
              total: cycle.totalDays,
            })}
          </span>
          <span className="text-muted-foreground">
            {t("quincena.daysRemaining", { count: daysRemaining })}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={spentPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {spentPercent.toFixed(0)}% {t("quincena.spent")}
            </span>
            <span>
              {(100 - spentPercent).toFixed(0)}% {t("quincena.available")}
            </span>
          </div>
        </div>

        {/* Safe to spend */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("quincena.safeToSpend")}
            </span>
            <span
              className={cn(
                "text-xl font-bold tabular-nums",
                safeToSpend < 0
                  ? "text-red-500"
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
              {formatCurrency(Math.max(0, safeToSpend), currency)}
            </span>
          </div>

          {/* Daily budget hint */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {t("quincena.dailyBudget", {
              amount: formatCurrency(dailyBudget, currency),
            })}
          </div>
        </div>

        {/* Contextual message */}
        <div className={cn("p-3 rounded-lg text-sm", config.bgColor)}>
          <p className={cn("font-medium", config.color)}>
            {t(`quincena.insight.${status}`, {
              percent: (100 - spentPercent).toFixed(0),
              days: daysRemaining,
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
