"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Zap, Users, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function PricingSection() {
  const t = useTranslations("Landing.pricing");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly"
  );

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tiers = [
    {
      key: "free",
      icon: Leaf,
      monthlyPrice: 0,
      yearlyTotal: 0,
      monthlyEquivalent: 0,
      color: "bg-slate-100 dark:bg-slate-800",
      accent: "text-slate-600 dark:text-slate-400",
      buttonVariant: "outline" as const,
      features: ["tracking", "charts", "users"],
    },
    {
      key: "pro",
      icon: Zap,
      monthlyPrice: 169,
      yearlyTotal: 129 * 12, // $1,548/year (saves vs. $169 × 12 = $2,028)
      monthlyEquivalent: 129,
      color:
        "bg-white dark:bg-slate-900 border-emerald-500 ring-4 ring-emerald-500/10",
      accent: "text-emerald-500",
      popular: true,
      buttonVariant: "default" as const,
      features: ["ai", "import", "history", "users"],
    },
    {
      key: "familyPlus",
      icon: Users,
      monthlyPrice: 249,
      yearlyTotal: 199 * 12, // $2,388/year (saves vs. $249 × 12 = $2,988)
      monthlyEquivalent: 199,
      color:
        "bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border-blue-500",
      accent: "text-blue-500",
      buttonVariant: "default" as const,
      features: ["mealPlanner", "groceryList", "calendar", "users"],
    },
  ];

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section
      id="pricing"
      className="py-24 px-4 bg-slate-50/50 dark:bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-medium tracking-tight mb-4 text-slate-900 dark:text-white">
            {t("title")}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            {t("subtitle")}
          </motion.p>

          {/* Billing Cycle Toggle */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-full relative">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all relative z-10",
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}>
              {t("billing.monthly")}
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all relative z-10 flex items-center gap-2",
                billingCycle === "yearly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}>
              {t("billing.yearly")}
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t("billing.save")}
              </span>
            </button>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-3xl p-8 shadow-xl transition-all hover:-translate-y-1 duration-300",
                tier.color,
                tier.popular
                  ? "z-10 scale-105 border-2 md:-mt-4"
                  : "border border-slate-200 dark:border-white/10"
              )}>
              {tier.popular && (
                <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {t(`${tier.key}.badge`)}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <tier.icon className={cn("h-5 w-5", tier.accent)} />
                  {t(`${tier.key}.name`)}
                </h3>

                {/* Price Display */}
                {tier.monthlyPrice === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      $0
                    </span>
                  </div>
                ) : billingCycle === "yearly" ? (
                  <div className="flex flex-col">
                    {/* Total Annual Amount */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {formatMoney(tier.yearlyTotal)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        /{t("billing.yearly").toLowerCase()}
                      </span>
                    </div>
                    {/* Monthly Breakdown */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {t(`${tier.key}.badge`) || t("billing.save")}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Equivale a{" "}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatMoney(tier.monthlyEquivalent)}
                        </span>{" "}
                        /mes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {formatMoney(tier.monthlyPrice)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      / {t("month")}
                    </span>
                  </div>
                )}

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {t(`${tier.key}.tagline`)}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2
                      className={cn("h-5 w-5 shrink-0 mt-0.5", tier.accent)}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {t(`${tier.key}.features.${feature}`)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto flex justify-center">
                <Link
                  href={
                    tier.key === "free" ? "/login" : "/login?plan=pro_trial"
                  }
                  className="w-full">
                  <Button
                    variant={
                      tier.buttonVariant === "outline" ? "outline" : "default"
                    }
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold text-base py-3 px-8 transition-colors",
                      tier.key === "pro" &&
                        "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100",
                      tier.key === "familyPlus" &&
                        "bg-blue-600 hover:bg-blue-700 text-white",
                      tier.key === "free" &&
                        "border-slate-300 dark:border-slate-700"
                    )}>
                    {t(`${tier.key}.cta`)}
                    {tier.key !== "free" && <Zap className="h-4 w-4 ml-2" />}
                  </Button>
                </Link>
              </div>

              {tier.key !== "free" && (
                <p className="text-xs text-center text-slate-400 mt-3">
                  {billingCycle === "yearly"
                    ? t("billing.billedAnnually")
                    : t("billing.billedMonthly")}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
