"use client";

import { Pie, PieChart, Cell, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Skeleton } from "@/components/ui/skeleton";

interface FinancialHealthScoreProps {
  income: number;
  expenses: number;
  debt: number;
  isLoading?: boolean;
}

export function FinancialHealthScore({
  income,
  expenses,
  debt,
  isLoading,
}: FinancialHealthScoreProps) {
  // Simple logic for demo: (Income - Expenses) compared to Debt?
  // User req: "Calculate based on (Total Income - Total Expenses) vs Total Debt."
  // Let's define Score:
  // Net Flow = Income - Expenses
  // If Net Flow > 0, it contributes positively.
  // If Debt is 0, Score is high (100 if Flow > 0).
  // Score calculation
  // Basic heuristic:
  // 1. Savings Rate (Income - Expenses) / Income * 50
  // 2. Debt to Income (Debt / Income) * 50 (inverse)

  if (isLoading || (income === 0 && expenses === 0 && debt === 0)) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Health Score</CardTitle>
          <CardDescription>Calculating...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <Skeleton className="h-40 w-40 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  let score = 0;
  if (income > 0) {
    const savingsRatio = Math.max(0, (income - expenses) / income);
    const debtRatio = Math.min(1, debt / (income * 12)); // Annualized debt

    score = Math.round(savingsRatio * 60 + (1 - debtRatio) * 40);
  } else {
    score = 0; // No income
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  const chartData = [
    { name: "Score", value: score, fill: "hsl(var(--chart-1))" },
    { name: "Remaining", value: 100 - score, fill: "hsl(var(--muted))" },
  ];

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Health Score</CardTitle>
        <CardDescription>Based on your financial data</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}>
              <Cell key="cell-0" fill="var(--color-score)" />
              <Cell key="cell-1" fill="hsl(var(--muted))" />
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold">
                          {Math.round(score)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs">
                          / 100
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
