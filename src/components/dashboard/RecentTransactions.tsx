"use client";

import { useState, useMemo } from "react";
import { Link } from "@/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction, Category } from "@/types/finance";
import {
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading?: boolean;
  compact?: boolean;
}

export function RecentTransactions({
  transactions,
  categories,
  isLoading,
  compact = false,
}: RecentTransactionsProps) {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter transactions from last 10 days
  const last10DaysTransactions = useMemo(() => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    tenDaysAgo.setHours(0, 0, 0, 0);

    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= tenDaysAgo;
    });
  }, [transactions]);

  // Get unique categories present in the data
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(
      last10DaysTransactions.map((t) => t.category_id).filter(Boolean)
    );
    return categories.filter((c) => categoryIds.has(c.id));
  }, [last10DaysTransactions, categories]);

  // Apply category filter
  const filteredTransactions = useMemo(() => {
    if (selectedCategories.length === 0) return last10DaysTransactions;
    return last10DaysTransactions.filter(
      (t) => t.category_id && selectedCategories.includes(t.category_id)
    );
  }, [last10DaysTransactions, selectedCategories]);

  // Apply sorting and limit
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];

    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "highest":
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case "lowest":
        sorted.sort((a, b) => a.amount - b.amount);
        break;
    }

    return sorted.slice(0, compact ? 5 : 10);
  }, [filteredTransactions, sortBy, compact]);

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "Uncategorized";

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "newest":
        return tCommon("sort.newest");
      case "oldest":
        return tCommon("sort.oldest");
      case "highest":
        return tCommon("sort.highestAmount");
      case "lowest":
        return tCommon("sort.lowestAmount");
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            {t("recentActivity")}
          </CardTitle>

          <div className="flex items-center gap-1">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white gap-1">
                  <ArrowUpDown className="h-3 w-3" />
                  {!compact && getSortLabel(sortBy)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel className="text-xs">
                  {tCommon("sortBy")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="newest" className="text-xs">
                    <ArrowDown className="h-3 w-3 mr-2" />
                    {tCommon("sort.newest")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest" className="text-xs">
                    <ArrowUp className="h-3 w-3 mr-2" />
                    {tCommon("sort.oldest")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="highest" className="text-xs">
                    <ArrowDown className="h-3 w-3 mr-2" />
                    {tCommon("sort.highestAmount")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lowest" className="text-xs">
                    <ArrowUp className="h-3 w-3 mr-2" />
                    {tCommon("sort.lowestAmount")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* See All Link */}
            <Link href="/transactions">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white gap-0.5">
                {tCommon("seeAll")}
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Transaction List */}
        <div className="space-y-1">
          {sortedTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 px-1 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    tx.type === "income"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  )}>
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[13px] tracking-tight truncate">
                    {tx.establishment || tx.description || "Transaction"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {getCategoryName(tx.category_id || "")}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "font-semibold text-sm tabular-nums shrink-0",
                  tx.type === "income" ? "text-emerald-500" : "text-foreground"
                )}>
                {tx.type === "income" ? "+" : "-"}$
                {tx.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}

          {/* Empty State */}
          {sortedTransactions.length === 0 && (
            <div className="ghost-state py-8">
              <Receipt className="ghost-state-icon" />
              <p className="ghost-state-text">
                {selectedCategories.length > 0
                  ? t("tryClearingFilters")
                  : t("noRecentTransactions")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
