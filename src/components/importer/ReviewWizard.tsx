"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
  Calendar,
  Sparkles,
  Banknote,
  Plus,
  Trash2,
  Scissors,
  Wallet,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  suggested_category: string;
  event_id?: string;
  goal_id?: string;
  is_cash_withdrawal?: boolean;
  splits?: Array<{ amount: number; category: string }>;
  transfer_to_cash_wallet?: boolean; // True = kept in wallet, not an expense
}

interface TransactionGroup {
  key: string;
  name: string;
  category: string;
  transactions: ParsedTransaction[];
  totalAmount: number;
  approved: boolean;
  expanded: boolean;
}

interface SplitRow {
  id: string;
  amount: number;
  category: string;
}

interface ReviewWizardProps {
  transactions: ParsedTransaction[];
  events?: { id: string; name: string }[];
  goals?: { id: string; name: string }[];
  onComplete: (approved: ParsedTransaction[]) => void;
  onBack?: () => void;
}

// ATM Detection patterns
const ATM_PATTERNS = [
  /RETIRO\s+ATM/i,
  /RETIRO\s+CAJERO/i,
  /CAJERO\s+AUTOMATICO/i,
  /ATM\s+WITHDRAWAL/i,
  /CASH\s*OUT/i,
  /WITHDRAWAL/i,
  /DISPOSICION/i,
  /RETIRO\s+EFECTIVO/i,
];

function isATMWithdrawal(description: string): boolean {
  return ATM_PATTERNS.some((pattern) => pattern.test(description));
}

// Category options
const CATEGORIES = [
  {
    value: "Transport",
    label: "🚗 Transporte",
    color: "bg-blue-100 text-blue-700",
  },
  { value: "Food", label: "🍽️ Comida", color: "bg-orange-100 text-orange-700" },
  {
    value: "Shopping",
    label: "🛍️ Compras",
    color: "bg-pink-100 text-pink-700",
  },
  {
    value: "Subscriptions",
    label: "📺 Suscripciones",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "Services",
    label: "⚡ Servicios",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    value: "Income",
    label: "💰 Ingreso",
    color: "bg-emerald-100 text-emerald-700",
  },
  { value: "Health", label: "🏥 Salud", color: "bg-red-100 text-red-700" },
  {
    value: "Education",
    label: "📚 Educación",
    color: "bg-indigo-100 text-indigo-700",
  },
  { value: "Pocket", label: "💵 Efectivo", color: "bg-teal-100 text-teal-700" },
  { value: "Other", label: "📦 Otro", color: "bg-slate-100 text-slate-700" },
];

// ATM Split Modal Component
function ATMSplitModal({
  transaction,
  open,
  onClose,
  onConfirm,
}: {
  transaction: ParsedTransaction;
  open: boolean;
  onClose: () => void;
  onConfirm: (splits: Array<{ amount: number; category: string }>) => void;
}) {
  const [rows, setRows] = useState<SplitRow[]>([
    { id: "1", amount: Math.abs(transaction.amount), category: "Pocket" },
  ]);

  const total = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
  const targetAmount = Math.abs(transaction.amount);
  const isValid = Math.abs(total - targetAmount) < 0.01 && rows.length > 1;

  const addRow = () => {
    setRows([
      ...rows,
      { id: Date.now().toString(), amount: 0, category: "Food" },
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  const updateRow = (
    id: string,
    field: "amount" | "category",
    value: string | number
  ) => {
    setRows(
      rows.map((r) =>
        r.id === id
          ? { ...r, [field]: field === "amount" ? Number(value) : value }
          : r
      )
    );
  };

  const handleConfirm = () => {
    onConfirm(rows.map((r) => ({ amount: r.amount, category: r.category })));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Scissors className="w-5 h-5 text-violet-600" />
            Desglosar Retiro de Efectivo
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Divide ${targetAmount.toLocaleString("es-MX")} en categorías
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {rows.map((row, index) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 items-center">
              <div className="flex-1">
                <Select
                  value={row.category}
                  onValueChange={(v) => updateRow(row.id, "category", v)}>
                  <SelectTrigger className="h-10 bg-white text-slate-900 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  value={row.amount || ""}
                  onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                  placeholder="$0"
                  className="h-10 text-right bg-white text-slate-900 border-slate-200"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                className="h-10 w-10 text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={addRow}
          className="w-full border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400">
          <Plus className="w-4 h-4 mr-2" />
          Agregar categoría
        </Button>

        {/* Total */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span
              className={cn(
                "text-lg font-bold",
                Math.abs(total - targetAmount) < 0.01
                  ? "text-emerald-600"
                  : "text-red-500"
              )}>
              ${total.toLocaleString("es-MX")}
            </span>
          </div>
          {Math.abs(total - targetAmount) >= 0.01 && (
            <p className="text-xs text-red-500 mt-1">
              Diferencia: $
              {Math.abs(total - targetAmount).toLocaleString("es-MX")}
            </p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-slate-600">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Check className="w-4 h-4 mr-2" />
            Confirmar División
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewWizard({
  transactions,
  events = [],
  goals = [],
  onComplete,
  onBack,
}: ReviewWizardProps) {
  // Detect ATM withdrawals and mark them
  const processedTransactions = useMemo(() => {
    return transactions.map((tx) => ({
      ...tx,
      is_cash_withdrawal: isATMWithdrawal(tx.description),
    }));
  }, [transactions]);

  // Group transactions by description
  const initialGroups = useMemo(() => {
    const groupMap = new Map<string, ParsedTransaction[]>();

    processedTransactions.forEach((tx) => {
      const key = tx.description.toLowerCase().trim();
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(tx);
    });

    return Array.from(groupMap.entries()).map(([key, txs]) => ({
      key,
      name: txs[0].description,
      category: txs[0].suggested_category,
      transactions: txs,
      totalAmount: txs.reduce((sum, t) => sum + t.amount, 0),
      approved: true,
      expanded: false,
    }));
  }, [processedTransactions]);

  const [groups, setGroups] = useState<TransactionGroup[]>(initialGroups);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ATM Split Modal state
  const [splitModalTx, setSplitModalTx] = useState<ParsedTransaction | null>(
    null
  );

  const currentGroup = groups[currentIndex];
  const isLastGroup = currentIndex === groups.length - 1;

  // Check if any transaction in current group is ATM
  const hasATMTransaction = currentGroup?.transactions.some(
    (tx) => tx.is_cash_withdrawal && !tx.splits
  );

  // Update group category
  const updateGroupCategory = (key: string, category: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.key === key
          ? {
              ...g,
              category,
              transactions: g.transactions.map((t) => ({
                ...t,
                suggested_category: category,
              })),
            }
          : g
      )
    );
  };

  // Toggle group approval
  const toggleApproval = (key: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, approved: !g.approved } : g))
    );
  };

  // Toggle expanded
  const toggleExpanded = (key: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.key === key ? { ...g, expanded: !g.expanded } : g))
    );
  };

  // Apply splits to a transaction
  const applySplits = (
    txId: string,
    splits: Array<{ amount: number; category: string }>
  ) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        transactions: g.transactions.map((t) =>
          t.id === txId ? { ...t, splits, transfer_to_cash_wallet: false } : t
        ),
      }))
    );
  };

  // Mark ATM withdrawal as transfer to Cash Wallet (not an expense)
  const markAsTransfer = (txId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        transactions: g.transactions.map((t) =>
          t.id === txId
            ? { ...t, transfer_to_cash_wallet: true, splits: undefined }
            : t
        ),
      }))
    );
  };

  // Assign event to a transaction
  const assignEvent = (txId: string, eventId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        transactions: g.transactions.map((t) =>
          t.id === txId ? { ...t, event_id: eventId || undefined } : t
        ),
      }))
    );
  };

  // Assign goal to a transaction
  const assignGoal = (txId: string, goalId: string) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        transactions: g.transactions.map((t) =>
          t.id === txId ? { ...t, goal_id: goalId || undefined } : t
        ),
      }))
    );
  };

  // Navigate
  const goNext = () => {
    if (!isLastGroup) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Complete
  const handleComplete = async () => {
    setIsSubmitting(true);
    const approved = groups
      .filter((g) => g.approved)
      .flatMap((g) => g.transactions);
    await onComplete(approved);
    setIsSubmitting(false);
  };

  const getCategoryStyle = (cat: string) => {
    return (
      CATEGORIES.find((c) => c.value === cat)?.color ||
      "bg-slate-100 text-slate-700"
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Revisar Transacciones
            </h2>
            <p className="text-sm text-slate-500">
              {currentIndex + 1} de {groups.length} grupos
            </p>
          </div>
          <div className="flex items-center gap-1">
            {groups.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentIndex
                    ? "bg-emerald-500"
                    : i < currentIndex
                      ? "bg-emerald-300"
                      : "bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGroup.key}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Card
              className={cn(
                "transition-all duration-200 bg-white border-slate-200",
                !currentGroup.approved && "opacity-60"
              )}>
              <CardContent className="p-5">
                {/* Group Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {currentGroup.name}
                      </h3>
                      {hasATMTransaction && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          💵 Efectivo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {currentGroup.transactions.length} transacción
                      {currentGroup.transactions.length > 1 ? "es" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        currentGroup.totalAmount < 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      )}>
                      $
                      {Math.abs(currentGroup.totalAmount).toLocaleString(
                        "es-MX"
                      )}
                    </p>
                  </div>
                </div>

                {/* ATM Decision Card - Show for single ATM withdrawals without decision */}
                {currentGroup.transactions.length === 1 &&
                  currentGroup.transactions[0].is_cash_withdrawal &&
                  !currentGroup.transactions[0].splits &&
                  !currentGroup.transactions[0].transfer_to_cash_wallet && (
                    <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-3 flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Retiro de Cajero Detectado
                      </p>
                      <p className="text-xs text-amber-700 mb-4">
                        ¿Qué hiciste con este dinero?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setSplitModalTx(currentGroup.transactions[0])
                          }
                          className="h-auto py-3 flex flex-col items-center gap-1 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300">
                          <ShoppingCart className="w-5 h-5" />
                          <span className="font-semibold">Lo Gasté</span>
                          <span className="text-[10px] text-slate-500">
                            Desglosar en categorías
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            markAsTransfer(currentGroup.transactions[0].id)
                          }
                          className="h-auto py-3 flex flex-col items-center gap-1 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300">
                          <Wallet className="w-5 h-5" />
                          <span className="font-semibold">A mi Billetera</span>
                          <span className="text-[10px] text-slate-500">
                            Guardé el efectivo
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Show transfer confirmation */}
                {currentGroup.transactions[0]?.transfer_to_cash_wallet && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Transferencia a Billetera
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Este dinero se sumará a tu saldo de efectivo disponible
                    </p>
                  </div>
                )}

                {/* Show splits if applied */}
                {currentGroup.transactions[0]?.splits && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-700 mb-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Desglose aplicado
                    </p>
                    <div className="space-y-1">
                      {currentGroup.transactions[0].splits.map((split, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600">
                            {
                              CATEGORIES.find((c) => c.value === split.category)
                                ?.label
                            }
                          </span>
                          <span className="font-medium text-slate-900">
                            ${split.amount.toLocaleString("es-MX")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Selector */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    Categoría
                  </label>
                  <Select
                    value={currentGroup.category}
                    onValueChange={(v) =>
                      updateGroupCategory(currentGroup.key, v)
                    }>
                    <SelectTrigger className="h-12 bg-white text-slate-900 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expand Details */}
                {currentGroup.transactions.length > 1 && (
                  <button
                    onClick={() => toggleExpanded(currentGroup.key)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-violet-600 font-medium hover:bg-violet-50 rounded-lg transition-colors">
                    {currentGroup.expanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ocultar detalles
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver {currentGroup.transactions.length} transacciones
                      </>
                    )}
                  </button>
                )}

                {/* Expanded Transactions */}
                <AnimatePresence>
                  {currentGroup.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        {currentGroup.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">
                                  {tx.date}
                                </span>
                                {tx.is_cash_withdrawal && (
                                  <Banknote className="w-4 h-4 text-amber-500" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "font-bold",
                                  tx.amount < 0
                                    ? "text-red-600"
                                    : "text-emerald-600"
                                )}>
                                ${Math.abs(tx.amount).toLocaleString("es-MX")}
                              </span>
                            </div>

                            {/* ATM Split button for individual transactions */}
                            {tx.is_cash_withdrawal && !tx.splits && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSplitModalTx(tx)}
                                className="w-full mb-3 border-violet-200 text-violet-600 hover:bg-violet-50">
                                <Scissors className="w-3 h-3 mr-1" />
                                Desglosar
                              </Button>
                            )}

                            {/* Show splits if applied */}
                            {tx.splits && (
                              <div className="mb-3 p-2 bg-emerald-50 rounded-lg text-xs">
                                <p className="font-medium text-emerald-700 mb-1">
                                  Desglosado:
                                </p>
                                {tx.splits.map((split, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between text-slate-600">
                                    <span>
                                      {
                                        CATEGORIES.find(
                                          (c) => c.value === split.category
                                        )?.label
                                      }
                                    </span>
                                    <span>
                                      ${split.amount.toLocaleString("es-MX")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Assignment Options for large transactions */}
                            {Math.abs(tx.amount) > 1000 &&
                              (events.length > 0 || goals.length > 0) && (
                                <div className="space-y-2 pt-3 border-t border-slate-200">
                                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-violet-500" />
                                    Asignar a evento o meta
                                  </p>

                                  {events.length > 0 && (
                                    <Select
                                      value={tx.event_id || ""}
                                      onValueChange={(v) =>
                                        assignEvent(tx.id, v)
                                      }>
                                      <SelectTrigger className="h-9 text-sm bg-white text-slate-900 border-slate-200">
                                        <Calendar className="w-3 h-3 mr-2" />
                                        <SelectValue placeholder="Evento..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="">
                                          Ninguno
                                        </SelectItem>
                                        {events.map((e) => (
                                          <SelectItem key={e.id} value={e.id}>
                                            {e.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}

                                  {goals.length > 0 && (
                                    <Select
                                      value={tx.goal_id || ""}
                                      onValueChange={(v) =>
                                        assignGoal(tx.id, v)
                                      }>
                                      <SelectTrigger className="h-9 text-sm bg-white text-slate-900 border-slate-200">
                                        <Target className="w-3 h-3 mr-2" />
                                        <SelectValue placeholder="Meta..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="">
                                          Ninguna
                                        </SelectItem>
                                        {goals.map((g) => (
                                          <SelectItem key={g.id} value={g.id}>
                                            {g.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant={currentGroup.approved ? "default" : "outline"}
                    className={cn(
                      "flex-1 h-12",
                      currentGroup.approved &&
                        "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                    onClick={() => {
                      if (!currentGroup.approved)
                        toggleApproval(currentGroup.key);
                      goNext();
                    }}>
                    <Check className="w-4 h-4 mr-2" />
                    {currentGroup.approved ? "Confirmado" : "Aprobar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={currentIndex === 0 ? onBack : goPrev}
            disabled={isSubmitting}
            className="flex-1 text-slate-600 border-slate-200">
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentIndex === 0 ? "Cancelar" : "Anterior"}
          </Button>

          {isLastGroup ? (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Guardar Todo
            </Button>
          ) : (
            <Button onClick={goNext} className="flex-1">
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-center text-sm text-slate-500">
          {groups.filter((g) => g.approved).length} grupos aprobados •{" "}
          {groups
            .filter((g) => g.approved)
            .reduce((sum, g) => sum + g.transactions.length, 0)}{" "}
          transacciones
        </div>
      </div>

      {/* ATM Split Modal */}
      {splitModalTx && (
        <ATMSplitModal
          transaction={splitModalTx}
          open={!!splitModalTx}
          onClose={() => setSplitModalTx(null)}
          onConfirm={(splits) => applySplits(splitModalTx.id, splits)}
        />
      )}
    </div>
  );
}
