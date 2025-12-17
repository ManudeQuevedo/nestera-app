"use client";

import { useState, useCallback, useMemo } from "react";

export interface ReviewTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  suggestedCategory: string;
  selected: boolean;
  isMSI?: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  selectedCount: number;
  totalCount: number;
}

interface UseTransactionReviewProps {
  initialTransactions: ReviewTransaction[];
  existingCategories?: string[];
}

const DEFAULT_CATEGORIES = [
  "Housing",
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Services",
  "Health",
  "Education",
  "Other",
];

export function useTransactionReview({
  initialTransactions,
  existingCategories = DEFAULT_CATEGORIES,
}: UseTransactionReviewProps) {
  const [transactions, setTransactions] =
    useState<ReviewTransaction[]>(initialTransactions);
  const [categories, setCategories] = useState<string[]>(existingCategories);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Update category for a single transaction
  const updateCategory = useCallback(
    (rowIndex: number, newCategory: string) => {
      setTransactions((prev) =>
        prev.map((tx, i) => (i === rowIndex ? { ...tx, category: newCategory } : tx))
      );
    },
    []
  );

  // Bulk update category for all transactions with same description
  const bulkUpdateCategory = useCallback(
    (description: string, newCategory: string) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.description.toLowerCase().includes(description.toLowerCase())
            ? { ...tx, category: newCategory }
            : tx
        )
      );
    },
    []
  );

  // Create a new custom category
  const createNewCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed) && !customCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
      setCategories((prev) => [...prev, trimmed]);
    }
    return trimmed;
  }, [categories, customCategories]);

  // Toggle selection for a transaction
  const toggleSelection = useCallback((rowIndex: number) => {
    setTransactions((prev) =>
      prev.map((tx, i) => (i === rowIndex ? { ...tx, selected: !tx.selected } : tx))
    );
  }, []);

  // Select all transactions
  const selectAll = useCallback(() => {
    setTransactions((prev) => prev.map((tx) => ({ ...tx, selected: true })));
  }, []);

  // Deselect all transactions
  const deselectAll = useCallback(() => {
    setTransactions((prev) => prev.map((tx) => ({ ...tx, selected: false })));
  }, []);

  // Calculate summary
  const summary = useMemo<TransactionSummary>(() => {
    const selected = transactions.filter((tx) => tx.selected);
    const totalIncome = selected
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = selected
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      selectedCount: selected.length,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // Get selected transactions for submission
  const getSelectedTransactions = useCallback(() => {
    return transactions.filter((tx) => tx.selected);
  }, [transactions]);

  // Get all categories (existing + custom)
  const allCategories = useMemo(() => {
    return [...new Set([...categories, ...customCategories])];
  }, [categories, customCategories]);

  // Get new categories that need to be created in DB
  const getNewCategories = useCallback(() => {
    return customCategories;
  }, [customCategories]);

  return {
    transactions,
    categories: allCategories,
    customCategories,
    summary,
    updateCategory,
    bulkUpdateCategory,
    createNewCategory,
    toggleSelection,
    selectAll,
    deselectAll,
    getSelectedTransactions,
    getNewCategories,
  };
}
