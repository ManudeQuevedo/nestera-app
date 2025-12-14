"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Debt } from "@/types/finance";
import {
  CreditCard,
  AlertCircle,
  TrendingDown,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface DebtSummaryCardProps {
  totalDebt: number;
  debts: Debt[];
}

function getDebtHealthScore(debts: Debt[]): {
  score: "excellent" | "good" | "fair" | "poor";
  labelKey: "excellent" | "good" | "fair" | "poor" | "debtFree";
  color: string;
} {
  if (debts.length === 0) {
    return {
      score: "excellent",
      labelKey: "debtFree",
      color: "text-green-500",
    };
  }

  const hasLate = debts.some((d) => d.status === "late");
  if (hasLate) {
    return { score: "poor", labelKey: "poor", color: "text-red-500" };
  }

  const highInterest = debts.filter(
    (d) => d.interest_rate > 30 && !d.is_msi
  ).length;
  if (highInterest > 2) {
    return { score: "fair", labelKey: "fair", color: "text-amber-500" };
  }

  if (highInterest > 0) {
    return { score: "good", labelKey: "good", color: "text-blue-500" };
  }

  return { score: "excellent", labelKey: "excellent", color: "text-green-500" };
}

function getUpcomingPayments(debts: Debt[]) {
  const today = new Date();
  return debts
    .filter((d) => d.next_payment_due_date)
    .map((d) => {
      const dueDate = new Date(d.next_payment_due_date!);
      const daysUntil = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...d, daysUntil };
    })
    .filter((d) => d.daysUntil >= 0 && d.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);
}

export function DebtSummaryCard({ totalDebt, debts }: DebtSummaryCardProps) {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const health = getDebtHealthScore(debts);
  const upcoming = getUpcomingPayments(debts);
  const HealthIcon =
    health.score === "excellent"
      ? ShieldCheck
      : health.score === "poor"
      ? ShieldAlert
      : Shield;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            {t("debtSummary")}
          </CardTitle>
          <Link href="/debts" className="text-sm text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Debt */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("totalDebt")}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${totalDebt.toLocaleString()}
          </p>
        </div>

        {/* Upcoming Payments */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {t("upcomingPayments")}
          </p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("noUpcomingPayments")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {upcoming.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between text-sm">
                  <span className="truncate max-w-[140px]">{debt.concept}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      debt.daysUntil <= 3 && "border-red-500/50 text-red-600"
                    )}>
                    {debt.daysUntil === 0
                      ? tCommon("today")
                      : debt.daysUntil === 1
                      ? tCommon("tomorrow")
                      : tCommon("days", { count: debt.daysUntil })}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debt Health Score */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{t("debtHealth")}</p>
            <div className="flex items-center gap-1.5">
              <HealthIcon className={cn("w-4 h-4", health.color)} />
              <span className={cn("text-sm font-medium", health.color)}>
                {t(`health.${health.labelKey}`)}
              </span>
            </div>
          </div>
          <Progress
            value={
              health.score === "excellent"
                ? 100
                : health.score === "good"
                ? 75
                : health.score === "fair"
                ? 50
                : 25
            }
            className={cn(
              "h-2",
              health.score === "excellent" && "[&>div]:bg-green-500",
              health.score === "good" && "[&>div]:bg-blue-500",
              health.score === "fair" && "[&>div]:bg-amber-500",
              health.score === "poor" && "[&>div]:bg-red-500"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
