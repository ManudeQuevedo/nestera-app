"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { logCashExpense } from "@/actions/commit-import";

interface QuickCashButtonProps {
  onSuccess?: () => void;
  className?: string;
}

// Quick category tiles for cash expenses
const QUICK_CATEGORIES = [
  { value: "Food", label: "🍽️", name: "Comida" },
  { value: "Transport", label: "🚗", name: "Transporte" },
  { value: "Shopping", label: "🛍️", name: "Compras" },
  { value: "Pocket", label: "💵", name: "Efectivo" },
  { value: "Other", label: "📦", name: "Otro" },
];

export function QuickCashButton({
  onSuccess,
  className,
}: QuickCashButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !category) return;

    setIsSubmitting(true);
    const result = await logCashExpense(parseFloat(amount), category);
    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setShowSuccess(false);
        setAmount("");
        setCategory(null);
        onSuccess?.();
      }, 1000);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setModalOpen(false);
      setAmount("");
      setCategory(null);
      setShowSuccess(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        className={cn(
          "fixed bottom-24 right-20 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-amber-500 to-amber-600",
          "shadow-lg shadow-amber-500/30",
          "flex items-center justify-center",
          "text-white",
          "active:scale-95 transition-transform",
          // Hide on desktop
          "md:hidden",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}>
        <Banknote className="w-6 h-6" />
      </motion.button>

      <Dialog open={modalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900">¡Guardado!</h3>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-slate-900">
                    <Banknote className="w-5 h-5 text-amber-500" />
                    Gasté Efectivo
                  </DialogTitle>
                  <DialogDescription className="text-slate-500">
                    Registra un gasto en efectivo rápidamente
                  </DialogDescription>
                </DialogHeader>

                {/* Amount Input */}
                <div className="mt-6">
                  <label className="text-xs font-medium text-slate-500 mb-2 block">
                    ¿Cuánto gastaste?
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                      $
                    </span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="h-16 text-3xl font-bold text-center bg-white text-slate-900 border-slate-200 pl-8"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Category Quick Select */}
                <div className="mt-6">
                  <label className="text-xs font-medium text-slate-500 mb-3 block">
                    ¿En qué lo gastaste?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {QUICK_CATEGORIES.map((cat) => (
                      <motion.button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex flex-col items-center justify-center",
                          "py-3 px-2 rounded-xl transition-all",
                          "border-2",
                          category === cat.value
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        )}>
                        <span className="text-2xl mb-1">{cat.label}</span>
                        <span className="text-[10px] font-medium text-slate-600">
                          {cat.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!amount || !category || isSubmitting}
                  className="w-full h-12 mt-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
