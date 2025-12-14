"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PieChart,
  DollarSign,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { Category, Transaction } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

// Map next-intl locale to BCP 47 locale tag
const getDateLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    es: "es-MX",
    en: "en-US",
  };
  return localeMap[locale] || locale;
};

interface BudgetPredictionModalProps {
  trigger: React.ReactNode;
  categories: Category[];
  transactions: Transaction[];
  categorySpending: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
}

export function BudgetPredictionModal({
  trigger,
  categories,
  transactions,
  categorySpending,
  totalBudget,
  totalSpent,
}: BudgetPredictionModalProps) {
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  // Calculate predictions
  const prediction = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    // Predicted spend = (Current Spend / Days Passed) * Total Days
    const dailyRate = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const predictedSpend = dailyRate * daysInMonth;
    const overBudgetAmount = predictedSpend - totalBudget;

    // Categorize spending
    const expenseCategories = categories.filter((c) => c.type === "expense");

    // Fixed vs Variable (simplified: subscriptions are fixed, rest are variable)
    let fixedTotal = 0;
    let variableTotal = 0;

    expenseCategories.forEach((cat) => {
      const spent = categorySpending[cat.id] || 0;
      const name = cat.name.toLowerCase();
      if (
        name.includes("subscription") ||
        name.includes("netflix") ||
        name.includes("utilities") ||
        name.includes("rent") ||
        name.includes("mortgage") ||
        name.includes("internet")
      ) {
        fixedTotal += spent;
      } else {
        variableTotal += spent;
      }
    });

    // Find uncategorized/outlier transactions
    const uncategorizedTx = transactions.filter(
      (t) => !t.category_id && t.type === "expense"
    );

    // Find outliers (transactions > 2x average)
    const expenseTx = transactions.filter((t) => t.type === "expense");
    const avgExpense =
      expenseTx.length > 0
        ? expenseTx.reduce((sum, t) => sum + t.amount, 0) / expenseTx.length
        : 0;
    const outliers = expenseTx.filter((t) => t.amount > avgExpense * 2);

    return {
      dayOfMonth,
      daysInMonth,
      daysRemaining,
      dailyRate,
      predictedSpend,
      overBudgetAmount,
      isOverBudget: predictedSpend > totalBudget,
      fixedTotal,
      variableTotal,
      uncategorizedTx,
      outliers,
      percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      predictedPercent:
        totalBudget > 0 ? (predictedSpend / totalBudget) * 100 : 0,
    };
  }, [categories, transactions, categorySpending, totalBudget, totalSpent]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-purple-500" />
            Month-End Forecast
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Insight - The Brain */}
          <div
            className={cn(
              "p-5 rounded-xl",
              prediction.isOverBudget
                ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                : "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
            )}>
            <div className="flex items-center gap-2 mb-3">
              {prediction.isOverBudget ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-500" />
              )}
              <span className="font-medium text-sm">
                {prediction.isOverBudget ? "Overspending Alert" : "On Track"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold tracking-tight">
                ${Math.round(prediction.predictedSpend).toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">
                predicted spend
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              vs Budget:{" "}
              <span className="font-medium text-foreground">
                ${totalBudget.toLocaleString()}
              </span>
            </p>

            {prediction.isOverBudget && (
              <div className="flex items-center gap-2 mt-3 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  You're on track to overspend by $
                  {Math.round(prediction.overBudgetAmount).toLocaleString()}
                </span>
              </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Based on ${Math.round(prediction.dailyRate).toLocaleString()}/day
              average over {prediction.dayOfMonth} days
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Progress</span>
              <span className="font-medium">
                {prediction.percentUsed.toFixed(0)}% used
              </span>
            </div>
            <Progress
              value={Math.min(prediction.percentUsed, 100)}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${totalSpent.toLocaleString()} spent</span>
              <span>
                ${Math.max(0, totalBudget - totalSpent).toLocaleString()}{" "}
                remaining
              </span>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Expense Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Fixed Expenses
                </p>
                <p className="text-xl font-bold">
                  ${prediction.fixedTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rent, Utilities, Subscriptions
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Variable Expenses
                </p>
                <p className="text-xl font-bold">
                  ${prediction.variableTotal.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Groceries, Dining, Shopping
                </p>
              </div>
            </div>
          </div>

          {/* Unexpected Expenses */}
          {(prediction.uncategorizedTx.length > 0 ||
            prediction.outliers.length > 0) && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-yellow-500" />
                Unexpected Expenses
              </h4>
              <div className="space-y-2">
                {prediction.uncategorizedTx.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <p className="text-sm font-medium">
                        {tx.description || "Uncategorized"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString(dateLocale)}
                      </p>
                    </div>
                    <span className="font-semibold text-yellow-600">
                      ${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {prediction.outliers.slice(0, 3).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div>
                      <p className="text-sm font-medium">
                        {tx.establishment || tx.description || "Large expense"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unusually high amount
                      </p>
                    </div>
                    <span className="font-semibold text-orange-600">
                      ${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {prediction.uncategorizedTx.length === 0 &&
                  prediction.outliers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No unusual expenses detected
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Days Remaining */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily Safe Spend</p>
              <p className="text-xs text-muted-foreground">
                For the next {prediction.daysRemaining} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                $
                {prediction.daysRemaining > 0
                  ? Math.max(
                      0,
                      Math.round(
                        (totalBudget - totalSpent) / prediction.daysRemaining
                      )
                    ).toLocaleString()
                  : "0"}
              </p>
              <p className="text-xs text-muted-foreground">/day</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
