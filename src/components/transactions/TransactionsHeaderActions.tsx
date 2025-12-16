"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddTransactionDrawer } from "@/components/transactions/AddTransactionDrawer";
import { Category } from "@/types/finance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionsHeaderActionsProps {
  categories: Category[];
}

export function TransactionsHeaderActions({
  categories,
}: TransactionsHeaderActionsProps) {
  const t = useTranslations("Transactions");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export triggered");
  };

  return (
    <>
      <Button
        variant="outline"
        className="bg-white dark:bg-card shadow-sm border-none"
        onClick={() => setIsFilterOpen(!isFilterOpen)}>
        <Filter className="w-4 h-4 mr-2" />
        {t("filter")}
      </Button>
      <Button
        variant="outline"
        className="bg-white dark:bg-card shadow-sm border-none"
        onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        {t("export")}
      </Button>
      <AddTransactionDrawer
        categories={categories}
        trigger={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t("addTransaction")}
          </Button>
        }
      />
    </>
  );
}
