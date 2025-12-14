"use client";

import { useMemo } from "react";
import { Debt } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Home,
  Car,
  User,
  Users,
  TrendingDown,
  Calendar,
  Percent,
  AlertTriangle,
  Sparkles,
  Flame,
  Snowflake,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Brain,
} from "lucide-react";
import { AddDebtModal } from "@/components/debts/AddDebtModal";
import { useDebtMath, calculatePayoffDate } from "@/hooks/useDebtMath";
import { cn } from "@/lib/utils";

interface DebtsClientProps {
  debts: Debt[];
}

import { useTranslations, useLocale } from "next-intl";

// Map next-intl locale to BCP 47 locale tag
const getDateLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    es: "es-MX",
    en: "en-US",
  };
  return localeMap[locale] || locale;
};

// ... existing code ...

const DEBT_ICONS: Record<string, React.ElementType> = {
  credit_card: CreditCard,
  mortgage: Home,
  auto_loan: Car,
  personal_loan: User,
  friend_loan: Users,
};

// Removed static DEBT_TYPE_LABELS in favor of translations

// === AI STRATEGY CARD (inlined to avoid module resolution issues) ===

interface StrategyItem {
  type: "priority" | "freeze" | "tip" | "warning";
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string;
}

function calculateEffectiveAPR(rate: number, ivaRate: number): number {
  return Math.round(rate * (1 + ivaRate / 100) * 100) / 100;
}

function DebtStrategyCard({ debts }: { debts: Debt[] }) {
  const t = useTranslations("Debts");

  const strategies = useMemo(() => {
    const items: StrategyItem[] = [];
    const activeDebts = debts.filter((d) => d.status !== "paid_off");

    if (activeDebts.length === 0) {
      return [
        {
          type: "tip" as const,
          icon: TrendingUp,
          title: t("debtFree"),
          description: t("investAdvice"),
        },
      ];
    }

    // Late payments
    const lateDebts = activeDebts.filter((d) => d.status === "late");
    lateDebts.forEach((debt) => {
      items.push({
        type: "warning",
        icon: AlertCircle,
        title: t("urgentLate", { concept: debt.concept }),
        description: t("lateRisk"),
        value: `$${debt.balance.toLocaleString()}`,
      });
    });

    // MSI debts
    const msiDebts = activeDebts.filter((d) => d.is_msi);
    msiDebts.forEach((debt) => {
      items.push({
        type: "freeze",
        icon: Snowflake,
        title: t("freezeTitle", { concept: debt.concept }),
        description: t("freezeAdvice"),
        value: `${debt.term_months_remaining || "?"} ${t("monthsLeft")}`,
      });
    });

    // Prioritize by highest effective APR
    const nonMsiDebts = activeDebts
      .filter((d) => !d.is_msi && d.status !== "late")
      .map((debt) => ({
        debt,
        effectiveAPR: calculateEffectiveAPR(debt.interest_rate, debt.iva_rate),
      }))
      .sort((a, b) => b.effectiveAPR - a.effectiveAPR);

    if (nonMsiDebts.length > 0) {
      const top = nonMsiDebts[0];
      items.push({
        type: "priority",
        icon: Flame,
        title: t("priorityTitle", { number: 1, concept: top.debt.concept }),
        description: t("priorityDesc1", {
          rate: top.effectiveAPR,
          interest: top.debt.interest_rate,
          tax: top.debt.iva_rate,
        }),
        value: `$${top.debt.balance.toLocaleString()}`,
      });

      if (nonMsiDebts.length > 1) {
        const second = nonMsiDebts[1];
        items.push({
          type: "priority",
          icon: Flame,
          title: t("priorityTitle", {
            number: 2,
            concept: second.debt.concept,
          }),
          description: t("priorityDesc2", { rate: second.effectiveAPR }),
          value: `$${second.debt.balance.toLocaleString()}`,
        });
      }
    }

    // Mortgage tip
    const mortgage = activeDebts.find(
      (d) => d.debt_type === "mortgage" && !d.is_msi
    );
    if (
      mortgage &&
      mortgage.term_months_remaining &&
      mortgage.term_months_remaining > 60
    ) {
      items.push({
        type: "tip",
        icon: Lightbulb,
        title: t("mortgageTipTitle"),
        description: t("mortgageTipDesc"),
      });
    }

    // High-interest credit card tip
    const highInterestCC = activeDebts.find(
      (d) => d.debt_type === "credit_card" && d.interest_rate > 30 && !d.is_msi
    );
    if (highInterestCC) {
      items.push({
        type: "tip",
        icon: Lightbulb,
        title: t("transferTitle"),
        description: t("transferDesc"),
      });
    }

    return items;
  }, [debts, t]);

  if (strategies.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {t("aiPayoffStrategy")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {strategies.map((item: StrategyItem, index: number) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg",
              item.type === "priority" && "bg-red-50 dark:bg-red-950/30",
              item.type === "freeze" && "bg-blue-50 dark:bg-blue-950/30",
              item.type === "tip" && "bg-green-50 dark:bg-green-950/30",
              item.type === "warning" && "bg-amber-50 dark:bg-amber-950/30"
            )}>
            <div
              className={cn(
                "p-1.5 rounded-lg flex-shrink-0",
                item.type === "priority" && "bg-red-100 dark:bg-red-900/50",
                item.type === "freeze" && "bg-blue-100 dark:bg-blue-900/50",
                item.type === "tip" && "bg-green-100 dark:bg-green-900/50",
                item.type === "warning" && "bg-amber-100 dark:bg-amber-900/50"
              )}>
              <item.icon
                className={cn(
                  "w-4 h-4",
                  item.type === "priority" && "text-red-600 dark:text-red-400",
                  item.type === "freeze" && "text-blue-600 dark:text-blue-400",
                  item.type === "tip" && "text-green-600 dark:text-green-400",
                  item.type === "warning" &&
                    "text-amber-600 dark:text-amber-400"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{item.title}</p>
                {item.value && (
                  <Badge variant="secondary" className="text-xs">
                    {item.value}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DebtCard({ debt }: { debt: Debt }) {
  const t = useTranslations("Debts");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);
  const { monthlyPayment, monthlyInterest, totalCost, health } =
    useDebtMath(debt);
  const Icon = DEBT_ICONS[debt.debt_type] || CreditCard;

  // Calculate progress (how much paid off)
  const progress = debt.original_amount
    ? ((debt.original_amount - debt.balance) / debt.original_amount) * 100
    : 0;

  const payoffDate = debt.term_months_remaining
    ? calculatePayoffDate(debt.term_months_remaining)
    : null;

  // Debt type label logic
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "credit_card":
        return t("creditCard");
      case "mortgage":
        return t("mortgage");
      case "auto_loan":
        return t("autoLoan");
      case "personal_loan":
        return t("personalLoan");
      case "friend_loan":
        return t("friendLoan");
      default:
        return type;
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-lg",
        health === "critical" && "border-red-500/50",
        health === "warning" && "border-amber-500/50",
        debt.status === "paid_off" && "opacity-60"
      )}>
      {/* Status indicator */}
      {debt.status === "paid_off" && (
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {t("paidOff")}
          </Badge>
        </div>
      )}

      {/* MSI Badge */}
      {debt.is_msi && (
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Sparkles className="w-3 h-3 mr-1" />
            0% APR
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "p-2.5 rounded-xl",
              debt.debt_type === "mortgage"
                ? "bg-purple-100 dark:bg-purple-900/30"
                : debt.debt_type === "auto_loan"
                ? "bg-blue-100 dark:bg-blue-900/30"
                : debt.debt_type === "credit_card"
                ? "bg-orange-100 dark:bg-orange-900/30"
                : "bg-gray-100 dark:bg-gray-800"
            )}>
            <Icon
              className={cn(
                "w-5 h-5",
                debt.debt_type === "mortgage"
                  ? "text-purple-600 dark:text-purple-400"
                  : debt.debt_type === "auto_loan"
                  ? "text-blue-600 dark:text-blue-400"
                  : debt.debt_type === "credit_card"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {debt.concept}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {getTypeLabel(debt.debt_type)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">
              ${debt.balance.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {debt.currency_code}
            </span>
          </div>

          {/* Progress bar */}
          {debt.original_amount && debt.original_amount > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                {progress.toFixed(0)}% {t("paidOff").toLowerCase()}
              </p>
            </div>
          )}
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Monthly Payment */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t("monthlyPayment")}</span>
            </div>
            <p className="font-semibold">${monthlyPayment.toLocaleString()}</p>
          </div>

          {/* Interest Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Percent className="w-3.5 h-3.5" />
              <span>{t("rateAndTax")}</span>
            </div>
            <p className="font-semibold">
              {debt.interest_rate}% + {debt.iva_rate}%
            </p>
          </div>

          {/* Months remaining */}
          {debt.term_months_remaining && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("monthsLeft")}</span>
              </div>
              <p className="font-semibold">{debt.term_months_remaining}</p>
            </div>
          )}

          {/* Payoff date */}
          {payoffDate && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t("payoffDate")}</span>
              </div>
              <p className="font-semibold">
                {payoffDate.toLocaleDateString(dateLocale, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Interest warning for high-interest debt */}
        {monthlyInterest > 500 && !debt.is_msi && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {t("interestWarning", {
                amount: monthlyInterest.toLocaleString(),
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DebtsClient({ debts }: DebtsClientProps) {
  const t = useTranslations("Debts");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const activeDebts = debts.filter((d) => d.status !== "paid_off");

  return (
    <div className="w-full space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-900/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">{t("totalDebt")}</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("activeDebts")}
              </p>
              <p className="text-3xl font-bold">{activeDebts.length}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                {t("nextPayment")}
              </p>
              <p className="text-xl font-semibold">
                {activeDebts[0]?.next_payment_due_date
                  ? new Date(
                      activeDebts[0].next_payment_due_date
                    ).toLocaleDateString(dateLocale)
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Strategy Card */}
      {debts.length > 0 && <DebtStrategyCard debts={debts} />}

      {/* Debts Grid */}
      {debts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{t("noDebts")}</h3>
            <p className="text-muted-foreground">{t("congratulations")}</p>
            <AddDebtModal
              trigger={<Button variant="outline">{t("addFirstDebt")}</Button>}
            />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} />
          ))}
        </div>
      )}
    </div>
  );
}
