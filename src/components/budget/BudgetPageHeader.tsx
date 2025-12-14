"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Loader2 } from "lucide-react";
import { Category } from "@/types/finance";
import { AddTransactionDrawer } from "@/components/transactions/AddTransactionDrawer";
import { createCategory } from "@/actions/transactions";

interface BudgetPageHeaderProps {
  categories: Category[];
}

export function BudgetPageHeader({ categories }: BudgetPageHeaderProps) {
  const router = useRouter();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"expense" | "income">(
    "expense"
  );
  const [budgetLimit, setBudgetLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCategories = categories.length > 0;

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await createCategory({
        name: categoryName.trim(),
        type: categoryType,
        budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0,
      });

      // Reset form and close
      setCategoryName("");
      setCategoryType("expense");
      setBudgetLimit("");
      setIsAddCategoryOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Budget</h1>
        <p className="text-muted-foreground">
          Track your monthly spending by category
        </p>
      </div>
      <div className="flex gap-2">
        {/* Add Expense Button - Disabled when no categories */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {hasCategories ? (
                  <AddTransactionDrawer
                    categories={categories}
                    trigger={
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Button>
                    }
                  />
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="opacity-50 cursor-not-allowed">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            {!hasCategories && (
              <TooltipContent>
                <p>Create a category first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Add Category Button - Opens Dialog */}
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Groceries"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              {/* Category Type */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={categoryType}
                  onValueChange={(v) =>
                    setCategoryType(v as "expense" | "income")
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Budget Limit */}
              <div className="space-y-2">
                <Label htmlFor="budget-limit">Monthly Budget Limit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="budget-limit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handleAddCategory}
                disabled={isSubmitting || !categoryName.trim()}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
