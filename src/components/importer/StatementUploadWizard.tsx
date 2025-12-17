"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  selected: boolean;
}

interface TransactionGroup {
  description: string;
  category: string;
  transactions: ParsedTransaction[];
  totalAmount: number;
  approved: boolean;
}

type WizardStep = "upload" | "parsing" | "review" | "committing" | "complete";

// Category options
const CATEGORIES = [
  { value: "Housing", label: "🏠 Vivienda" },
  { value: "Food", label: "🍽️ Comida" },
  { value: "Transport", label: "🚗 Transporte" },
  { value: "Entertainment", label: "🎬 Entretenimiento" },
  { value: "Shopping", label: "🛍️ Compras" },
  { value: "Subscriptions", label: "📺 Suscripciones" },
  { value: "Services", label: "⚡ Servicios" },
  { value: "Health", label: "🏥 Salud" },
  { value: "Education", label: "📚 Educación" },
  { value: "Income", label: "💰 Ingreso" },
  { value: "Other", label: "📦 Otro" },
];

interface StatementUploadWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export function StatementUploadWizard({
  onComplete,
  onCancel,
}: StatementUploadWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [error, setError] = useState<string | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.type.includes("pdf")) {
      setError("Solo se aceptan archivos PDF");
      return;
    }

    setStep("parsing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-statement", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al procesar el archivo");
      }

      const data = await response.json();

      // Group transactions by description for smart review
      const transactionGroups = groupTransactions(data.transactions);
      setGroups(transactionGroups);
      setImportId(data.importId); // Backend should create a bank_import record
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep("upload");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  // Group transactions by similar description
  const groupTransactions = (
    transactions: ParsedTransaction[]
  ): TransactionGroup[] => {
    const groupMap = new Map<string, ParsedTransaction[]>();

    transactions.forEach((tx) => {
      // Normalize description for grouping
      const key = tx.description.toLowerCase().replace(/\d+/g, "").trim();
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push({ ...tx, selected: true });
    });

    return Array.from(groupMap.entries()).map(([key, txs]) => ({
      description: txs[0].description,
      category: txs[0].category,
      transactions: txs,
      totalAmount: txs.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      approved: true,
    }));
  };

  // Handle group category change
  const handleGroupCategoryChange = (groupDesc: string, category: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.description === groupDesc
          ? {
              ...g,
              category,
              transactions: g.transactions.map((t) => ({ ...t, category })),
            }
          : g
      )
    );
  };

  // Toggle group approval
  const toggleGroupApproval = (groupDesc: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.description === groupDesc
          ? {
              ...g,
              approved: !g.approved,
              transactions: g.transactions.map((t) => ({
                ...t,
                selected: !g.approved,
              })),
            }
          : g
      )
    );
  };

  // Commit approved transactions
  const handleCommit = async () => {
    setStep("committing");

    try {
      const approvedTransactions = groups
        .filter((g) => g.approved)
        .flatMap((g) => g.transactions.filter((t) => t.selected));

      const response = await fetch("/api/commit-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          importId,
          transactions: approvedTransactions,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar transacciones");
      }

      setStep("complete");
      setTimeout(onComplete, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setStep("review");
    }
  };

  const totalSelected = groups
    .filter((g) => g.approved)
    .reduce(
      (sum, g) => sum + g.transactions.filter((t) => t.selected).length,
      0
    );

  const totalAmount = groups
    .filter((g) => g.approved)
    .reduce(
      (sum, g) =>
        sum +
        g.transactions
          .filter((t) => t.selected)
          .reduce((s, t) => s + Math.abs(t.amount), 0),
      0
    );

  return (
    <div className="min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-6">
            <div
              {...getRootProps()}
              className={cn(
                "w-full max-w-md p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                isDragActive
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              )}>
              <input {...getInputProps()} />
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Arrastra tu estado de cuenta
                </h3>
                <p className="text-sm text-slate-500">
                  O haz clic para seleccionar un archivo PDF
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="mt-6">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </motion.div>
        )}

        {/* STEP 2: PARSING */}
        {step === "parsing" && (
          <motion.div
            key="parsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Gemini está analizando...
            </h3>
            <p className="text-slate-500">
              Extrayendo y categorizando transacciones
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-violet-500 mt-4" />
          </motion.div>
        )}

        {/* STEP 3: REVIEW (Mobile-Optimized Groups) */}
        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-900">
                Revisa tus transacciones
              </h2>
              <p className="text-sm text-slate-500">
                {groups.length} grupos encontrados • {totalSelected}{" "}
                seleccionadas
              </p>
            </div>

            {/* Smart Groups */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {groups.map((group) => (
                <Card
                  key={group.description}
                  className={cn(
                    "transition-all",
                    !group.approved && "opacity-50"
                  )}>
                  <CardContent className="p-4">
                    {/* Group Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={group.approved}
                          onCheckedChange={() =>
                            toggleGroupApproval(group.description)
                          }
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {group.description}
                          </p>
                          <p className="text-xs text-slate-500">
                            {group.transactions.length} transacciones
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">
                          ${group.totalAmount.toLocaleString("es-MX")}
                        </p>
                      </div>
                    </div>

                    {/* Category Selector */}
                    <Select
                      value={group.category}
                      onValueChange={(v) =>
                        handleGroupCategoryChange(group.description, v)
                      }>
                      <SelectTrigger className="h-10 text-sm">
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

                    {/* Expand to see individual transactions */}
                    {group.transactions.length > 1 && (
                      <button
                        onClick={() =>
                          setExpandedGroup(
                            expandedGroup === group.description
                              ? null
                              : group.description
                          )
                        }
                        className="mt-3 text-xs text-violet-600 font-medium">
                        {expandedGroup === group.description
                          ? "Ocultar detalles"
                          : "Ver detalles"}
                      </button>
                    )}

                    {/* Individual Transactions */}
                    {expandedGroup === group.description && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {group.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 truncate">
                              {tx.date}
                            </span>
                            <span className="font-medium">
                              ${Math.abs(tx.amount).toLocaleString("es-MX")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">
                  Total a importar:
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  ${totalAmount.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("upload")}
                  className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
                <Button
                  onClick={handleCommit}
                  disabled={totalSelected === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Importar {totalSelected}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: COMMITTING */}
        {step === "committing" && (
          <motion.div
            key="committing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">
              Guardando transacciones...
            </h3>
          </motion.div>
        )}

        {/* STEP 5: COMPLETE */}
        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              ¡Importación completa!
            </h3>
            <p className="text-slate-500">
              {totalSelected} transacciones guardadas
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
