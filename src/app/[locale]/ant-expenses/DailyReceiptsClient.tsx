"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "@/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Receipt,
  TrendingDown,
  PiggyBank,
  Loader2,
  Plus,
  AlertTriangle,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  DailyReceipt,
  ANT_EXPENSE_CATEGORIES,
  AntExpenseCategory,
  Currency,
  CURRENCIES,
  convert,
  formatCurrency,
} from "@/types/daily-receipts";
import { createDailyReceipt } from "@/actions/cash-flow";
import { cn } from "@/lib/utils";

interface DailyReceiptsClientProps {
  todayReceipts: DailyReceipt[];
  monthlyReceipts: DailyReceipt[];
}

import { useTranslations } from "next-intl";

// ... existing code ...

export function DailyReceiptsClient({
  todayReceipts,
  monthlyReceipts,
}: DailyReceiptsClientProps) {
  const t = useTranslations("AntExpenses");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Display currency state - controls how all totals are rendered
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("MXN");

  // Quick Log Form State
  const [amount, setAmount] = useState("");
  const [inputCurrency, setInputCurrency] = useState<Currency>("MXN");
  const [category, setCategory] = useState<AntExpenseCategory>("Coffee");
  const [isNecessary, setIsNecessary] = useState(false);
  const [contextTag, setContextTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ... (useMemo for metrics remains same)
  const metrics = useMemo(() => {
    // Get date context for proper projection
    const now = new Date();
    const daysPassed = now.getDate(); // Current day of month (1-31)
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const isEarlyMonth = daysPassed <= 3;

    // Today's leak - convert each to display currency and sum
    const todaysLeak = todayReceipts.reduce((sum, r) => {
      const receiptCurrency = (r.currency || "MXN") as Currency;
      return sum + convert(r.amount, receiptCurrency, displayCurrency);
    }, 0);

    // Total spent this month - convert each to display currency and sum
    const totalSpentThisMonth = monthlyReceipts.reduce((sum, r) => {
      const receiptCurrency = (r.currency || "MXN") as Currency;
      return sum + convert(r.amount, receiptCurrency, displayCurrency);
    }, 0);

    // Monthly projection using linear extrapolation
    // If early month (day 1-3), don't project - just show current total
    let monthlyProjection: number;
    if (isEarlyMonth || daysPassed === 0) {
      monthlyProjection = totalSpentThisMonth;
    } else {
      const dailyAverage = totalSpentThisMonth / daysPassed;
      monthlyProjection = dailyAverage * daysInMonth;
    }

    // Recoverable savings - sum of unnecessary expenses this month
    const recoverableSavings = monthlyReceipts
      .filter((r) => !r.is_necessary)
      .reduce((sum, r) => {
        const receiptCurrency = (r.currency || "MXN") as Currency;
        return sum + convert(r.amount, receiptCurrency, displayCurrency);
      }, 0);

    return { todaysLeak, monthlyProjection, recoverableSavings, isEarlyMonth };
  }, [todayReceipts, monthlyReceipts, displayCurrency]);

  const handleQuickLog = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createDailyReceipt({
        amount: parseFloat(amount),
        currency: inputCurrency,
        category,
        is_necessary: isNecessary,
        context_tag: contextTag || null,
      });

      if (result.success) {
        // Reset form
        setAmount("");
        setCategory("Coffee");
        setIsNecessary(false);
        setContextTag("");

        // Refresh data
        startTransition(() => {
          router.refresh();
        });
      } else {
        console.error("Error from server action:", result.error);
      }
    } catch (err) {
      console.error("Exception during submission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-4 md:p-8">
        {/* Header with Currency Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <Receipt className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {t("title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Currency Lens Toggle */}
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("viewIn")}</span>
            <Select
              value={displayCurrency}
              onValueChange={(v) => setDisplayCurrency(v as Currency)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Behavioral Impact Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Today's Leak - Red/Danger */}
          <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
                {t("todaysLeak")}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(metrics.todaysLeak, displayCurrency)}
              </div>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                {t("immediateBleed")}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Projection - Orange/Warning (or Blue in early month) */}
          <Card
            className={cn(
              "shadow-sm rounded-2xl overflow-hidden",
              metrics.isEarlyMonth
                ? "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-500/5"
                : "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-500/5"
            )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className={cn(
                  "text-sm font-medium",
                  metrics.isEarlyMonth
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-orange-600 dark:text-orange-400"
                )}>
                {metrics.isEarlyMonth
                  ? t("monthlyTotal")
                  : t("monthlyProjection")}
              </CardTitle>
              {!metrics.isEarlyMonth && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-3xl font-bold",
                  metrics.isEarlyMonth
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-orange-600 dark:text-orange-400"
                )}>
                {formatCurrency(metrics.monthlyProjection, displayCurrency)}
              </div>
              <p
                className={cn(
                  "text-xs mt-1",
                  metrics.isEarlyMonth
                    ? "text-blue-600/70 dark:text-blue-400/70"
                    : "text-orange-600/70 dark:text-orange-400/70"
                )}>
                {metrics.isEarlyMonth
                  ? t("currentMonthSpent")
                  : t("basedOnDailyAverage")}
              </p>
            </CardContent>
          </Card>

          {/* Recoverable Savings - Emerald/Success */}
          <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {t("recoverableSavings")}
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(metrics.recoverableSavings, displayCurrency)}
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                {t("potentialPayoff")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Log Bar */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t("quickLog")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              {/* Amount */}
              <div className="space-y-1.5 flex-shrink-0">
                <Label htmlFor="amount" className="text-xs">
                  {t("amount")}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full md:w-24"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Input Currency */}
              <div className="space-y-1.5 flex-shrink-0">
                <Label className="text-xs">{t("currency")}</Label>
                <Select
                  value={inputCurrency}
                  onValueChange={(v) => setInputCurrency(v as Currency)}>
                  <SelectTrigger className="w-full md:w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-1.5 flex-1 md:flex-initial md:w-36">
                <Label className="text-xs">{t("category")}</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as AntExpenseCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANT_EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>{t(`categories.${cat.value}`)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Segmented Control - Necessary/Avoidable */}
              <div className="space-y-1.5">
                <Label className="text-xs">{t("type")}</Label>
                <div className="flex rounded-lg bg-muted/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setIsNecessary(true)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                      isNecessary
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                        : "text-muted-foreground hover:bg-muted cursor-pointer"
                    )}>
                    {t("necessary")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNecessary(false)}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                      !isNecessary
                        ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                        : "text-muted-foreground hover:bg-muted cursor-pointer"
                    )}>
                    {t("avoidable")}
                  </button>
                </div>
              </div>

              {/* Context */}
              <div className="space-y-1.5 flex-1 md:max-w-[180px]">
                <Label htmlFor="context" className="text-xs">
                  {t("context")}
                </Label>
                <Input
                  id="context"
                  placeholder={t("contextPlaceholder")}
                  value={contextTag}
                  onChange={(e) => setContextTag(e.target.value)}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleQuickLog}
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                className="gap-2 shrink-0">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {t("logReceipt")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List - The Reality Check */}
        <Card className="border-border/50 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {t("todaysReceiptsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReceipts.length > 0 ? (
              <div className="space-y-2">
                {todayReceipts.map((receipt) => {
                  const receiptCurrency = (receipt.currency ||
                    "MXN") as Currency;
                  const showConversion = receiptCurrency !== displayCurrency;
                  const convertedAmount = convert(
                    receipt.amount,
                    receiptCurrency,
                    displayCurrency
                  );

                  return (
                    <div
                      key={receipt.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        receipt.is_necessary
                          ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                          : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                      )}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {ANT_EXPENSE_CATEGORIES.find(
                            (c) => c.value === receipt.category
                          )?.emoji || "💸"}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {t(`categories.${receipt.category}`)}
                          </p>
                          {receipt.context_tag && (
                            <p className="text-xs text-muted-foreground">
                              {receipt.context_tag}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {/* Original amount in bold */}
                        <p
                          className={cn(
                            "font-bold",
                            receipt.is_necessary
                              ? "text-emerald-600"
                              : "text-red-500"
                          )}>
                          {formatCurrency(receipt.amount, receiptCurrency)}
                        </p>
                        {/* Converted amount if different currency */}
                        {showConversion && (
                          <p className="text-xs text-muted-foreground">
                            ≈ {formatCurrency(convertedAmount, displayCurrency)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">{t("noReceipts")}</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  {t("logFirst")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
