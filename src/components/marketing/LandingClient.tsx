"use client";

import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  LayoutDashboard, // Added
  Wallet, // Added
  Landmark, // Added
  Percent, // Added
  Star, // Added
} from "lucide-react";

import { HeroDashboard } from "@/components/landing/HeroDashboard";
import { PricingSection } from "@/components/landing/PricingSection";
import { LifeOSSection } from "@/components/landing/LifeOSSection";
import { LeakDetectorCard } from "@/components/marketing/LeakDetectorCard";
import { WhyNesteraSection } from "@/components/marketing/WhyNesteraSection"; // Changed import
import { NativeAdvantageSection } from "@/components/marketing/NativeAdvantageSection";
import {
  EducationVisual,
  AutomationVisual,
  SecurityVisual,
} from "@/components/marketing/PillarsVisuals";
import { TechStack } from "@/components/marketing/TechStack";
import { SecurityAssurance } from "@/components/marketing/SecurityAssurance";
import { DemoModal } from "@/components/marketing/demo/DemoModal";
import { useState } from "react";

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
  const [demoOpen, setDemoOpen] = useState(false); // Demo Modal State
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect for dashboard preview
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const locale = useLocale();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. HERO SECTION (Premium Light) */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Blobs (Light Mode) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-60 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[100px] mix-blend-multiply" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-100/60 rounded-full blur-[80px] mix-blend-multiply" />
          <div className="absolute -top-20 left-1/2 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[100px] mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="animate" // Changed from "show" to "animate" to match staggerContainer
            variants={staggerContainer}
            className="space-y-8">
            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{t("premium.hero.badge")}</span>
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1] text-balance">
              {t("premium.hero.title")}{" "}
              <span className="text-emerald-600 relative inline-block">
                {t("premium.hero.titleGradient")}
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 -z-10"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none">
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t("premium.hero.subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 transition-all hover:scale-105"
                asChild>
                <Link href={user ? "/dashboard" : "/login?plan=pro_trial"}>
                  {user ? t("goToDashboard") : t("premium.hero.cta")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDemoOpen(true)}
                className="rounded-full px-8 py-6 text-lg border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm">
                {t("premium.hero.demo")}
              </Button>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview (Hero Image) */}
          <motion.div
            style={{ y: dashboardY }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl p-2 bg-slate-900/5 ring-1 ring-slate-900/10 backdrop-blur-sm">
            <div className="rounded-xl overflow-hidden shadow-2xl bg-white">
              <HeroDashboard />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TECH STACK (Trust) */}
      <TechStack />
      <SecurityAssurance />

      {/* 3. WHY NESTERA (Manifesto + Problem) */}
      <WhyNesteraSection />

      {/* 3.5 NATIVE ADVANTAGE (Zig Zag) */}
      <NativeAdvantageSection />

      {/* 4. THE FUNDAMENTALS (Pillars) - White Background */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {t("premium.pillars.title")}
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              {t("premium.pillars.subtitle")}
            </p>
          </div>

          <div className="space-y-32">
            {[
              {
                icon: GraduationCap,
                title: t("premium.pillars.education.title"),
                desc: t("premium.pillars.education.desc"),
                align: "left",
                image: "/images/mockup-education.png", // Placeholder
              },
              {
                icon: LayoutDashboard,
                title: t("premium.pillars.automation.title"), // Changed to automation
                desc: t("premium.pillars.automation.desc"), // Changed to automation
                align: "right",
                image: "/images/mockup-system.png",
              },
              {
                icon: Users, // Changed to Users
                title: t("premium.pillars.security.title"), // Changed to security
                desc: t("premium.pillars.security.desc"), // Changed to security
                align: "left",
                image: "/images/mockup-advisory.png",
              },
            ].map((item, i) => {
              const VisualComponent = [
                EducationVisual,
                AutomationVisual,
                SecurityVisual,
              ][i];

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`flex flex-col md:flex-row items-center gap-16 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}>
                  <div className="flex-1 space-y-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center rotate-3 hover:rotate-6 transition-transform">
                      <item.icon className="w-8 h-8 text-slate-900" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                    <ul className="space-y-4 pt-4">
                      {[1, 2, 3].map((j) => (
                        <li
                          key={j}
                          className="flex items-center gap-3 text-slate-700 font-medium">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          {t(`premium.pillars.benefit_${j}` as any)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Visual Component */}
                  <div className="flex-1 w-full aspect-square md:aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                    <VisualComponent />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. LIFE OS SECTION (Original) */}
      <div className="bg-slate-50">
        <LifeOSSection />
        {/* 7. PRICING SECTION (Original) */}
        <PricingSection />
      </div>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">
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
      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
