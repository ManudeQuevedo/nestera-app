"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTransaction } from "@/actions/transactions";

const QUICK_CATEGORIES = [
  { value: "Food", label: "🍽️ Comida" },
  { value: "Transport", label: "🚗 Transporte" },
  { value: "Shopping", label: "🛍️ Compras" },
  { value: "Services", label: "⚡ Servicios" },
  { value: "Entertainment", label: "🎬 Entretenimiento" },
  { value: "Health", label: "🏥 Salud" },
  { value: "Other", label: "📦 Otro" },
];

interface ManualTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ManualTransactionModal({
  open,
  onOpenChange,
  onSuccess,
}: ManualTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reset = () => {
    setType("expense");
    setAmount("");
    setDescription("");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("date", date);
      formData.append("description", description || category);
      formData.append("type", type);
      // Note: source='manual', is_verified=false will be set by server

      await createTransaction(formData);

      setShowSuccess(true);
      setTimeout(() => {
        reset();
        onOpenChange(false);
        onSuccess?.();
      }, 1000);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Transacción</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-bold text-slate-900">¡Guardado!</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                    type === "expense"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500"
                  )}>
                  <Minus className="w-4 h-4" />
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                    type === "income"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500"
                  )}>
                  <Plus className="w-4 h-4" />
                  Ingreso
                </button>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-xs text-slate-500">Monto</Label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    $
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-3xl font-bold h-16 text-center"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category (only for expenses) */}
              {type === "expense" && (
                <div>
                  <Label className="text-xs text-slate-500">Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUICK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description */}
              <div>
                <Label className="text-xs text-slate-500">
                  Descripción (opcional)
                </Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Café con amigos"
                  className="mt-1"
                />
              </div>

              {/* Date */}
              <div>
                <Label className="text-xs text-slate-500">Fecha</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !amount}
                className={cn(
                  "w-full h-12 text-lg font-bold",
                  type === "expense"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}>
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Guardar"
                )}
              </Button>

              {/* Manual Badge Notice */}
              <p className="text-xs text-center text-slate-400">
                Esta transacción será marcada como "manual" hasta que subas un
                estado de cuenta que la confirme.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
