"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewTransaction } from "@/hooks/useTransactionReview";

interface StatementUploaderForReviewProps {
  onSuccess: (transactions: ReviewTransaction[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

/**
 * A statement uploader that parses PDFs with Gemini AI
 * and returns the parsed transactions for review (does NOT save to DB)
 */
export function StatementUploaderForReview({
  onSuccess,
  onError,
  className,
}: StatementUploaderForReviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Call the parse-statement API
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

        // Transform to ReviewTransaction format
        const reviewTransactions: ReviewTransaction[] = result.transactions.map(
          (tx: any, index: number) => ({
            id: `tx-${index}-${Date.now()}`,
            date: tx.date,
            description: tx.concept,
            amount: tx.amount,
            type: tx.amount < 0 ? "expense" : "income",
            category: tx.suggestedCategory || "Other",
            suggestedCategory: tx.suggestedCategory || "Other",
            selected: true,
            isMSI: tx.isMSI || false,
          })
        );

        onSuccess(reviewTransactions);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al procesar el archivo";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [onSuccess, onError]
  );

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
    disabled: isUploading,
  });

  return (
    <div className={className}>
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Zone */}
      {isUploading ? (
        <div className="border-2 border-dashed border-violet-300 bg-violet-50/50 rounded-xl p-8 text-center">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-ping opacity-25" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <FileText className="h-7 w-7 text-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-violet-700 mb-2">
            Analizando con Gemini AI...
          </p>
          <p className="text-xs text-violet-500">
            Extrayendo transacciones del PDF
          </p>
          <Loader2 className="h-5 w-5 mx-auto mt-4 animate-spin text-violet-500" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group",
            isDragActive
              ? "border-violet-500 bg-violet-50"
              : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/50"
          )}>
          <input {...getInputProps()} />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">
            {isDragActive
              ? "Suelta el archivo aquí"
              : "Haz clic o arrastra tu estado de cuenta"}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            PDF de BBVA, Santander, Banorte, Citibanamex y más
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
