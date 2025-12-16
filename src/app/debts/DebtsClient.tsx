"use client";

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
} from "lucide-react";
import { AddDebtModal } from "@/components/debts/AddDebtModal";
import { useDebtMath, calculatePayoffDate } from "@/hooks/useDebtMath";
import { DebtStrategyCard } from "@/components/debts/DebtStrategyCard";
import { cn } from "@/lib/utils";

interface DebtsClientProps {
  debts: Debt[];
}

const DEBT_ICONS: Record<string, React.ElementType> = {
  credit_card: CreditCard,
  mortgage: Home,
  auto_loan: Car,
  personal_loan: User,
  friend_loan: Users,
};

const DEBT_TYPE_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  auto_loan: "Auto Loan",
  personal_loan: "Personal Loan",
  friend_loan: "Family/Friend Loan",
};

function DebtCard({ debt }: { debt: Debt }) {
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
            Paid Off
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
              {DEBT_TYPE_LABELS[debt.debt_type]}
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
                {progress.toFixed(0)}% paid off
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
              <span>Monthly Payment</span>
            </div>
            <p className="font-semibold">${monthlyPayment.toLocaleString()}</p>
          </div>

          {/* Interest Rate */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Percent className="w-3.5 h-3.5" />
              <span>Rate + Tax</span>
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
                <span>Months Left</span>
              </div>
              <p className="font-semibold">{debt.term_months_remaining}</p>
            </div>
          )}

          {/* Payoff date */}
          {payoffDate && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Payoff Date</span>
              </div>
              <p className="font-semibold">
                {payoffDate.toLocaleDateString("en-US", {
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
              You're paying ${monthlyInterest.toLocaleString()}/mo in interest
              alone
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DebtsClient({ debts }: DebtsClientProps) {
  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const activeDebts = debts.filter((d) => d.status !== "paid_off");

  return (
    <div className="w-full space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Debts</h1>
          <p className="text-muted-foreground">
            Manage and track your financial obligations
          </p>
        </div>
        <AddDebtModal />
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200/50 dark:border-red-900/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">Total Debt</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Debts</p>
              <p className="text-3xl font-bold">{activeDebts.length}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">Next Payment</p>
              <p className="text-xl font-semibold">
                {activeDebts[0]?.next_payment_due_date
                  ? new Date(
                      activeDebts[0].next_payment_due_date
                    ).toLocaleDateString("en-US")
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
            <h3 className="text-lg font-medium">No debts recorded</h3>
            <p className="text-muted-foreground">
              Congratulations if you're debt-free! Or add your obligations to
              start tracking them.
            </p>
            <AddDebtModal
              trigger={<Button variant="outline">Add my first debt</Button>}
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
