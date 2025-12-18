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
    className="w-full h-full text-emerald-500 opacity-80 drop-shadow-md animate-pulse"
    style={{ animationDuration: "4s" }}>
    {/* Stylized Shield Shape */}
    <path
      fill="currentColor"
      fillOpacity="0.1"
      stroke="currentColor"
      strokeWidth="2"
      d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z"
    />
    {/* Abstract Map Inside */}
    <path
      fill="#64748b" // slate-500
      fillOpacity="0.2"
      d="M30 30 L40 25 L60 30 L70 50 L60 70 L40 65 L30 50 Z"
    />
  </svg>
);

const FiscalCard = ({ title }: { title: string }) => (
  <div className="relative w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200/50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
      </div>
      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
        SAT Intel
      </div>
    </div>
    <div className="text-slate-900 font-bold text-lg mb-1">{title}</div>
    <div className="text-slate-500 text-xs flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> +$4,200 MXN
      recuperables
    </div>
    {/* Glossy Reflection */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
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
          {/* Phone Mockup - Light Mode */}
          <div className="relative z-10 w-64 h-full bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-300/50 p-2 flex flex-col items-center overflow-hidden">
            {/* Dynamic Island / Notch Area */}
            <div className="w-32 h-6 bg-slate-100 rounded-b-xl absolute top-0" />
            <div className="mt-12 w-full px-4">
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <MexicoMapShield />
              </div>
              {/* Fake UI Lines */}
              <div className="w-3/4 h-2 bg-slate-100 rounded-full mb-2" />
              <div className="w-1/2 h-2 bg-slate-100 rounded-full" />
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
            <div className="w-[300px] h-[300px] bg-emerald-100/30 rounded-full blur-[50px]" />
          </div>
          <FiscalCard title={t("intelligence.cardTitle")} />
        </div>
      ),
    },
    {
      id: "offer",
      visual: (
        <div className="relative w-full h-[300px] flex items-center justify-center">
          {/* Note: ComparisonChart needs to be compatible with light mode or transparent */}
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
    <section
      id="solution"
      className="py-24 px-6 md:px-12 bg-slate-50 relative overflow-hidden">
      {/* Subtle Engineering Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-32 relative z-10">
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
                  <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold tracking-widest uppercase mb-2 shadow-sm">
                    {section.badge}
                  </span>
                )}

                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  {/* Access nested keys dynamically or strictly */}
                  {index === 0
                    ? t("origin.title")
                    : index === 1
                      ? t("intelligence.title")
                      : t("offer.title")}
                </h3>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                  {index === 0
                    ? t("origin.body")
                    : index === 1
                      ? t("intelligence.body")
                      : t("offer.body")}
                </p>

                <div className="pt-4">
                  <Button
                    variant="link"
                    className="text-emerald-700 hover:text-emerald-800 p-0 h-auto font-bold uppercase tracking-wide text-sm group">
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
