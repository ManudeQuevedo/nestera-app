"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BudgetHeaderActions() {
  const t = useTranslations("Budget");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  return (
    <>
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-white dark:bg-card shadow-sm border-none">
            <Plus className="w-4 h-4 mr-2" />
            {t("addCategory")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addCategory")}</DialogTitle>
            <DialogDescription>{t("addCategoryDescription")}</DialogDescription>
          </DialogHeader>
          {/* TODO: Add category form */}
          <p className="text-muted-foreground text-sm py-8 text-center">
            Category form coming soon...
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t("addExpense")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addExpense")}</DialogTitle>
            <DialogDescription>{t("addExpenseDescription")}</DialogDescription>
          </DialogHeader>
          {/* TODO: Add expense form */}
          <p className="text-muted-foreground text-sm py-8 text-center">
            Expense form coming soon...
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
