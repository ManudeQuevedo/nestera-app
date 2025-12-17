"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatementUploaderForReview } from "@/components/importer/StatementUploaderForReview";
import { TransactionReviewWizard } from "@/components/importer/TransactionReviewWizard";
import { commitTransactions } from "@/actions/transaction-review";
import type { ReviewTransaction } from "@/hooks/useTransactionReview";
import { useRouter } from "next/navigation";

interface DashboardEmptyStateProps {
  userName?: string;
}

export function DashboardEmptyState({ userName }: DashboardEmptyStateProps) {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<
    ReviewTransaction[]
  >([]);

  // If we have parsed transactions, show review wizard
  if (parsedTransactions.length > 0) {
    return (
      <TransactionReviewWizard
        initialData={parsedTransactions}
        onBack={() => setParsedTransactions([])}
        onConfirm={async (txs, newCats) => {
          await commitTransactions(txs, newCats);
          router.refresh(); // Refresh to show transactions
        }}
      />
    );
  }

  // Show welcome state with upload CTA
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-xl w-full bg-white border-slate-200/50 shadow-xl">
        <CardContent className="p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <FileText className="w-10 h-10 text-white" />
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            ¡Bienvenido{userName ? `, ${userName}` : ""}!
          </h2>
          <p className="text-slate-500 mb-8 text-lg leading-relaxed">
            Para comenzar la magia, necesitamos tus datos financieros.
            <br />
            <span className="text-slate-400 text-sm">
              Sube un estado de cuenta y Gemini AI lo analizará.
            </span>
          </p>

          {/* Upload Area */}
          {showUploader ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6">
              <StatementUploaderForReview
                onSuccess={(transactions) => {
                  setParsedTransactions(transactions);
                }}
                onError={(error) => {
                  console.error("Upload error:", error);
                }}
              />
              <Button
                variant="ghost"
                onClick={() => setShowUploader(false)}
                className="mt-4 text-slate-400">
                Cancelar
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={() => setShowUploader(true)}
                className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-violet-500/20">
                <FileText className="w-5 h-5 mr-2" />
                Subir Estado de Cuenta (PDF)
              </Button>

              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                Powered by Gemini AI
              </p>
            </div>
          )}

          {/* Skip Option */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => router.push("/dashboard/transactions")}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto">
              O ingresa transacciones manualmente
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
