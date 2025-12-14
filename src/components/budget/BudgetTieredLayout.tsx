"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Film,
  Baby,
  ShoppingBag,
  CreditCard,
  Shield,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Category, Transaction } from "@/types/finance";
import { CategoryDetailSheet, CategoryTier } from "./CategoryDetailSheet";
import { cn } from "@/lib/utils";

interface BudgetTieredLayoutProps {
  categories: Category[];
  transactions: Transaction[];
  categorySpending: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ElementType> = {
  housing: Home,
  rent: Home,
  mortgage: Home,
  groceries: ShoppingCart,
  food: Utensils,
  dining: Utensils,
  restaurants: Utensils,
  transportation: Car,
  transport: Car,
  utilities: Zap,
  electricity: Zap,
  entertainment: Film,
  shopping: ShoppingBag,
  kids: Baby,
  school: Baby,
  debt: CreditCard,
  emergency: Shield,
  default: Sparkles,
};

// Determine tier for category
function getCategoryTier(name: string): CategoryTier {
  const lowerName = name.toLowerCase();

  // Essentials
  if (
    lowerName.includes("housing") ||
    lowerName.includes("rent") ||
    lowerName.includes("mortgage") ||
    lowerName.includes("groceries")
  ) {
    return "essentials";
  }

  // Subscriptions (typically fixed/small recurring)
  if (
    lowerName.includes("subscription") ||
    lowerName.includes("netflix") ||
    lowerName.includes("spotify") ||
    lowerName.includes("gym") ||
    lowerName.includes("internet") ||
    lowerName.includes("phone")
  ) {
    return "subscriptions";
  }

  // Everything else is lifestyle
  return "lifestyle";
}

function getCategoryIcon(categoryName: string): React.ElementType {
  const name = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.includes(key)) return icon;
  }
  return categoryIcons.default;
}

function getStatusColor(percent: number) {
  if (percent >= 100) return { bg: "bg-red-500", text: "text-red-500" };
  if (percent >= 75) return { bg: "bg-yellow-500", text: "text-yellow-500" };
  return { bg: "bg-green-500", text: "text-green-500" };
}

export function BudgetTieredLayout({
  categories,
  transactions,
  categorySpending,
  totalBudget,
  totalSpent,
}: BudgetTieredLayoutProps) {
  // Track tier overrides from user
  const [tierOverrides, setTierOverrides] = useState<
    Record<string, CategoryTier>
  >({});

  const handleTierChange = (categoryId: string, newTier: CategoryTier) => {
    setTierOverrides((prev) => ({ ...prev, [categoryId]: newTier }));
  };

  // Filter expense categories and sort into tiers
  const { essentials, lifestyle, subscriptions } = useMemo(() => {
    const expenseCategories = categories.filter((c) => c.type === "expense");

    const essentials: Category[] = [];
    const lifestyle: Category[] = [];
    const subscriptions: Category[] = [];

    expenseCategories.forEach((cat) => {
      const tier = tierOverrides[cat.id] || getCategoryTier(cat.name);
      if (tier === "essentials") essentials.push(cat);
      else if (tier === "subscriptions") subscriptions.push(cat);
      else lifestyle.push(cat);
    });

    return { essentials, lifestyle, subscriptions };
  }, [categories, tierOverrides]);

  // Get transactions for a category
  const getTransactionsForCategory = (categoryId: string) =>
    transactions.filter((t) => t.category_id === categoryId);

  // Get last 3 transactions for a category
  const getRecentTransactions = (categoryId: string) =>
    getTransactionsForCategory(categoryId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

  // Calculate days left in month
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const daysLeft = daysInMonth - today.getDate();

  const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-900 dark:to-zinc-800 border-border/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Total Monthly Budget
            </h2>
            <span className="text-sm text-zinc-400">
              {daysLeft} days remaining
            </span>
          </div>

          {/* Large Progress Bar */}
          <div className="relative h-4 bg-zinc-700 rounded-full overflow-hidden mb-4">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                totalPercent >= 100
                  ? "bg-red-500"
                  : totalPercent >= 75
                  ? "bg-yellow-500"
                  : "bg-gradient-to-r from-green-400 to-emerald-500"
              )}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-zinc-400">Spent: </span>
              <span className="text-white font-semibold text-lg">
                ${totalSpent.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400">Remaining: </span>
              <span
                className={cn(
                  "font-semibold text-lg",
                  totalRemaining < 0 ? "text-red-400" : "text-green-400"
                )}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-sm text-zinc-400 mt-3">
            You have spent{" "}
            <span className="text-white font-medium">
              {totalPercent.toFixed(0)}%
            </span>{" "}
            of your total budget
            {totalPercent < 100
              ? ` with ${daysLeft} days left this month.`
              : " — you're over budget!"}
          </p>
        </CardContent>
      </Card>

      {/* Tier 1: Essentials */}
      {essentials.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Essentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {essentials.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const spent = categorySpending[category.id] || 0;
              const remaining = Math.max(0, category.budget_limit - spent);
              const percent =
                category.budget_limit > 0
                  ? (spent / category.budget_limit) * 100
                  : 0;
              const status = getStatusColor(percent);
              const recentTx = getRecentTransactions(category.id);

              return (
                <CategoryDetailSheet
                  key={category.id}
                  category={category}
                  spent={spent}
                  transactions={getTransactionsForCategory(category.id)}
                  currentTier="essentials"
                  onTierChange={handleTierChange}
                  trigger={
                    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              percent >= 100
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : percent >= 75
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            )}>
                            {percent >= 100
                              ? "Over"
                              : percent >= 75
                              ? "Warning"
                              : "On Track"}
                          </div>
                        </div>

                        <h4 className="font-semibold text-lg mb-1">
                          {category.name}
                        </h4>

                        {/* Budget Display */}
                        <div className="space-y-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight">
                              ${remaining.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              left of ${category.budget_limit.toLocaleString()}
                            </span>
                          </div>

                          <Progress
                            value={Math.min(percent, 100)}
                            className="h-2"
                          />

                          <p className="text-sm text-muted-foreground">
                            ${spent.toLocaleString()} spent (
                            {percent.toFixed(0)}
                            %)
                          </p>
                        </div>

                        {/* Recent Transactions */}
                        {recentTx.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Recent
                            </p>
                            <div className="space-y-2">
                              {recentTx.map((tx) => (
                                <div
                                  key={tx.id}
                                  className="flex items-center justify-between text-sm">
                                  <span className="truncate text-foreground">
                                    {tx.establishment ||
                                      tx.description ||
                                      "Transaction"}
                                  </span>
                                  <span className="text-muted-foreground ml-2 shrink-0">
                                    -${tx.amount.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Tier 2: Lifestyle */}
      {lifestyle.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Lifestyle & Variable
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lifestyle.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const spent = categorySpending[category.id] || 0;
              const remaining = Math.max(0, category.budget_limit - spent);
              const percent =
                category.budget_limit > 0
                  ? (spent / category.budget_limit) * 100
                  : 0;
              const status = getStatusColor(percent);

              return (
                <CategoryDetailSheet
                  key={category.id}
                  category={category}
                  spent={spent}
                  transactions={getTransactionsForCategory(category.id)}
                  currentTier="lifestyle"
                  onTierChange={handleTierChange}
                  trigger={
                    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden">
                      <CardContent className="p-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span
                            className={cn("text-xs font-medium", status.text)}>
                            {percent.toFixed(0)}%
                          </span>
                        </div>

                        <h4 className="font-medium text-sm mb-2">
                          {category.name}
                        </h4>

                        {/* Safe to Spend */}
                        <div className="mb-3">
                          <span className="text-2xl font-bold tracking-tight">
                            ${remaining.toLocaleString()}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            safe to spend
                          </p>
                        </div>

                        <Progress
                          value={Math.min(percent, 100)}
                          className="h-1.5"
                        />
                      </CardContent>
                    </Card>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Tier 3: Subscriptions */}
      {subscriptions.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            Fixed Subscriptions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subscriptions.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const spent = categorySpending[category.id] || 0;
              const isPaid = spent >= category.budget_limit;

              return (
                <CategoryDetailSheet
                  key={category.id}
                  category={category}
                  spent={spent}
                  transactions={getTransactionsForCategory(category.id)}
                  currentTier="subscriptions"
                  onTierChange={handleTierChange}
                  trigger={
                    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-border/50 rounded-xl overflow-hidden">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {category.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${category.budget_limit.toLocaleString()}
                          </p>
                        </div>
                        {isPaid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
                        )}
                      </CardContent>
                    </Card>
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {essentials.length === 0 &&
        lifestyle.length === 0 &&
        subscriptions.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">No budget categories yet</h3>
            <p className="text-muted-foreground mt-1">
              Create your first budget category to get started
            </p>
          </div>
        )}
    </div>
  );
}
