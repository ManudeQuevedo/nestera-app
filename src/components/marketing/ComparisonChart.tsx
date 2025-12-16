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
    <div className="w-full max-w-sm h-72 bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 border border-white/5 relative overflow-hidden flex flex-col justify-end">
      {/* Background Grid - subtle */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Title/Legend - Optional context */}
      <div className="absolute top-6 left-0 right-0 text-center">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
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
            className="bg-red-950/50 border border-red-500/20 px-2 py-1 rounded-md mb-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 whitespace-nowrap">
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
              className="w-full bg-gradient-to-t from-red-950 via-red-900 to-red-500 rounded-t-lg relative overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              style={{ height: 100 }} // Setting explicit pixels for the animation target if % is tricky in flex column without h-full wrapper.
              // Actually, let's use explicit constraints for better animation control.
              // We will override style logic slightly with variants.
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-red-400/50" />
            </motion.div>
          </div>

          {/* Label */}
          <div className="text-xs font-bold text-red-500/80 tracking-wide">
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
            className="bg-emerald-950/50 border border-emerald-400/30 px-2 py-1 rounded-md mb-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 whitespace-nowrap">
              <ArrowUp className="w-3 h-3" />
              100% Tuyo
            </div>
          </motion.div>

          {/* The Bar */}
          <div className="w-14 relative group">
            {/* Glow effect behind */}
            <div className="absolute inset-x-0 bottom-0 h-[120%] bg-emerald-500/20 blur-xl rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: 160 }} // Tall height (approx 85% of 192px [h-48])
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              className="w-full bg-gradient-to-t from-emerald-950 via-emerald-800 to-emerald-400 rounded-t-lg relative overflow-hidden z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-emerald-200/50" />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent opacity-50" />
            </motion.div>
          </div>

          {/* Label */}
          <div className="text-xs font-bold text-emerald-400 tracking-wide">
            {labels.nestera}
          </div>
        </div>
      </div>

      {/* Baseline */}
      <div className="absolute bottom-8 left-8 right-8 h-px bg-white/10" />
    </div>
  );
}
