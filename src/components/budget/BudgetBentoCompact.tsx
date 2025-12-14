"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  ChevronRight,
  Brain,
} from "lucide-react";
import { Category, Transaction } from "@/types/finance";
import { CategoryDetailDialog } from "./CategoryDetailDialog";
import { CategoryTier } from "./CategoryDetailSheet";
import { BudgetPredictionModal } from "./BudgetPredictionModal";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface BudgetBentoCompactProps {
  categories: Category[];
  transactions: Transaction[];
  categorySpending: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
}

// Icon mapping with psychology-based colors
// Blue = Trust/Security (housing, utilities)
// Green = Growth/Health (groceries, emergency)
// Orange = Energy/Fun (entertainment, dining)
// Purple = Creativity/Kids (school, shopping)
// Red = Urgency/Debt (debt payment)
// Yellow = Optimism/Transport (car, transport)
const categoryConfig: Record<
  string,
  { icon: React.ElementType; color: string }
> = {
  housing: { icon: Home, color: "text-blue-500" },
  rent: { icon: Home, color: "text-blue-500" },
  mortgage: { icon: Home, color: "text-blue-500" },
  groceries: { icon: ShoppingCart, color: "text-green-500" },
  food: { icon: Utensils, color: "text-orange-500" },
  dining: { icon: Utensils, color: "text-orange-500" },
  restaurants: { icon: Utensils, color: "text-orange-500" },
  transportation: { icon: Car, color: "text-yellow-500" },
  transport: { icon: Car, color: "text-yellow-500" },
  utilities: { icon: Zap, color: "text-blue-400" },
  electricity: { icon: Zap, color: "text-blue-400" },
  entertainment: { icon: Film, color: "text-orange-400" },
  shopping: { icon: ShoppingBag, color: "text-purple-500" },
  kids: { icon: Baby, color: "text-pink-500" },
  school: { icon: Baby, color: "text-pink-500" },
  debt: { icon: CreditCard, color: "text-red-500" },
  emergency: { icon: Shield, color: "text-emerald-500" },
  default: { icon: Sparkles, color: "text-gray-400" },
};

function getCategoryConfig(name: string): {
  icon: React.ElementType;
  color: string;
} {
  const lowerName = name.toLowerCase();
  for (const [key, config] of Object.entries(categoryConfig)) {
    if (lowerName.includes(key)) return config;
  }
  return categoryConfig.default;
}

function getCategoryTier(name: string): CategoryTier {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes("housing") ||
    lowerName.includes("rent") ||
    lowerName.includes("groceries")
  ) {
    return "essentials";
  }
  if (
    lowerName.includes("subscription") ||
    lowerName.includes("netflix") ||
    lowerName.includes("spotify")
  ) {
    return "subscriptions";
  }
  return "lifestyle";
}

function getStatusColor(percent: number) {
  if (percent >= 100) return { bg: "bg-red-500", text: "text-red-500" };
  if (percent >= 75) return { bg: "bg-yellow-500", text: "text-yellow-500" };
  return { bg: "bg-green-500", text: "text-green-500" };
}

export function BudgetBentoCompact({
  categories,
  transactions,
  categorySpending,
  totalBudget,
  totalSpent,
}: BudgetBentoCompactProps) {
  const t = useTranslations("Budget");
  const tCommon = useTranslations("Common");

  const [tierOverrides, setTierOverrides] = useState<
    Record<string, CategoryTier>
  >({});

  const handleTierChange = (categoryId: string, newTier: CategoryTier) => {
    setTierOverrides((prev) => ({ ...prev, [categoryId]: newTier }));
  };

  // Sort categories into tiers
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

  // Find Housing and Groceries specifically
  const housing = essentials.find((c) =>
    c.name.toLowerCase().includes("housing")
  );
  const groceries = essentials.find((c) =>
    c.name.toLowerCase().includes("groceries")
  );

  const getTransactionsForCategory = (categoryId: string) =>
    transactions.filter((t) => t.category_id === categoryId);

  // Calculate totals
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const daysRemaining = daysInMonth - today.getDate();
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const renderCategoryCard = (
    category: Category,
    size: "tall" | "standard" | "mini"
  ) => {
    const { icon: Icon, color: iconColor } = getCategoryConfig(category.name);
    const spent = categorySpending[category.id] || 0;
    const remaining = Math.max(0, category.budget_limit - spent);
    const percent =
      category.budget_limit > 0 ? (spent / category.budget_limit) * 100 : 0;
    const status = getStatusColor(percent);
    const isPaid = spent >= category.budget_limit;

    if (size === "mini") {
      return (
        <CategoryDetailDialog
          key={category.id}
          category={category}
          spent={spent}
          transactions={getTransactionsForCategory(category.id)}
          trigger={
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 cursor-pointer hover:shadow-md transition-all shrink-0">
              <Icon className={cn("h-5 w-5", iconColor)} />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${category.budget_limit}
                </p>
              </div>
              {isPaid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-500 shrink-0" />
              )}
            </div>
          }
        />
      );
    }

    if (size === "tall") {
      return (
        <CategoryDetailDialog
          key={category.id}
          category={category}
          spent={spent}
          transactions={getTransactionsForCategory(category.id)}
          trigger={
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] bg-card border-border/50 rounded-2xl h-full">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={cn("h-6 w-6", iconColor)} />
                  <span className={cn("text-xs font-medium", status.text)}>
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{category.name}</h4>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-2xl font-bold tracking-tight">
                    ${remaining.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("leftOf")} ${category.budget_limit.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", status.bg)}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          }
        />
      );
    }

    // Standard size
    return (
      <CategoryDetailDialog
        key={category.id}
        category={category}
        spent={spent}
        transactions={getTransactionsForCategory(category.id)}
        trigger={
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] bg-card border-border/50 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn("h-5 w-5", iconColor)} />
                <span className={cn("text-xs font-medium", status.text)}>
                  {percent.toFixed(0)}%
                </span>
              </div>
              <h4 className="font-medium text-sm mb-1 truncate">
                {category.name}
              </h4>
              <span className="text-xl font-bold tracking-tight">
                ${remaining.toLocaleString()}
              </span>
              <p className="text-xs text-muted-foreground mb-2">
                {t("safeToSpend")}
              </p>
              <Progress value={Math.min(percent, 100)} className="h-1.5" />
            </CardContent>
          </Card>
        }
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Row 1: High Priority Layer - 4 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Slot 1: Total Budget Summary (col-span-2) */}
        <Card className="md:col-span-2 bg-primary border-border/30 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-100/90">
                {t("totalBudget")}
              </h3>
              <span className="text-xs text-blue-200/70">
                {t("daysLeft", { days: daysRemaining })}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-bold text-white tracking-tight">
                {percentUsed.toFixed(0)}%
              </span>
              <span className="text-blue-200/80 text-sm">{t("used")}</span>
            </div>

            <Progress
              value={Math.min(percentUsed, 100)}
              className="h-3 mb-3 bg-blue-900/50"
            />

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-blue-200/80">
                {t("spentAmount", { amount: totalSpent.toLocaleString() })}
              </span>
              <span className="text-white font-medium">
                {t("remainingAmount", {
                  amount: Math.max(
                    0,
                    totalBudget - totalSpent
                  ).toLocaleString(),
                })}
              </span>
            </div>

            <BudgetPredictionModal
              trigger={
                <Button variant="secondary" size="sm" className="w-full gap-2">
                  <Brain className="h-4 w-4" />
                  {t("seeDetails")}
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              }
              categories={categories}
              transactions={transactions}
              categorySpending={categorySpending}
              totalBudget={totalBudget}
              totalSpent={totalSpent}
            />
          </CardContent>
        </Card>

        {/* Slot 2: Housing (col-span-1) */}
        {housing ? (
          renderCategoryCard(housing, "tall")
        ) : (
          <Card className="bg-muted/30 border-dashed border-2 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("noHousing")}</p>
          </Card>
        )}

        {/* Slot 3: Groceries (col-span-1) */}
        {groceries ? (
          renderCategoryCard(groceries, "tall")
        ) : (
          <Card className="bg-muted/30 border-dashed border-2 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">{t("noGroceries")}</p>
          </Card>
        )}
      </div>

      {/* Row 2: Variable Layer - 4 column grid */}
      {lifestyle.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lifestyle
            .slice(0, 8)
            .map((cat) => renderCategoryCard(cat, "standard"))}
        </div>
      )}

      {/* Row 3: Fixed Layer - Full width horizontal scroll */}
      {subscriptions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("subscriptions")}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {subscriptions.map((cat) => renderCategoryCard(cat, "mini"))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Empty State */}
      {essentials.length === 0 &&
        lifestyle.length === 0 &&
        subscriptions.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg">{t("noCategories")}</h3>
            <p className="text-muted-foreground mt-1">{t("createFirst")}</p>
          </div>
        )}
    </div>
  );
}
