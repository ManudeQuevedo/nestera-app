"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Wifi,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Heart,
  Plane,
  Sparkles,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { Category, Transaction } from "@/types/finance";
import { CategoryDetailSheet } from "./CategoryDetailSheet";
import { cn } from "@/lib/utils";

interface BudgetBentoGridProps {
  categories: Category[];
  transactions: Transaction[];
  categorySpending: Record<string, number>;
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
  utilities: Zap,
  electricity: Zap,
  internet: Wifi,
  education: GraduationCap,
  entertainment: Gamepad2,
  shopping: ShoppingBag,
  health: Heart,
  travel: Plane,
  default: Sparkles,
};

// Get grid size based on category importance
function getCategorySize(categoryName: string): {
  colSpan: string;
  rowSpan: string;
  isAnchor: boolean;
  isHighPriority: boolean;
} {
  const name = categoryName.toLowerCase();

  if (
    name.includes("housing") ||
    name.includes("rent") ||
    name.includes("mortgage")
  ) {
    return {
      colSpan: "md:col-span-2",
      rowSpan: "md:row-span-2",
      isAnchor: true,
      isHighPriority: false,
    };
  }

  if (
    name.includes("groceries") ||
    name.includes("family") ||
    name.includes("kids")
  ) {
    return {
      colSpan: "md:col-span-2",
      rowSpan: "",
      isAnchor: false,
      isHighPriority: true,
    };
  }

  return { colSpan: "", rowSpan: "", isAnchor: false, isHighPriority: false };
}

// Get icon for category
function getCategoryIcon(categoryName: string): React.ElementType {
  const name = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.includes(key)) return icon;
  }
  return categoryIcons.default;
}

// Get status color based on spending percentage
function getStatusColor(percent: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (percent >= 100) {
    return { bg: "bg-red-500", text: "text-red-500", label: "Over Budget" };
  }
  if (percent >= 75) {
    return { bg: "bg-yellow-500", text: "text-yellow-500", label: "Warning" };
  }
  return { bg: "bg-green-500", text: "text-green-500", label: "On Track" };
}

export function BudgetBentoGrid({
  categories,
  transactions,
  categorySpending,
}: BudgetBentoGridProps) {
  // Filter to expense categories only
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Get transactions for a category
  const getTransactionsForCategory = (categoryId: string) => {
    return transactions.filter((t) => t.category_id === categoryId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
      {expenseCategories.map((category) => {
        const { colSpan, rowSpan, isAnchor, isHighPriority } = getCategorySize(
          category.name
        );
        const Icon = getCategoryIcon(category.name);
        const spent = categorySpending[category.id] || 0;
        const remaining = Math.max(0, category.budget_limit - spent);
        const percent =
          category.budget_limit > 0 ? (spent / category.budget_limit) * 100 : 0;
        const status = getStatusColor(percent);
        const categoryTransactions = getTransactionsForCategory(category.id);

        return (
          <CategoryDetailSheet
            key={category.id}
            category={category}
            spent={spent}
            transactions={categoryTransactions}
            trigger={
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                  "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-border/50 rounded-2xl overflow-hidden",
                  colSpan,
                  rowSpan
                )}>
                {/* Color accent bar */}
                <div className={cn("h-1", status.bg)} />

                {/* Card Content */}
                <div
                  className={cn(
                    "p-5",
                    isAnchor && "p-8 min-h-[280px] flex flex-col"
                  )}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "rounded-xl flex items-center justify-center",
                        isAnchor
                          ? "h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "h-10 w-10 bg-muted"
                      )}>
                      <Icon
                        className={cn(
                          isAnchor
                            ? "h-7 w-7 text-white"
                            : "h-5 w-5 text-muted-foreground"
                        )}
                      />
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
                      {status.label}
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3
                    className={cn(
                      "font-semibold mt-4",
                      isAnchor ? "text-xl" : "text-base"
                    )}>
                    {category.name}
                  </h3>

                  {/* Amount Display */}
                  <div className={cn("mt-2", isAnchor && "mt-auto")}>
                    {isAnchor ? (
                      // Large anchor card - detailed view
                      <div className="space-y-4">
                        <div>
                          <span className="text-4xl font-bold tracking-tight">
                            ${remaining.toLocaleString()}
                          </span>
                          <span className="text-lg text-muted-foreground ml-2">
                            left
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of ${category.budget_limit.toLocaleString()} budget
                        </div>

                        {/* Progress Ring Visual */}
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all", status.bg)}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${spent.toLocaleString()} spent
                          </span>
                          <span className={status.text}>
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ) : isHighPriority ? (
                      // High priority card - standard view
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold tracking-tight">
                            ${remaining.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            left
                          </span>
                        </div>
                        <Progress
                          value={Math.min(percent, 100)}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${spent.toLocaleString()} spent</span>
                          <span>${category.budget_limit.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      // Discretionary - minimalist
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold">
                            ${remaining.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            left
                          </span>
                        </div>
                        <TrendingDown
                          className={cn(
                            "h-4 w-4",
                            percent >= 75
                              ? "text-red-500"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            }
          />
        );
      })}

      {/* Empty state if no categories */}
      {expenseCategories.length === 0 && (
        <div className="col-span-full text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No budget categories yet</h3>
          <p className="text-muted-foreground mt-1">
            Create your first budget category to get started
          </p>
        </div>
      )}
    </div>
  );
}
