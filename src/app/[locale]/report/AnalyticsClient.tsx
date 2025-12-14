"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bug,
  Plane,
  Receipt,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowDownRight,
  Sparkles,
  LineChart,
  Eye,
  EyeOff,
  Coins,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// ============================================
// CURRENCY CONFIG
// ============================================
type Currency = "MXN" | "USD" | "EUR";

const EXCHANGE_RATES: Record<Currency, number> = {
  MXN: 1,
  USD: 0.058,
  EUR: 0.053,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MXN: "$",
  USD: "$",
  EUR: "€",
};

function formatCurrency(amount: number, currency: Currency): string {
  const rate = EXCHANGE_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${Math.round(amount * rate).toLocaleString()}`;
}

// ============================================
// MOCK DATA - Financial Performance (Daily)
// ============================================
const generateMockData = () => {
  const data = [];
  const startDate = new Date("2024-10-01");

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const baseIncome =
      i % 15 === 0
        ? 25000 + Math.random() * 10000
        : 1000 + Math.random() * 2000;
    const baseExpense = 800 + Math.random() * 1500;
    const baseDebt = i % 30 === 0 ? 3000 + Math.random() * 2000 : 0;
    const baseAnts = 50 + Math.random() * 150;

    data.push({
      date: date.toISOString().split("T")[0],
      dateLabel: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      income: Math.round(baseIncome),
      expense: Math.round(baseExpense),
      debt: Math.round(baseDebt),
      ants: Math.round(baseAnts),
    });
  }

  return data;
};

const fullAnalyticsData = generateMockData();

// ============================================
// MOCK DATA - Ant Exterminator (6 Months)
// ============================================
const spendingTrendsData = [
  { month: "Jul", necessary: 28000, avoidable: 8500 },
  { month: "Aug", necessary: 27500, avoidable: 7800 },
  { month: "Sep", necessary: 29000, avoidable: 6200 },
  { month: "Oct", necessary: 28500, avoidable: 5400 },
  { month: "Nov", necessary: 30000, avoidable: 4100 },
  { month: "Dec", necessary: 31000, avoidable: 3200 },
];

// ============================================
// MOCK DATA - Trip Tracker
// ============================================
const tripTransactions = [
  {
    id: "1",
    description: "Flight - MEX to CDG",
    amount: 1850,
    currency: "USD",
    date: "2024-03-15",
    category: "Transportation",
  },
  {
    id: "2",
    description: "Hotel Marais Paris",
    amount: 890,
    currency: "EUR",
    date: "2024-03-16",
    category: "Lodging",
  },
  {
    id: "3",
    description: "Louvre Museum Tickets",
    amount: 45,
    currency: "EUR",
    date: "2024-03-17",
    category: "Entertainment",
  },
  {
    id: "4",
    description: "Restaurant Le Petit Cler",
    amount: 120,
    currency: "EUR",
    date: "2024-03-17",
    category: "Food",
  },
  {
    id: "5",
    description: "Uber Rides",
    amount: 85,
    currency: "EUR",
    date: "2024-03-18",
    category: "Transportation",
  },
  {
    id: "6",
    description: "Souvenirs",
    amount: 4500,
    currency: "MXN",
    date: "2024-03-19",
    category: "Shopping",
  },
  {
    id: "7",
    description: "Eiffel Tower Dinner",
    amount: 280,
    currency: "EUR",
    date: "2024-03-19",
    category: "Food",
  },
];

// ============================================
// MOCK DATA - Debt Efficiency
// ============================================
const debtBreakdownData = [
  { name: "Principal Paid", value: 45000, color: "#3b82f6" },
  { name: "Interest Paid", value: 12500, color: "#f97316" },
  { name: "IVA/Taxes", value: 2000, color: "#ef4444" },
];

// ============================================
// CUSTOM TOOLTIP
// ============================================
interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  currency: Currency;
}

function CustomChartTooltip({
  active,
  payload,
  label,
  currency,
}: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
          </div>
          <span className="font-mono font-medium">
            {formatCurrency(entry.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// GLOBAL CURRENCY SELECTOR
// ============================================
function CurrencySelector({
  currency,
  setCurrency,
}: {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Coins className="w-4 h-4 text-muted-foreground" />
      <div className="flex bg-muted/50 rounded-lg p-1">
        {(["MXN", "USD", "EUR"] as Currency[]).map((curr) => (
          <Button
            key={curr}
            variant={currency === curr ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-7 text-xs px-3",
              currency === curr && "bg-card shadow-sm"
            )}
            onClick={() => setCurrency(curr)}>
            {curr}
          </Button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TAB 0: FINANCIAL PERFORMANCE
// ============================================
type DateRange = "30d" | "60d" | "90d";

function FinancialPerformanceTab({ currency }: { currency: Currency }) {
  const t = useTranslations("Insights");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);
  const [showDebt, setShowDebt] = useState(true);
  const [showAnts, setShowAnts] = useState(true);

  const filteredData = useMemo(() => {
    const days = dateRange === "30d" ? 30 : dateRange === "60d" ? 60 : 90;
    return fullAnalyticsData.slice(-days);
  }, [dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, d) => ({
        income: acc.income + d.income,
        expense: acc.expense + d.expense,
        debt: acc.debt + d.debt,
        ants: acc.ants + d.ants,
      }),
      { income: 0, expense: 0, debt: 0, ants: 0 }
    );
  }, [filteredData]);

  const seriesConfig = [
    {
      key: "income",
      name: t("income"),
      color: "#10b981",
      show: showIncome,
      toggle: setShowIncome,
    },
    {
      key: "expense",
      name: t("expenses"),
      color: "#64748b",
      show: showExpense,
      toggle: setShowExpense,
    },
    {
      key: "debt",
      name: t("debtPayments"),
      color: "#f43f5e",
      show: showDebt,
      toggle: setShowDebt,
    },
    {
      key: "ants",
      name: t("antExpenses"),
      color: "#f59e0b",
      show: showAnts,
      toggle: setShowAnts,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("period")}:
              </span>
              <div className="flex gap-1">
                {(["30d", "60d", "90d"] as DateRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className="h-8">
                    {range === "30d"
                      ? t("days30")
                      : range === "60d"
                      ? t("days60")
                      : t("days90")}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">
                {t("show")}:
              </span>
              {seriesConfig.map((series) => (
                <Button
                  key={series.key}
                  variant={series.show ? "default" : "outline"}
                  size="sm"
                  onClick={() => series.toggle(!series.show)}
                  className={cn("h-8 gap-1.5", series.show && "text-white")}
                  style={{
                    backgroundColor: series.show ? series.color : undefined,
                    borderColor: series.color,
                  }}>
                  {series.show ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  {series.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            {t("financialPerformance")}
          </CardTitle>
          <CardDescription>{t("trackPerformance")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient
                    id="gradientIncome"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="gradientExpense"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradientDebt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradientAnts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dateLabel"
                  className="text-xs"
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis
                  className="text-xs"
                  tickFormatter={(v) =>
                    formatCurrency(v, currency).replace(/,\d+$/, "k")
                  }
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                <Legend />
                {showIncome && (
                  <Area
                    type="monotone"
                    dataKey="income"
                    name={t("income")}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gradientIncome)"
                  />
                )}
                {showExpense && (
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name={t("expenses")}
                    stroke="#64748b"
                    strokeWidth={2}
                    fill="url(#gradientExpense)"
                  />
                )}
                {showDebt && (
                  <Area
                    type="monotone"
                    dataKey="debt"
                    name={t("debtPayments")}
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fill="url(#gradientDebt)"
                  />
                )}
                {showAnts && (
                  <Area
                    type="monotone"
                    dataKey="ants"
                    name={t("antExpenses")}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#gradientAnts)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-muted-foreground">
                {t("totalIncome")}
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totals.income, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50/50 dark:bg-slate-950/20 border-slate-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-slate-600" />
              <p className="text-sm text-muted-foreground">
                {t("totalExpenses")}
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-600">
              {formatCurrency(totals.expense, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <p className="text-sm text-muted-foreground">{t("debtPaid")}</p>
            </div>
            <p className="text-2xl font-bold text-rose-600">
              {formatCurrency(totals.debt, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Bug className="w-4 h-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">
                {t("antExpenses")}
              </p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(totals.ants, currency)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// TAB 1: ANT EXTERMINATOR
// ============================================
function AntExterminatorTab({ currency }: { currency: Currency }) {
  const t = useTranslations("Insights");
  const currentAvoidable = spendingTrendsData[5].avoidable;
  const previousAvoidable = spendingTrendsData[4].avoidable;
  const reduction = (
    ((previousAvoidable - currentAvoidable) / previousAvoidable) *
    100
  ).toFixed(1);
  const savedAmount = previousAvoidable - currentAvoidable;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("avoidableReduction")}
                </p>
                <p className="text-2xl font-bold text-emerald-600 flex items-center gap-1">
                  <ArrowDownRight className="w-5 h-5" />
                  {reduction}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("savedThisMonth")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(savedAmount, currency)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Dec {t("avoidableExpenses")}
                </p>
                <p className="text-2xl font-bold text-rose-500">
                  {formatCurrency(currentAvoidable, currency)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Bug className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("spendingBreakdown")} (6 {t("months")})
          </CardTitle>
          <CardDescription>{t("spendingBreakdownDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(v) => formatCurrency(v, currency)}
                />
                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                <Legend />
                <Bar
                  dataKey="necessary"
                  name={t("necessaryExpenses")}
                  stackId="a"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="avoidable"
                  name={t("avoidableExpenses")}
                  stackId="a"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                {t("greatProgress")}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {t.rich("greatProgressDesc", {
                  saved: formatCurrency(savedAmount, currency),
                  yearSaved: formatCurrency(savedAmount * 12, currency),
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 2: TRIP TRACKER
// ============================================
function TripTrackerTab({ currency }: { currency: Currency }) {
  const t = useTranslations("Insights");
  const [startDate, setStartDate] = useState("2024-03-15");
  const [endDate, setEndDate] = useState("2024-03-20");

  const filteredTx = tripTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= new Date(startDate) && txDate <= new Date(endDate);
  });

  // Convert all amounts to selected currency
  const convertToMXN = (amount: number, fromCurrency: string) => {
    if (fromCurrency === "MXN") return amount;
    if (fromCurrency === "USD") return amount / 0.058;
    if (fromCurrency === "EUR") return amount / 0.053;
    return amount;
  };

  const totalInSelectedCurrency = filteredTx.reduce((acc, tx) => {
    const amountInMXN = convertToMXN(tx.amount, tx.currency);
    return acc + amountInMXN;
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t("from")}:
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("to")}:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Badge variant="secondary" className="ml-auto">
              {t("transactionsCount", { count: filteredTx.length })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total in Selected Currency */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("tripExpenses", { currency })}
            </p>
            <p className="text-4xl font-bold text-indigo-600">
              {formatCurrency(totalInSelectedCurrency, currency)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {t("tripTransactions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.date")}</TableHead>
                <TableHead>{t("table.description")}</TableHead>
                <TableHead>{t("table.category")}</TableHead>
                <TableHead className="text-right">
                  {t("table.original")}
                </TableHead>
                <TableHead className="text-right">
                  {t("table.converted", { currency })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTx.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8">
                    {t("noTripTransactions")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTx.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {tx.date}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {tx.currency === "EUR" ? "€" : "$"}
                      {tx.amount.toLocaleString()} {tx.currency}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(
                        convertToMXN(tx.amount, tx.currency),
                        currency
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// TAB 3: DEBT EFFICIENCY
// ============================================
function DebtEfficiencyTab({ currency }: { currency: Currency }) {
  const total = debtBreakdownData.reduce((sum, d) => sum + d.value, 0);
  const taxBleed = debtBreakdownData[1].value + debtBreakdownData[2].value;
  const taxBleedPercent = ((taxBleed / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Total Paid This Year
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(total, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Interest + IVA (Tax Bleed)
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(taxBleed, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {taxBleedPercent}% of your payments went to interest & taxes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              IVA Paid on Interest
            </p>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(debtBreakdownData[2].value, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tax on your interest payments (16% of interest)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment Breakdown
          </CardTitle>
          <CardDescription>
            Where your debt payments went this year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={debtBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}>
                  {debtBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip currency={currency} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Tax Bleed Alert
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You're paying{" "}
                <strong>{formatCurrency(taxBleed, currency)}</strong> annually
                in interest and IVA. By prepaying high-interest debts, you can
                stop this "tax bleed" and redirect that money to savings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function AnalyticsClient() {
  const [currency, setCurrency] = useState<Currency>("MXN");

  return (
    <div className="w-full space-y-6">
      {/* Currency Selector Row */}
      <div className="flex justify-end">
        <CurrencySelector currency={currency} setCurrency={setCurrency} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="performance" className="gap-2">
            <LineChart className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="ant" className="gap-2">
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">Ant Exterminator</span>
            <span className="sm:hidden">Ants</span>
          </TabsTrigger>
          <TabsTrigger value="trip" className="gap-2">
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Trip Tracker</span>
            <span className="sm:hidden">Trips</span>
          </TabsTrigger>
          <TabsTrigger value="debt" className="gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Debt Efficiency</span>
            <span className="sm:hidden">Debt</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <FinancialPerformanceTab currency={currency} />
        </TabsContent>

        <TabsContent value="ant">
          <AntExterminatorTab currency={currency} />
        </TabsContent>

        <TabsContent value="trip">
          <TripTrackerTab currency={currency} />
        </TabsContent>

        <TabsContent value="debt">
          <DebtEfficiencyTab currency={currency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
