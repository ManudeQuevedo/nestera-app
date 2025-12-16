"use client";

import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import NextImage from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Lock,
  Shield,
  Eye,
  Users,
  Bot,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { HeroDashboard } from "@/components/landing/HeroDashboard";
import { PricingSection } from "@/components/landing/PricingSection";
import { LifeOSSection } from "@/components/landing/LifeOSSection";
import { LeakDetectorCard } from "@/components/marketing/LeakDetectorCard";
import { NativeAdvantageSection } from "@/components/marketing/NativeAdvantageSection";

interface LandingClientProps {
  user: { id: string } | null;
}

// Fade in up animation variant
const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function LandingClient({ user }: LandingClientProps) {
  const t = useTranslations("Landing");
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect for dashboard preview
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-emerald-500/30">
      {/* 1. HERO SECTION (Premium Content + Dashboard) */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles className="h-3 w-3" />
            {t("premium.hero.badge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-white">
            {t("premium.hero.title")} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              {t("premium.hero.titleGradient")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t("premium.hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={user ? "/dashboard" : "/login?plan=pro_trial"}>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide uppercase px-8 h-14 rounded-full shadow-lg shadow-emerald-900/20 transition-all hover:scale-105">
                {user ? t("goToDashboard") : t("premium.hero.cta")}
                {!user && <ArrowRight className="h-5 w-5 ml-2" />}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-white/5 hover:border-slate-500 font-medium px-8 h-14 rounded-full"
              asChild>
              <a href="#problem">{t("premium.hero.demo")}</a>
            </Button>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            style={{ y: dashboardY }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 relative scale-[0.85] sm:scale-90 md:scale-100 origin-top">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 rounded-full opacity-50" />
            <HeroDashboard />
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURE GRID (Premium) - "Del caos al control total" */}
      <section className="py-24 px-6 md:px-12 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              {t("premium.features.title")}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t("premium.features.subtitle")}
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Eye className="w-6 h-6 text-emerald-400" />,
                title: t("premium.features.visibility.title"),
                body: t("premium.features.visibility.body"),
              },
              {
                icon: <Users className="w-6 h-6 text-emerald-400" />,
                title: t("premium.features.sharedGoals.title"),
                body: t("premium.features.sharedGoals.body"),
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
                title: t("premium.features.growth.title"),
                body: t("premium.features.growth.body"),
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="group p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700 group-hover:border-emerald-500/30">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {card.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">{card.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION (Original Stats, Dark Mode) */}
      <section id="problem" className="py-32 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="text-center mb-16">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              {t("problem.badge")}
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t("problem.title")}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-400 max-w-2xl mx-auto">
              {t("problem.description")}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-8 mb-12 flex justify-center w-full">
              <LeakDetectorCard />
            </motion.div>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              animate: {
                transition: { staggerChildren: 0.1, delayChildren: 0.2 },
              },
            }}
            className="grid md:grid-cols-3 gap-8">
            {[
              {
                value: t("problem.stats.lost"),
                label: t("problem.stats.lostLabel"),
                color: "from-red-500 to-orange-500",
              },
              {
                value: t("problem.stats.subscriptions"),
                label: t("problem.stats.subscriptionsLabel"),
                color: "from-purple-500 to-pink-500",
              },
              {
                value: t("problem.stats.ants"),
                label: t("problem.stats.antsLabel"),
                color: "from-yellow-500 to-red-500",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center shadow-lg">
                <div
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. PILLARS (Premium) */}
      <section className="py-24 px-6 md:px-12 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {t("premium.pillars.title")}
            </h2>
            <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {[
              {
                icon: (
                  <GraduationCap className="w-12 h-12 text-emerald-400 mx-auto" />
                ),
                title: t("premium.pillars.education.title"),
                desc: t("premium.pillars.education.desc"),
              },
              {
                icon: <Zap className="w-12 h-12 text-emerald-400 mx-auto" />,
                title: t("premium.pillars.automation.title"),
                desc: t("premium.pillars.automation.desc"),
              },
              {
                icon: <Shield className="w-12 h-12 text-emerald-400 mx-auto" />,
                title: t("premium.pillars.security.title"),
                desc: t("premium.pillars.security.desc"),
              },
            ].map((pillar, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="pt-8 md:pt-0 px-4 space-y-6">
                <div className="p-4 rounded-full bg-slate-950/50 w-fit mx-auto ring-1 ring-slate-800">
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-slate-400 text-lg">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. NATIVE ADVANTAGE (Relplaces whyUs Bento) */}
      <NativeAdvantageSection />

      {/* 6. LIFE OS SECTION (Original) */}
      <LifeOSSection />

      {/* 7. PRICING SECTION (Original) */}
      <PricingSection />

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-white">
            {t("premium.finalCta.title")}
          </h2>
          <Link href={user ? "/dashboard" : "/login?plan=pro_trial"}>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide uppercase px-12 h-16 rounded-full shadow-lg shadow-emerald-500/20 text-lg transition-transform hover:scale-105">
              {t("premium.finalCta.button")}
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
