"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ManualTransactionModal } from "@/components/transactions/ManualTransactionModal";
import { cn } from "@/lib/utils";

interface QuickAddButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function QuickAddButton({ onSuccess, className }: QuickAddButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        className={cn(
          "fixed bottom-24 right-4 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-emerald-500 to-emerald-600",
          "shadow-lg shadow-emerald-500/30",
          "flex items-center justify-center",
          "text-white",
          "active:scale-95 transition-transform",
          // Hide on desktop (sidebar has quick actions)
          "md:hidden",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}>
        <Plus className="w-6 h-6" />
      </motion.button>

      <ManualTransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
