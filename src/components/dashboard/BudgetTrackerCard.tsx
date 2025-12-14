"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Info } from "lucide-react";
import { Category, Transaction } from "@/types/finance";

interface BudgetTrackerCardProps {
  categories: Category[];
  transactions: Transaction[];
}

export function BudgetTrackerCard({
  categories,
  transactions,
}: BudgetTrackerCardProps) {
  // Mock total budget for demo match
  const totalBudget = 10346.12;
  const totalLimit = 12346.68;

  // Calculate actual spending per category
  const spendingByCategory = categories
    .map((cat) => {
      const spent = transactions
        .filter((t) => t.category_id === cat.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cat,
        spent,
        limit: cat.budget_limit || 1000, // Default if 0
      };
    })
    .filter((c) => c.spent > 0 || c.limit > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  return (
    <Card className="h-full bg-white dark:bg-card shadow-sm rounded-xl border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">
            Budget Tracker
          </CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs bg-white shadow-sm">
              Totals
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Percent
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              ${totalLimit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Live budget across all categories</span>
            <span className="font-medium text-foreground">
              ${totalBudget.toLocaleString()} spent so far
            </span>
          </div>
        </div>

        {/* Visual Bar Code - Using a flex row of colored divs for the "Barcode" look */}
        <div className="flex h-12 w-full gap-[2px]">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                i < 30
                  ? "bg-gradient-to-b from-orange-400 to-pink-500"
                  : "bg-muted"
              }`}
              style={{ opacity: i < 30 ? 0.8 + ((i * 1337) % 20) / 100 : 0.3 }}
            />
          ))}
        </div>

        {/* Category breakdown */}
        <div className="space-y-3">
          {spendingByCategory.map((cat, i) => {
            const colors = [
              "bg-orange-500",
              "bg-pink-500",
              "bg-purple-500",
              "bg-blue-500",
              "bg-cyan-500",
            ];
            const percent = Math.min(100, (cat.spent / cat.limit) * 100);

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      colors[i % colors.length]
                    }`}
                  />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-muted-foreground">
                    • ${cat.spent.toLocaleString()}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {Math.round(percent)}%
                </span>
              </div>
            );
          })}
          {spendingByCategory.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No spending data yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
