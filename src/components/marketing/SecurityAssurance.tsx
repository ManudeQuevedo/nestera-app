"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, EyeOff, Server } from "lucide-react";

export function SecurityAssurance() {
  const t = useTranslations("LandingPage.Security");

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">{t("title")}</h2>
          <p className="mt-4 text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Encryption */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t("encryption.title")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t("encryption.description")}
            </p>
          </div>

          {/* Privacy */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <EyeOff className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t("privacy.title")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t("privacy.description")}
            </p>
          </div>

          {/* Availability */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Server className="w-6 h-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {t("availability.title")}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t("availability.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
