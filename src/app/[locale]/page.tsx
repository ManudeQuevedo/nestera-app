import { createClient } from "@/utils/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  PieChart,
  TrendingUp,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  Globe,
  Lock,
} from "lucide-react";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch user session (pass to navbar)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950/30">
      {/* Smart Navbar */}
      <PublicNavbar user={user} locale={locale} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              {t("tagline")}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent leading-tight">
              {t("hero.title")}
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={user ? "/dashboard" : "/login"}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                  {user ? t("goToDashboard") : t("startFree")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-lg"
                asChild>
                <a href="#solution">{t("learnMore")}</a>
              </Button>
            </div>
          </div>

          {/* Dashboard Preview with 3D Tilt Effect */}
          <div className="mt-20 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-3xl blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border/50 overflow-hidden transform perspective-1000 group-hover:rotate-x-1 group-hover:rotate-y-1 transition-transform duration-500">
              <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center px-4 gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <div className="p-8 bg-[#e7ecef] dark:bg-[#002855] min-h-[300px] flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
                  {/* Mock Dashboard Cards */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                    <div className="h-8 w-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                    <div className="h-8 w-28 bg-gradient-to-r from-emerald-500 to-teal-500 rounded" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                    <div className="h-8 w-24 bg-gradient-to-r from-orange-500 to-red-500 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("solution.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("solution.subtitle")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                title: t("features.tracking.title"),
                description: t("features.tracking.description"),
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: PieChart,
                title: t("features.budget.title"),
                description: t("features.budget.description"),
                color: "from-blue-500 to-indigo-500",
              },
              {
                icon: TrendingUp,
                title: t("features.insights.title"),
                description: t("features.insights.description"),
                color: "from-orange-500 to-red-500",
              },
              {
                icon: BarChart3,
                title: t("features.reports.title"),
                description: t("features.reports.description"),
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Users,
                title: t("features.family.title"),
                description: t("features.family.description"),
                color: "from-cyan-500 to-blue-500",
              },
              {
                icon: Shield,
                title: t("features.security.title"),
                description: t("features.security.description"),
                color: "from-slate-500 to-slate-700",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="group border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">
                  {t("pricing.free.name")}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">
                    /{t("pricing.month")}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["tracking", "budgets", "reports"].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {t(`pricing.free.features.${feature}`)}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    {t("pricing.free.cta")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-blue-500/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                {t("pricing.pro.badge")}
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">
                  {t("pricing.pro.name")}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">
                    /{t("pricing.month")}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["everything", "ai", "family", "export", "priority"].map(
                    (feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        {t(`pricing.pro.features.${feature}`)}
                      </li>
                    )
                  )}
                </ul>
                <Link href="/login?plan=pro_trial">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Zap className="h-4 w-4 mr-2" />
                    {t("pricing.pro.cta")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 px-10 text-lg">
              {t("startFree")}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                N
              </div>
              <span className="font-semibold">Nestera</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                {t("footer.terms")}
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                {t("footer.contact")}
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Nestera. {t("rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
