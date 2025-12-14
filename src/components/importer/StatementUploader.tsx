"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Building2,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ExtractedTransaction } from "@/actions/statement-parser";
import {
  bulkImportTransactions,
  type TransactionImport,
} from "@/actions/import";

const CATEGORIES = [
  { value: "Housing", label: "🏠 Vivienda", labelEn: "🏠 Housing" },
  { value: "Food", label: "🍽️ Comida", labelEn: "🍽️ Food" },
  { value: "Transport", label: "🚗 Transporte", labelEn: "🚗 Transport" },
  {
    value: "Entertainment",
    label: "🎬 Entretenimiento",
    labelEn: "🎬 Entertainment",
  },
  { value: "Shopping", label: "🛍️ Compras", labelEn: "🛍️ Shopping" },
  { value: "Services", label: "⚡ Servicios", labelEn: "⚡ Services" },
  { value: "Health", label: "🏥 Salud", labelEn: "🏥 Health" },
  { value: "Education", label: "📚 Educación", labelEn: "📚 Education" },
  { value: "Other", label: "📦 Otro", labelEn: "📦 Other" },
];

interface StatementUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ParsedTransaction = ExtractedTransaction & {
  category: string;
  selected: boolean;
};

export function StatementUploader({
  isOpen,
  onClose,
  onSuccess,
}: StatementUploaderProps) {
  const t = useTranslations("Common");
  const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const resetState = () => {
    setStep("upload");
    setTransactions([]);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setError(null);
    setStep("scanning");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-statement", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to parse statement");
      }

      if (result.transactions.length === 0) {
        throw new Error(
          "No se encontraron transacciones en el estado de cuenta."
        );
      }

      // Transform to parsed transactions with category
      const parsedTx: ParsedTransaction[] = result.transactions.map(
        (tx: ExtractedTransaction) => ({
          ...tx,
          category: tx.suggestedCategory || "Other",
          selected: true,
        })
      );

      setTransactions(parsedTx);
      setStep("review");
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "Error al procesar el archivo"
      );
      setStep("upload");
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    [handleFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const toggleTransaction = (index: number) => {
    setTransactions((prev) =>
      prev.map((tx, i) =>
        i === index ? { ...tx, selected: !tx.selected } : tx
      )
    );
  };

  const updateCategory = (index: number, category: string) => {
    setTransactions((prev) =>
      prev.map((tx, i) => (i === index ? { ...tx, category } : tx))
    );
  };

  const selectedCount = transactions.filter((tx) => tx.selected).length;

  const handleImport = async () => {
    setIsImporting(true);

    try {
      const selectedTx = transactions.filter((tx) => tx.selected);

      const transactionsToImport: TransactionImport[] = selectedTx.map(
        (tx) => ({
          date: tx.date,
          description: tx.concept,
          amount: Math.abs(tx.amount),
          type: tx.amount < 0 ? "expense" : "income",
          category: tx.category,
          payment_method: tx.isMSI ? "MSI" : undefined,
        })
      );

      const result = await bulkImportTransactions(transactionsToImport);

      if (result.success) {
        handleClose();
        onSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Importar Estado de Cuenta
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Sube tu estado de cuenta en PDF para extraer las transacciones automáticamente con IA."}
            {step === "scanning" &&
              "Analizando el documento con inteligencia artificial..."}
            {step === "review" &&
              `Se encontraron ${transactions.length} transacciones. Revisa y ajusta antes de importar.`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-muted-foreground/25 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}>
            <input {...getInputProps()} />
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? "Suelta el archivo aquí"
                : "Arrastra tu Estado de Cuenta (PDF)"}
            </p>
            <p className="text-sm text-muted-foreground">
              Compatible con BBVA, Santander, Banorte, Citibanamex y más
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        )}

        {/* Step 2: Scanning */}
        {step === "scanning" && (
          <div className="py-16 text-center">
            <div className="relative h-20 w-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-ping opacity-25" />
              <div className="relative h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">
              Escaneando documento...
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Extrayendo transacciones con inteligencia artificial
            </p>
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-blue-500" />
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="space-y-4">
            {/* Summary Card */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {transactions.filter((tx) => tx.amount > 0).length}
                  </p>
                  <p className="text-xs text-emerald-600/70">Ingresos</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {transactions.filter((tx) => tx.amount < 0).length}
                  </p>
                  <p className="text-xs text-red-600/70">Gastos</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedCount}
                  </p>
                  <p className="text-xs text-blue-600/70">Seleccionados</p>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        "cursor-pointer",
                        !tx.selected && "opacity-50"
                      )}
                      onClick={() => toggleTransaction(idx)}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={tx.selected}
                          onChange={() => toggleTransaction(idx)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="text-sm">{tx.date}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{tx.concept}</p>
                        {tx.isMSI && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                            MSI
                          </span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={tx.category}
                          onValueChange={(v) => updateCategory(idx, v)}>
                          <SelectTrigger className="w-36 h-8 text-xs">
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
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          tx.amount < 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                        {tx.amount < 0 ? "-" : "+"}$
                        {Math.abs(tx.amount).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>

          {step === "review" && (
            <Button
              onClick={handleImport}
              disabled={isImporting || selectedCount === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600">
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Importar {selectedCount} Transacciones
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
