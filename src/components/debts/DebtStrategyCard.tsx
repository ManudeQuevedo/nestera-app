"use client";

import { Debt } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Snowflake,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DebtStrategyCardProps {
  debts: Debt[];
}

interface StrategyItem {
  type: "priority" | "freeze" | "tip" | "warning";
  icon: React.ElementType;
  title: string;
  description: string;
  value?: string;
}

function calculateEffectiveAPR(rate: number, ivaRate: number): number {
  return Math.round(rate * (1 + ivaRate / 100) * 100) / 100;
}

function analyzeDebts(debts: Debt[]): StrategyItem[] {
  const strategies: StrategyItem[] = [];
  const activeDebts = debts.filter((d) => d.status !== "paid_off");

  if (activeDebts.length === 0) {
    return [
      {
        type: "tip",
        icon: TrendingUp,
        title: "Debt-Free!",
        description:
          "Congratulations! Consider investing your extra cash flow.",
      },
    ];
  }

  const lateDebts = activeDebts.filter((d) => d.status === "late");
  lateDebts.forEach((debt) => {
    strategies.push({
      type: "warning",
      icon: AlertCircle,
      title: `URGENT: ${debt.concept}`,
      description:
        "This debt is marked as late. Your credit score is at risk. Pay the minimum immediately.",
      value: `$${debt.balance.toLocaleString()}`,
    });
  });

  const msiDebts = activeDebts.filter((d) => d.is_msi);
  msiDebts.forEach((debt) => {
    strategies.push({
      type: "freeze",
      icon: Snowflake,
      title: `Freeze: ${debt.concept}`,
      description:
        "This is a 0% APR (MSI) balance. Do NOT pay early. Invest the cash instead for better returns.",
      value: `${debt.term_months_remaining || "?"} months left`,
    });
  });

  const nonMsiDebts = activeDebts
    .filter((d) => !d.is_msi && d.status !== "late")
    .map((debt) => ({
      debt,
      effectiveAPR: calculateEffectiveAPR(debt.interest_rate, debt.iva_rate),
    }))
    .sort((a, b) => b.effectiveAPR - a.effectiveAPR);

  if (nonMsiDebts.length > 0) {
    const top = nonMsiDebts[0];
    strategies.push({
      type: "priority",
      icon: Flame,
      title: `Priority 1: ${top.debt.concept}`,
      description: `Effective rate: ${top.effectiveAPR}% APR (${top.debt.interest_rate}% + ${top.debt.iva_rate}% tax). Focus all extra payments here.`,
      value: `$${top.debt.balance.toLocaleString()}`,
    });

    if (nonMsiDebts.length > 1) {
      const second = nonMsiDebts[1];
      strategies.push({
        type: "priority",
        icon: Flame,
        title: `Priority 2: ${second.debt.concept}`,
        description: `Effective rate: ${second.effectiveAPR}% APR. Tackle this after paying off Priority 1.`,
        value: `$${second.debt.balance.toLocaleString()}`,
      });
    }
  }

  const mortgage = activeDebts.find(
    (d) => d.debt_type === "mortgage" && !d.is_msi
  );
  if (
    mortgage &&
    mortgage.term_months_remaining &&
    mortgage.term_months_remaining > 60
  ) {
    const effectiveRate = calculateEffectiveAPR(
      mortgage.interest_rate,
      mortgage.iva_rate
    );
    const monthlyInterest = (mortgage.balance * effectiveRate) / 100 / 12;

    strategies.push({
      type: "tip",
      icon: Lightbulb,
      title: "Mortgage Tip",
      description: `Choose "Reduce Term" over "Reduce Payment" for extra payments. You'll save significantly on interest. Current monthly interest: $${monthlyInterest.toLocaleString()}.`,
    });
  }

  const highInterestCC = activeDebts.find(
    (d) => d.debt_type === "credit_card" && d.interest_rate > 30 && !d.is_msi
  );
  if (highInterestCC) {
    strategies.push({
      type: "tip",
      icon: Lightbulb,
      title: "Consider Balance Transfer",
      description:
        "With rates above 30%, look for balance transfer offers or debt consolidation loans with lower rates.",
    });
  }

  return strategies;
}

export function DebtStrategyCard({ debts }: DebtStrategyCardProps) {
  const strategies = analyzeDebts(debts);

  if (strategies.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200/50 dark:border-indigo-900/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          AI Payoff Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {strategies.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg",
              item.type === "priority" && "bg-red-50 dark:bg-red-950/30",
              item.type === "freeze" && "bg-blue-50 dark:bg-blue-950/30",
              item.type === "tip" && "bg-green-50 dark:bg-green-950/30",
              item.type === "warning" && "bg-amber-50 dark:bg-amber-950/30"
            )}>
            <div
              className={cn(
                "p-1.5 rounded-lg flex-shrink-0",
                item.type === "priority" && "bg-red-100 dark:bg-red-900/50",
                item.type === "freeze" && "bg-blue-100 dark:bg-blue-900/50",
                item.type === "tip" && "bg-green-100 dark:bg-green-900/50",
                item.type === "warning" && "bg-amber-100 dark:bg-amber-900/50"
              )}>
              <item.icon
                className={cn(
                  "w-4 h-4",
                  item.type === "priority" && "text-red-600 dark:text-red-400",
                  item.type === "freeze" && "text-blue-600 dark:text-blue-400",
                  item.type === "tip" && "text-green-600 dark:text-green-400",
                  item.type === "warning" &&
                    "text-amber-600 dark:text-amber-400"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{item.title}</p>
                {item.value && (
                  <Badge variant="secondary" className="text-xs">
                    {item.value}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
