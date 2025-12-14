"use client";

import * as React from "react";
import { Link } from "@/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Info,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/finance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

interface ExpenseTrendChartProps {
  transactions: Transaction[];
  expanded?: boolean;
}

type TimeRange = "1d" | "7d";
type Currency = "MXN" | "USD" | "EUR";

// Mock exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<Currency, number> = {
  MXN: 1,
  USD: 0.058,
  EUR: 0.053,
};

// Seeded random number generator for consistent SSR/client values
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Map next-intl locale to BCP 47 locale tag
const getDateLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    es: "es-MX",
    en: "en-US",
  };
  return localeMap[locale] || locale;
};

// Generate mock data for demo with consistent values
const generateMockData = (
  days: number,
  locale: string,
  seedOffset: number = 0
) => {
  const data = [];
  const dateLocale = getDateLocale(locale);
  // Use a stable date reference (start of today) to avoid hydration issues
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Use date as seed for consistent random values
    const seed = date.getTime() + seedOffset;
    const r1 = seededRandom(seed);
    const r2 = seededRandom(seed + 1);
    const r3 = seededRandom(seed + 2);
    const r4 = seededRandom(seed + 3);
    const r5 = seededRandom(seed + 4);

    data.push({
      date: date.toISOString().split("T")[0],
      dateLabel: date.toLocaleDateString(dateLocale, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      income: Math.round(r1 > 0.8 ? 15000 + r2 * 20000 : 500 + r2 * 2000),
      expense: Math.round(800 + r3 * 1500),
      ants: Math.round(50 + r4 * 200),
      jfk: Math.round(r5 > 0.7 ? 200 + r1 * 500 : 0),
    });
  }

  return data;
};

// Custom Tooltip with Glass Style
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

  const symbol = currency === "EUR" ? "€" : "$";
  const rate = EXCHANGE_RATES[currency];

  return (
    <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-3 text-sm">
      <p className="font-medium mb-2 text-white">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
          </div>
          <span className="font-mono font-medium text-white">
            {symbol}
            {Math.round(entry.value * rate).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ExpenseTrendChart({
  transactions,
  expanded = false,
}: ExpenseTrendChartProps) {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const tInsights = useTranslations("Insights");
  const tJFK = useTranslations("JFKSchool");
  const locale = useLocale();
  const [timeRange, setTimeRange] = React.useState<TimeRange>("7d");
  const [currency, setCurrency] = React.useState<Currency>("MXN");
  const [showIncome, setShowIncome] = React.useState(true);
  const [showExpense, setShowExpense] = React.useState(true);
  const [showAnts, setShowAnts] = React.useState(true);
  const [showJFK, setShowJFK] = React.useState(true);

  // Generate mock data based on time range and locale
  const chartData = React.useMemo(() => {
    const days = timeRange === "1d" ? 1 : 7;
    return generateMockData(days, locale);
  }, [timeRange, locale]);

  // Calculate totals and comparison
  const { totals, comparison } = React.useMemo(() => {
    const current = chartData.reduce(
      (acc, d) => ({
        income: acc.income + d.income,
        expense: acc.expense + d.expense,
        ants: acc.ants + d.ants,
        jfk: acc.jfk + d.jfk,
      }),
      { income: 0, expense: 0, ants: 0, jfk: 0 }
    );

    // For comparison, generate previous period data with different seed
    const prevDays = timeRange === "1d" ? 1 : 7;
    const prevData = generateMockData(prevDays, locale, 1000000);
    const previous = prevData.reduce(
      (acc, d) => ({
        income: acc.income + d.income,
        expense: acc.expense + d.expense,
        ants: acc.ants + d.ants,
        jfk: acc.jfk + d.jfk,
      }),
      { income: 0, expense: 0, ants: 0, jfk: 0 }
    );

    const totalSpend = current.expense + current.ants + current.jfk;
    const prevTotalSpend = previous.expense + previous.ants + previous.jfk;
    const percentChange =
      prevTotalSpend > 0
        ? ((totalSpend - prevTotalSpend) / prevTotalSpend) * 100
        : 0;

    return {
      totals: current,
      comparison: {
        totalSpend,
        prevTotalSpend,
        percentChange,
        isHigher: totalSpend > prevTotalSpend,
      },
    };
  }, [chartData, timeRange]);

  const rate = EXCHANGE_RATES[currency];
  const symbol = currency === "EUR" ? "€" : "$";

  const seriesConfig = [
    {
      key: "income",
      name: tInsights("income"),
      color: "#34d399", // Emerald-400
      show: showIncome,
      toggle: setShowIncome,
    },
    {
      key: "expense",
      name: tInsights("expenses"),
      color: "#f43f5e", // Rose-500
      show: showExpense,
      toggle: setShowExpense,
    },
    {
      key: "ants",
      name: tInsights("antExpenses"),
      color: "#f59e0b",
      show: showAnts,
      toggle: setShowAnts,
    },
    {
      key: "jfk",
      name: tJFK("title"),
      color: "#8b5cf6",
      show: showJFK,
      toggle: setShowJFK,
    },
  ];

  const isEmpty = chartData.length === 0;

  if (isEmpty) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">
              {t("spending")}
            </CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Link
            href="/transactions"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            {t("viewAll")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium tracking-tight">
              {t("spending")}
            </CardTitle>
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          <Link
            href="/report"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
            {t("viewAll")}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Comparison Badge */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold tracking-tight">
            {symbol}
            {Math.round(comparison.totalSpend * rate).toLocaleString()}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "gap-1",
              comparison.isHigher
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            )}>
            {comparison.isHigher ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {comparison.isHigher ? "+" : ""}
            {comparison.percentChange.toFixed(1)}% {tInsights("vsLastPeriod")}{" "}
          </Badge>
        </div>
      </CardHeader>

      {/* Control Toolbar */}
      <CardHeader className="pt-0 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Time Range Toggle */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-1">
              {(["1d", "7d"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    timeRange === range && "bg-white dark:bg-white/10 shadow-sm"
                  )}
                  onClick={() => setTimeRange(range)}>
                  {range === "1d" ? tCommon("today") : tInsights("week")}
                </Button>
              ))}
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-lg p-1">
            {(["MXN", "USD", "EUR"] as Currency[]).map((curr) => (
              <Button
                key={curr}
                variant={currency === curr ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 text-xs px-2",
                  currency === curr && "bg-white dark:bg-white/10 shadow-sm"
                )}
                onClick={() => setCurrency(curr)}>
                {curr}
              </Button>
            ))}
          </div>
        </div>

        {/* Series Toggles */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {seriesConfig.map((series) => (
            <Button
              key={series.key}
              variant={series.show ? "default" : "outline"}
              size="sm"
              onClick={() => series.toggle(!series.show)}
              className={cn(
                "h-7 text-xs gap-1 transition-all",
                series.show && "text-white border-transparent"
              )}
              style={{
                backgroundColor: series.show ? series.color : "transparent",
                borderColor: series.show ? series.color : series.color,
                color: series.show ? "white" : series.color,
              }}>
              {series.show ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              {series.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:px-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                {/* Premium Gradient: Income - Emerald */}
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                {/* Premium Gradient: Expense - Rose */}
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                {/* Gradient: Ants - Amber */}
                <linearGradient id="gradAnts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                {/* Gradient: JFK - Violet */}
                <linearGradient id="gradJFK" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              {/* Extremely faint grid lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.03)"
                vertical={false}
              />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  `${symbol}${((value * rate) / 1000).toFixed(0)}k`
                }
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={50}
              />
              <Tooltip content={<CustomChartTooltip currency={currency} />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => (
                  <span className="text-slate-400 text-sm">{value}</span>
                )}
              />

              {showIncome && (
                <Area
                  type="monotone"
                  dataKey="income"
                  name={tInsights("income")}
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#gradIncome)"
                />
              )}
              {showExpense && (
                <Area
                  type="monotone"
                  dataKey="expense"
                  name={tInsights("expenses")}
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#gradExpense)"
                />
              )}
              {showAnts && (
                <Area
                  type="monotone"
                  dataKey="ants"
                  name={tInsights("antExpenses")}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#gradAnts)"
                />
              )}
              {showJFK && (
                <Area
                  type="monotone"
                  dataKey="jfk"
                  name={tJFK("title")}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradJFK)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
