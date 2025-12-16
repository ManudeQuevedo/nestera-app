import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
} from "lucide-react";

export default function ReportPage() {
  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your financial data with detailed reports
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Total Income",
              value: "$0",
              icon: TrendingUp,
              color: "text-green-600",
            },
            {
              name: "Total Expenses",
              value: "$0",
              icon: TrendingDown,
              color: "text-red-500",
            },
            {
              name: "Net Savings",
              value: "$0",
              icon: DollarSign,
              color: "text-blue-600",
            },
            {
              name: "Savings Rate",
              value: "0%",
              icon: PieChart,
              color: "text-purple-600",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="bg-card border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No Reports Yet</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mt-2">
              Add transactions to generate detailed financial reports including
              income statements, expense breakdowns, and savings analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
