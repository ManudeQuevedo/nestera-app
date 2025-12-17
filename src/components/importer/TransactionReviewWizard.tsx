"use client";

import { useState, useCallback } from "react";
import {
  useTransactionReview,
  ReviewTransaction,
} from "@/hooks/useTransactionReview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2,
  Loader2,
  ChevronLeft,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Category options with emoji labels
const CATEGORY_OPTIONS = [
  { value: "Housing", label: "🏠 Vivienda" },
  { value: "Food", label: "🍽️ Comida" },
  { value: "Transport", label: "🚗 Transporte" },
  { value: "Entertainment", label: "🎬 Entretenimiento" },
  { value: "Shopping", label: "🛍️ Compras" },
  { value: "Services", label: "⚡ Servicios" },
  { value: "Health", label: "🏥 Salud" },
  { value: "Education", label: "📚 Educación" },
  { value: "Other", label: "📦 Otro" },
];

interface TransactionReviewWizardProps {
  initialData: ReviewTransaction[];
  onBack?: () => void;
  onConfirm: (
    transactions: ReviewTransaction[],
    newCategories: string[]
  ) => Promise<void>;
  existingCategories?: string[];
}

export function TransactionReviewWizard({
  initialData,
  onBack,
  onConfirm,
  existingCategories,
}: TransactionReviewWizardProps) {
  const {
    transactions,
    categories,
    summary,
    updateCategory,
    bulkUpdateCategory,
    createNewCategory,
    toggleSelection,
    selectAll,
    deselectAll,
    getSelectedTransactions,
    getNewCategories,
  } = useTransactionReview({
    initialTransactions: initialData,
    existingCategories,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState<{
    rowIndex: number;
    value: string;
  } | null>(null);
  const [bulkApplyDesc, setBulkApplyDesc] = useState<string | null>(null);

  const getCategoryLabel = (value: string) => {
    const option = CATEGORY_OPTIONS.find((o) => o.value === value);
    return option?.label || `✨ ${value}`;
  };

  const handleCategoryChange = (rowIndex: number, value: string) => {
    if (value === "__new__") {
      setNewCategoryInput({ rowIndex, value: "" });
    } else {
      updateCategory(rowIndex, value);
      // Check if we should offer bulk apply
      const tx = transactions[rowIndex];
      const matchingCount = transactions.filter(
        (t) =>
          t.description.toLowerCase() === tx.description.toLowerCase() &&
          t.category !== value
      ).length;
      if (matchingCount > 0) {
        setBulkApplyDesc(tx.description);
      }
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryInput && newCategoryInput.value.trim()) {
      const created = createNewCategory(newCategoryInput.value);
      updateCategory(newCategoryInput.rowIndex, created);
      setNewCategoryInput(null);
    }
  };

  const handleBulkApply = (desc: string, category: string) => {
    bulkUpdateCategory(desc, category);
    setBulkApplyDesc(null);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(getSelectedTransactions(), getNewCategories());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Revisa tus movimientos
              </h1>
              <p className="text-slate-500 text-sm">
                La IA ha categorizado tus transacciones. Revisa y ajusta antes
                de importar.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">Ingresos</p>
                <p className="text-xl font-bold text-emerald-700">
                  ${summary.totalIncome.toLocaleString("es-MX")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">Gastos</p>
                <p className="text-xl font-bold text-red-700">
                  ${summary.totalExpenses.toLocaleString("es-MX")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-medium">Neto</p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    summary.netAmount >= 0 ? "text-emerald-700" : "text-red-700"
                  )}>
                  ${summary.netAmount.toLocaleString("es-MX")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-600 font-medium">
                  Seleccionados
                </p>
                <p className="text-xl font-bold text-slate-700">
                  {summary.selectedCount} / {summary.totalCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bulk Selection Controls */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Seleccionar todos
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deseleccionar todos
          </Button>
        </div>

        {/* Transactions - Responsive View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Transacciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="w-28">Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-44">Categoría</TableHead>
                      <TableHead className="text-right w-32">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, idx) => (
                      <TableRow
                        key={tx.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          !tx.selected && "opacity-50 bg-slate-50"
                        )}>
                        <TableCell>
                          <Checkbox
                            checked={tx.selected}
                            onCheckedChange={() => toggleSelection(idx)}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {tx.date}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium truncate max-w-[250px]">
                            {tx.description}
                          </p>
                          {tx.isMSI && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                              MSI
                            </span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {newCategoryInput?.rowIndex === idx ? (
                            <div className="flex gap-1">
                              <Input
                                value={newCategoryInput.value}
                                onChange={(e) =>
                                  setNewCategoryInput({
                                    ...newCategoryInput,
                                    value: e.target.value,
                                  })
                                }
                                placeholder="Nueva categoría"
                                className="h-8 text-xs"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCreateCategory();
                                  if (e.key === "Escape")
                                    setNewCategoryInput(null);
                                }}
                              />
                              <Button
                                size="sm"
                                className="h-8 px-2"
                                onClick={handleCreateCategory}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={tx.category}
                              onValueChange={(v) =>
                                handleCategoryChange(idx, v)
                              }>
                              <SelectTrigger className="w-full h-8 text-xs">
                                <SelectValue>
                                  {getCategoryLabel(tx.category)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORY_OPTIONS.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                                {categories
                                  .filter(
                                    (c) =>
                                      !CATEGORY_OPTIONS.find(
                                        (o) => o.value === c
                                      )
                                  )
                                  .map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      ✨ {cat}
                                    </SelectItem>
                                  ))}
                                <SelectItem value="__new__">
                                  <span className="flex items-center gap-1 text-violet-600">
                                    <Plus className="w-3 h-3" /> Crear nueva...
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            tx.type === "expense"
                              ? "text-red-600"
                              : "text-emerald-600"
                          )}>
                          {tx.type === "expense" ? "-" : "+"}$
                          {Math.abs(tx.amount).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden max-h-[60vh] overflow-y-auto p-3 space-y-3">
                {transactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className={cn(
                      "bg-white border border-slate-100 rounded-xl p-4 transition-all active:scale-[0.98]",
                      !tx.selected && "opacity-50"
                    )}>
                    {/* Header Row: Checkbox + Date + Amount */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={tx.selected}
                          onCheckedChange={() => toggleSelection(idx)}
                          className="h-5 w-5"
                        />
                        <span className="text-xs text-slate-400 font-medium">
                          {tx.date}
                        </span>
                        {tx.isMSI && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            MSI
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          tx.type === "expense"
                            ? "text-red-600"
                            : "text-emerald-600"
                        )}>
                        {tx.type === "expense" ? "-" : "+"}$
                        {Math.abs(tx.amount).toLocaleString("es-MX", {
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm font-medium text-slate-800 mb-3 leading-tight">
                      {tx.description}
                    </p>

                    {/* Category Selector */}
                    <Select
                      value={tx.category}
                      onValueChange={(v) => handleCategoryChange(idx, v)}>
                      <SelectTrigger className="w-full h-10 text-sm bg-slate-50 border-slate-200">
                        <SelectValue>
                          {getCategoryLabel(tx.category)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                        {categories
                          .filter(
                            (c) => !CATEGORY_OPTIONS.find((o) => o.value === c)
                          )
                          .map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              ✨ {cat}
                            </SelectItem>
                          ))}
                        <SelectItem value="__new__">
                          <span className="flex items-center gap-1 text-violet-600">
                            <Plus className="w-3 h-3" /> Crear nueva...
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bulk Apply Prompt */}
        {bulkApplyDesc && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="text-sm">
              ¿Aplicar a todas las "{bulkApplyDesc.slice(0, 20)}..."?
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const tx = transactions.find(
                  (t) =>
                    t.description.toLowerCase() === bulkApplyDesc.toLowerCase()
                );
                if (tx) handleBulkApply(bulkApplyDesc, tx.category);
              }}>
              Sí, aplicar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBulkApplyDesc(null)}>
              No
            </Button>
          </motion.div>
        )}

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-between">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
            </Button>
          )}
          <div className="ml-auto">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || summary.selectedCount === 0}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8"
              size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar e Importar ({summary.selectedCount})
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
