"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

// --- 1. EDUCATION VISUAL ---
export function EducationVisual() {
  const t = useTranslations("Landing.visuals.education");

  return (
    <div className="relative w-full h-full bg-slate-50/50 flex items-center justify-center overflow-hidden">
      {/* Background Graph */}
      <svg
        className="absolute inset-0 w-full h-full text-emerald-100/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        preserveAspectRatio="none">
        <motion.path
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d="M0 200 C 100 180, 200 100, 400 50"
        />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/0 to-slate-50 pointer-events-none" />

      {/* Floating Card */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-64 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/50 ring-1 ring-slate-200/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            {t("tipTitle")}
          </span>
        </div>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          {t("tipBody")}
        </p>
      </motion.div>
    </div>
  );
}

// --- 2. AUTOMATION VISUAL ---
export function AutomationVisual() {
  const t = useTranslations("Landing.visuals.automation");

  return (
    <div className="relative w-full h-full bg-slate-50/50 flex items-center justify-center overflow-hidden px-4">
      <div className="flex items-center gap-2 sm:gap-6 w-full max-w-sm">
        {/* Wallet (Source) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-slate-100 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-slate-400" />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {t("income")}
          </span>
        </motion.div>

        {/* Animated Connector */}
        <div className="flex-1 h-px bg-slate-200 relative">
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            whileInView={{ x: "0%", opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              repeatDelay: 0.5,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-0 -translate-y-1/2">
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
              {t("badge")}
            </div>
          </motion.div>
        </div>

        {/* Piggy Bank (Target) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-center ring-4 ring-emerald-50/50">
            <PiggyBank className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {t("savings")}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// --- 3. SECURITY VISUAL ---
export function SecurityVisual() {
  const t = useTranslations("Landing.visuals.security");
  const checks = ["encryption", "biometrics", "anonymous"];

  return (
    <div className="relative w-full h-full bg-slate-50/50 flex items-center justify-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Main Shield */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200/50">
          <ShieldCheck className="w-10 h-10 text-white" />
        </motion.div>

        {/* Checklist */}
        <div className="space-y-3">
          {checks.map((key, i) => (
            <motion.div
              key={key}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {t(key as any)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-64 h-64 border border-slate-200 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-48 h-48 border border-slate-200 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
      </div>
    </div>
  );
}
