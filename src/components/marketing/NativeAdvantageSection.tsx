"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Shield,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComparisonChart } from "./ComparisonChart";

// --- Visual Assets (Inline SVGs/Components) ---

const MexicoMapShield = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-emerald-500 opacity-20 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
    style={{ animationDuration: "4s" }}>
    {/* Stylized Shield Shape */}
    <path
      fill="currentColor"
      d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z"
    />
    {/* Abstract Map Inside */}
    <path
      fill="white"
      fillOpacity="0.3"
      d="M30 30 L40 25 L60 30 L70 50 L60 70 L40 65 L30 50 Z"
    />
  </svg>
);

const FiscalCard = ({ title }: { title: string }) => (
  <div className="relative w-64 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
        SAT Intel
      </div>
    </div>
    <div className="text-white font-bold text-lg mb-1">{title}</div>
    <div className="text-slate-400 text-xs flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" /> +$4,200 MXN recuperables
    </div>
    {/* Glass Reflection */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
  </div>
);

export function NativeAdvantageSection() {
  const t = useTranslations("Landing.premium.nativeAdvantage");

  const sections = [
    {
      id: "origin",
      badge: t("badge"),
      visual: (
        <div className="relative w-full h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="relative z-10 w-64 h-full bg-slate-950 border border-slate-800 rounded-[3rem] shadow-2xl p-2 flex flex-col items-center overflow-hidden">
            {/* Mock Phone UI */}
            <div className="w-32 h-6 bg-slate-900 rounded-b-xl absolute top-0" />
            <div className="mt-12 w-full px-4">
              <div className="h-32 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4">
                <MexicoMapShield />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "intelligence",
      visual: (
        <div className="relative w-full h-[300px] flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[50px]" />
          </div>
          <FiscalCard title={t("intelligence.cardTitle")} />
        </div>
      ),
    },
    {
      id: "offer",
      visual: (
        <div className="relative w-full h-[300px] flex items-center justify-center">
          <ComparisonChart
            labels={{
              banks: t("offer.chart.banks"),
              nestera: t("offer.chart.nestera"),
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 bg-slate-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-32">
        {sections.map((section, index) => {
          const isEven = index % 2 === 0;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${
                isEven ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12 md:gap-24`}>
              {/* Text Content */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                {section.badge && (
                  <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-2">
                    {section.badge}
                  </span>
                )}

                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  {/* Access nested keys dynamically or strictly */}
                  {index === 0
                    ? t("origin.title")
                    : index === 1
                    ? t("intelligence.title")
                    : t("offer.title")}
                </h3>

                <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg mx-auto md:mx-0">
                  {index === 0
                    ? t("origin.body")
                    : index === 1
                    ? t("intelligence.body")
                    : t("offer.body")}
                </p>

                <div className="pt-4">
                  <Button
                    variant="link"
                    className="text-white hover:text-emerald-400 p-0 h-auto font-bold uppercase tracking-wide text-sm group">
                    {t("cta")}{" "}
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              {/* Visual Content */}
              <div className="flex-1 w-full flex justify-center">
                {section.visual}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
