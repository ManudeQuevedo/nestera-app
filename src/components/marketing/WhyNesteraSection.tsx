"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LeakDetectorCard } from "@/components/marketing/LeakDetectorCard";

export function WhyNesteraSection() {
  const t = useTranslations("Landing");

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* PART 1: PHILOSOPHY (Manifesto) */}
        <div className="text-center max-w-4xl mx-auto mb-20 md:mb-32">
          {/* Badge/Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-sm font-semibold tracking-wide uppercase">
              {t("philosophy.badge")}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
            {t("manifesto.headline")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {t("manifesto.body")}
          </motion.p>
        </div>

        {/* PART 2: REALITY CHECK (Problem) */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: The Pain Point */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                {t("problem.title")}
              </h3>
              <div className="w-20 h-1.5 bg-emerald-500 rounded-full" />
            </div>

            <p className="text-lg text-slate-600 leading-relaxed">
              {t("problem.description")}
            </p>

            {/* The Investment Kick */}
            <div className="p-6 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl">
              <p className="text-lg font-medium text-emerald-900 italic">
                "{t("problem.investmentKick")}"
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-8 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                {t("problem.stats.lostLabel")}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                {t("problem.stats.subscriptionsLabel")}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Proof (Leak Detector) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Decorative background blob behind the card */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-60" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-60" />

              <div className="relative">
                <LeakDetectorCard />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
