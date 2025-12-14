"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, X, Check, Loader2, FolderInput } from "lucide-react";
import { Category, Transaction } from "@/types/finance";

export type CategoryTier = "essentials" | "lifestyle" | "subscriptions";

interface CategoryDetailSheetProps {
  category: Category;
  spent: number;
  transactions: Transaction[];
  trigger: React.ReactNode;
  currentTier?: CategoryTier;
  onTierChange?: (categoryId: string, newTier: CategoryTier) => void;
}

export function CategoryDetailSheet({
  category,
  spent,
  transactions,
  trigger,
  currentTier,
  onTierChange,
}: CategoryDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState(category.budget_limit.toString());
  const [saving, setSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CategoryTier | undefined>(
    currentTier
  );

  const remaining = category.budget_limit - spent;
  const percent =
    category.budget_limit > 0 ? (spent / category.budget_limit) * 100 : 0;

  const handleSaveBudget = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 500);
  };

  const handleTierChange = (tier: CategoryTier) => {
    setSelectedTier(tier);
    if (onTierChange) {
      onTierChange(category.id, tier);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[420px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">{category.name}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Monthly Budget
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditing(!editing)}>
              {editing ? (
                <X className="h-4 w-4" />
              ) : (
                <Pencil className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Budget Display/Edit */}
          <div className="mt-4">
            {editing ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-7 text-lg font-bold"
                  />
                </div>
                <Button onClick={handleSaveBudget} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    ${remaining.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    left of ${category.budget_limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      percent >= 100
                        ? "bg-red-500"
                        : percent >= 75
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  ${spent.toLocaleString()} spent ({percent.toFixed(0)}%)
                </p>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* Move Category Section */}
        <div className="px-6 py-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderInput className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Category Tier</span>
            </div>
            <Select
              value={selectedTier}
              onValueChange={(v) => handleTierChange(v as CategoryTier)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="essentials" className="text-xs">
                  🏠 Essentials
                </SelectItem>
                <SelectItem value="lifestyle" className="text-xs">
                  🎯 Lifestyle
                </SelectItem>
                <SelectItem value="subscriptions" className="text-xs">
                  📦 Subscriptions
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <span className="font-medium text-sm">Transactions</span>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">
                    Add your first expense in this category
                  </p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/50 border border-border/50">
                    <div>
                      <p className="font-medium text-sm">
                        {tx.establishment || tx.description || "Transaction"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="font-semibold text-red-500">
                      -${tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Add Footer */}
        <div className="p-4 border-t bg-background">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Expense to {category.name}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
