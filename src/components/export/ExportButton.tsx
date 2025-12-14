"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { generateFinanceExport, generateCSVExport } from "@/lib/export-excel";
import { Transaction, Category } from "@/types/finance";
import { useTranslations } from "next-intl";

interface ExportButtonProps {
  transactions: Transaction[];
  categories: Category[];
  debts?: { balance: number }[];
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({
  transactions,
  categories,
  debts = [],
  variant = "outline",
  size = "default",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations("Common");

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);

  const handleExcelExport = async () => {
    setIsExporting(true);
    try {
      generateFinanceExport({
        transactions,
        totalIncome,
        totalExpenses,
        totalDebt,
        categories: categories.map((c) => ({
          name: c.name,
          budget_limit: c.budget_limit,
        })),
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = async () => {
    setIsExporting(true);
    try {
      generateCSVExport(transactions);
    } catch (error) {
      console.error("CSV Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting}
          className="bg-white dark:bg-card shadow-sm border-none">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {t("export") || "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleExcelExport}
          className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
