"use client";

import { motion } from "framer-motion";
import { ArrowUp, Minus } from "lucide-react";

interface ComparisonChartProps {
  labels: {
    banks: string;
    nestera: string;
  };
}

export function ComparisonChart({ labels }: ComparisonChartProps) {
  return (
    <div className="w-full max-w-sm h-72 bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden flex flex-col justify-end">
      {/* Background Grid - subtle */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Title/Legend - Optional context */}
      <div className="absolute top-6 left-0 right-0 text-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Growth Potential
        </span>
      </div>

      <div className="flex items-end justify-center w-full gap-8 h-48 relative z-10 px-4">
        {/* Bar A: Banks */}
        <div className="flex flex-col items-center gap-3 w-20">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-red-50 border border-red-100 px-2 py-1 rounded-md mb-1 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 whitespace-nowrap">
              <Minus className="w-3 h-3" />
              Comisiones
            </div>
          </motion.div>

          {/* The Bar */}
          <div className="w-14 relative group">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "40%" }} // ~30-40% height relative to container's available height space or fixed pixels? Using logical height here.
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="w-full bg-gradient-to-t from-red-600 via-red-500 to-red-400 rounded-t-lg relative overflow-hidden shadow-sm"
              style={{ height: 100 }} // Setting explicit pixels for the animation target if % is tricky in flex column without h-full wrapper.
              // Actually, let's use explicit constraints for better animation control.
              // We will override style logic slightly with variants.
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-red-300/50" />
            </motion.div>
          </div>

          {/* Label */}
          <div className="text-xs font-bold text-slate-500 tracking-wide">
            {labels.banks}
          </div>
        </div>

        {/* Bar B: Nestera */}
        <div className="flex flex-col items-center gap-3 w-20">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md mb-1 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 whitespace-nowrap">
              <ArrowUp className="w-3 h-3" />
              100% Tuyo
            </div>
          </motion.div>

          {/* The Bar */}
          <div className="w-14 relative group">
            {/* Glow effect behind */}
            <div className="absolute inset-x-0 bottom-0 h-[120%] bg-emerald-200/50 blur-xl rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: 160 }} // Tall height (approx 85% of 192px [h-48])
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-lg relative overflow-hidden z-10 shadow-lg shadow-emerald-500/20">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-100/50" />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />
            </motion.div>
          </div>

          {/* Label */}
          <div className="text-xs font-bold text-emerald-700 tracking-wide">
            {labels.nestera}
          </div>
        </div>
      </div>

      {/* Baseline */}
      <div className="absolute bottom-8 left-8 right-8 h-px bg-slate-200" />
    </div>
  );
}
