"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Bug,
  TrendingDown,
  TrendingUp,
  Calendar,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AntExpensesCardProps {
  weeklyTotal: number;
  lastWeekTotal?: number;
  monthlyTotal?: number;
  currency?: string;
}

function formatCurrency(amount: number, currency: string = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AntExpensesCard({
  weeklyTotal,
  lastWeekTotal = 0,
  monthlyTotal,
  currency = "MXN",
}: AntExpensesCardProps) {
  const t = useTranslations("Dashboard.antExpenses");
  const [view, setView] = useState<"daily" | "yearly">("daily");

  // Calculate metrics
  const dailyAverage = weeklyTotal / 7;
  const yearlyProjection = dailyAverage * 365;

  // Week over week change
  const weekChange =
    lastWeekTotal > 0
      ? ((weeklyTotal - lastWeekTotal) / lastWeekTotal) * 100
      : 0;
  const savedAmount = lastWeekTotal > 0 ? lastWeekTotal - weeklyTotal : 0;

  // Determine if spending is increasing or decreasing
  const isImproving = weekChange < 0;

  return (
    <Card className="bg-white dark:bg-card shadow-sm rounded-xl border-none overflow-hidden">
      {/* Warning accent for high spending */}
      <div
        className={cn(
          "h-1",
          dailyAverage > 150
            ? "bg-red-500"
            : dailyAverage > 80
            ? "bg-amber-500"
            : "bg-emerald-500"
        )}
      />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            {t("title")}
          </CardTitle>
          {/* View Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("daily")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-md",
                view === "daily"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "hover:bg-transparent"
              )}>
              {t("toggle.daily")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("yearly")}
              className={cn(
                "h-7 px-2.5 text-xs rounded-md",
                view === "yearly"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "hover:bg-transparent"
              )}>
              {t("toggle.yearly")}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {view === "daily" ? (
          <>
            {/* Weekly spending */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("thisWeek")}
              </span>
              <span className="text-2xl font-bold tabular-nums">
                {formatCurrency(weeklyTotal, currency)}
              </span>
            </div>

            {/* Daily average */}
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm text-muted-foreground">
                {t("dailyAverage")}
              </span>
              <span className="text-lg font-semibold tabular-nums">
                {formatCurrency(dailyAverage, currency)}/día
              </span>
            </div>

            {/* Week comparison */}
            {lastWeekTotal > 0 && (
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  isImproving ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                {isImproving ? (
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isImproving
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}>
                  {isImproving
                    ? t("saved", {
                        amount: formatCurrency(savedAmount, currency),
                      })
                    : `+${weekChange.toFixed(0)}% vs semana pasada`}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Yearly projection - SHOCK VALUE */}
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("yearlyImpact")}
                </span>
              </div>
              <span className="text-4xl font-bold tabular-nums text-red-500">
                {formatCurrency(yearlyProjection, currency)}
              </span>
            </div>

            {/* Warning message */}
            <div className="bg-red-500/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {t("projection", {
                    amount: formatCurrency(yearlyProjection, currency),
                  })}
                </p>
              </div>
            </div>

            {/* Daily breakdown context */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-muted-foreground">{t("dailyAverage")}</span>
              <span className="font-medium tabular-nums">
                {formatCurrency(dailyAverage, currency)}/día × 365 días
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
