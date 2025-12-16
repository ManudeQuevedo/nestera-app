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
import { getInvestments, seedDefaultInvestments } from "./actions";

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
  // Seed default investments if none exist
  try {
    await seedDefaultInvestments();
  } catch (e) {
    // Ignore if not logged in
  }

  const investments = await getInvestments();

  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_value,
    0
  );
  const totalMonthly = investments.reduce(
    (sum, inv) => sum + inv.monthly_contribution,
    0
  );

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Investments
            </h1>
            <p className="text-muted-foreground">
              Track your family's investment portfolio
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Investment
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border/50 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
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
                Monthly Contributions
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
                Active Investments
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
                        Current Value
                      </p>
                      <p className="text-lg font-bold">
                        ${investment.current_value.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly</p>
                      <p className="text-lg font-bold">
                        ${investment.monthly_contribution.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Years Active
                      </p>
                      <p className="text-lg font-bold">{yearsActive}</p>
                    </div>
                  </div>

                  {/* Simple Chart Placeholder */}
                  <div className="mt-4 h-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>Value history chart</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      Update Value
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Add Contribution
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
              <h3 className="font-medium mt-3">Add Investment</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Track a new investment account
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
