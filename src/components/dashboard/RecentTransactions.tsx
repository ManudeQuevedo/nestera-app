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

  // Apply sorting and limit to 10
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

    return sorted.slice(0, 10);
  }, [filteredTransactions, sortBy]);

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
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">{t("recentActivity")}</h2>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="bg-card border rounded-lg p-4 h-full">
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-foreground">
            {t("recentActivity")}
          </h2>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {getSortLabel(sortBy)}
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

            {/* Category Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 text-xs gap-1.5",
                    selectedCategories.length > 0
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}>
                  <Filter className="h-3.5 w-3.5" />
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : tCommon("filter")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">
                  {tCommon("categories")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableCategories.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {tCommon("noCategories")}
                  </div>
                ) : (
                  availableCategories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat.id}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      className="text-xs">
                      {cat.name}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
                {selectedCategories.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs justify-start"
                      onClick={() => setSelectedCategories([])}>
                      {tCommon("clearAll")}
                    </Button>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* See All Link */}
            <Link href="/transactions">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1">
                {tCommon("seeAll")}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/30">
                <TableHead className="text-xs font-medium text-muted-foreground py-2">
                  {tCommon("table.description")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2 hidden sm:table-cell">
                  {tCommon("table.category")}
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground py-2 hidden md:table-cell">
                  {tCommon("table.date")}
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground py-2">
                  {tCommon("table.amount")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-muted/50 border-b border-border/20 cursor-pointer transition-colors">
                  {/* Description with type indicator */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          t.type === "income"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        )}>
                        {t.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {t.establishment || t.description || "Transaction"}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {getCategoryName(t.category_id || "")}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {getCategoryName(t.category_id || "")}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-3 text-right">
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        t.type === "income"
                          ? "text-green-500"
                          : "text-foreground"
                      )}>
                      {t.type === "income" ? "+" : "-"}$
                      {t.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty State */}
              {sortedTransactions.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm">{t("noRecentTransactions")}</p>
                      <p className="text-xs">
                        {selectedCategories.length > 0
                          ? t("tryClearingFilters")
                          : t("addTransactions")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
