"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Utensils, CalendarDays, ShoppingCart } from "lucide-react";

export function LifeOSSection() {
  const tHeader = useTranslations("Landing.lifeOS");
  const tFeatures = useTranslations("LandingPage.FamilyFeatures");

  const features = [
    {
      key: "mealPrep",
      icon: Utensils,
      color: "from-orange-400 to-red-500",
    },
    {
      key: "calendar",
      icon: CalendarDays,
      color: "from-blue-400 to-indigo-500",
    },
    {
      key: "shopping",
      icon: ShoppingCart,
      color: "from-emerald-400 to-green-500",
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-24 px-4 bg-white dark:bg-[#020617] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
            {tHeader("title")}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            {tHeader("subtitle")}
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-all hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-white/5 group">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {tFeatures(`${feature.key}.title`)}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {tFeatures(`${feature.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
