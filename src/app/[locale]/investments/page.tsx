import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  GraduationCap,
  Wallet,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { getInvestments, seedDefaultInvestments } from "@/actions/investments";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

const iconMap: Record<string, React.ElementType> = {
  GraduationCap: GraduationCap,
  Wallet: Wallet,
};

const typeLabels: Record<string, string> = {
  college_fund: "College Fund",
  retirement: "Retirement",
  stocks: "Stocks",
  crypto: "Cryptocurrency",
  real_estate: "Real Estate",
  other: "Other",
};

export default async function InvestmentsPage() {
  const [investments, t, tCommon] = await Promise.all([
    getInvestments(),
    getTranslations("Investments"),
    getTranslations("Common"),
  ]);

  // Seed default investments if none exist
  try {
    if (!investments || investments.length === 0) {
      await seedDefaultInvestments();
    }
  } catch (e) {
    // Ignore if not logged in
  }

  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_value,
    0
  );
  const totalMonthly = investments.reduce(
    (sum, inv) => sum + inv.monthly_contribution,
    0
  );

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("addInvestment")}
        </Button>
      }>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("totalValue")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("monthlyContribution")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalMonthly.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("chartTitle")}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {investments.map((investment) => {
            const Icon = iconMap[investment.icon || "Wallet"] || Wallet;
            const yearsActive = investment.year_started
              ? new Date().getFullYear() - investment.year_started
              : 0;

            return (
              <Card
                key={investment.id}
                className="bg-card border-border/50 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{investment.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {typeLabels[investment.type] || investment.type}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("totalValue")}
                      </p>
                      <p className="text-lg font-bold">
                        ${investment.current_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {tCommon("months")}
                      </p>
                      <p className="text-lg font-bold">
                        ${investment.monthly_contribution.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("yearStarted")}
                      </p>
                      <p className="text-lg font-bold">{yearsActive}</p>
                    </div>
                  </div>

                  {/* Simple Chart Placeholder */}
                  <div className="mt-4 h-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>{t("chartTitle")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      {tCommon("edit")}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      {tCommon("add")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Investment Card */}
          <Card className="bg-card border-border/50 border-dashed rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mt-3">{t("addInvestment")}</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                {t("description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
