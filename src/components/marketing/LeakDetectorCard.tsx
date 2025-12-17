"use client";

import { motion, Variants } from "framer-motion";
import { AlertTriangle, Coffee, CreditCard, ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";

export function LeakDetectorCard() {
  const t = useTranslations("Landing.premium.leakDetector");

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Scanning Line Animation */}
      <motion.div
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatType: "reverse",
        }}
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent z-20 opacity-50"
      />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {t("activeScan")}
            </span>
          </div>
          <ScanLine className="h-4 w-4 text-slate-400" />
        </div>

        {/* Content List */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="p-6 space-y-4">
          {/* Item 1 */}
          <motion.div
            variants={itemVariant}
            className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors group shadow-sm">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100 group-hover:border-red-200 transition-colors">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {t("forgottenSub")}
                </p>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 shadow-sm border border-red-200">
                  {t("detected")}
                </span>
              </div>
              <p className="text-xs text-slate-500">{t("streaming")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">-$299</p>
              <p className="text-[10px] text-slate-400">MXN</p>
            </div>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            variants={itemVariant}
            className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors group shadow-sm">
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100 group-hover:border-orange-200 transition-colors">
              <Coffee className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {t("antExpenses")}
              </p>
              <p className="text-xs text-slate-500">{t("weeklyAvg")}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-orange-600">-$850</p>
              <p className="text-[10px] text-slate-400">MXN</p>
            </div>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            variants={itemVariant}
            className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group shadow-sm">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:border-blue-200 transition-colors">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {t("msiRemaining")}
              </p>
              <p className="text-xs text-slate-500">
                {t("paymentsOf", { current: 12, total: 18 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">-$1,200</p>
              <p className="text-[10px] text-slate-400">MXN</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer/Summary */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500">{t("totalWaste")}</span>
          <span className="text-sm font-bold text-red-600">
            -$2,349.00 {t("perMonth")}
          </span>
        </div>
      </div>
    </div>
  );
}
