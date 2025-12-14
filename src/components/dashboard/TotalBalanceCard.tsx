"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, MoreHorizontal, Info, Send } from "lucide-react";
import { AddTransactionDrawer } from "@/components/transactions/AddTransactionDrawer";
import { Category } from "@/types/finance";
import { useTranslations } from "next-intl";

interface TotalBalanceCardProps {
  balance: number;
  categories: Category[];
}

export function TotalBalanceCard({
  balance,
  categories,
}: TotalBalanceCardProps) {
  const t = useTranslations("Dashboard");

  // Account breakdown per user request
  const accounts = [
    {
      name: t("accounts.bear"),
      description: "Paycheck, freelancing income",
      percent: 72,
      amount: balance * 0.4,
      color: "bg-blue-500",
    },
    {
      name: t("accounts.carolina"),
      description: "Wife's income",
      percent: 65,
      amount: balance * 0.35,
      color: "bg-purple-500",
    },
    {
      name: t("accounts.medical"),
      percent: 15,
      amount: balance * 0.15,
      color: "bg-pink-500",
    },
    {
      name: t("accounts.household"),
      description: "House and car fixes",
      percent: 10,
      amount: balance * 0.1,
      color: "bg-green-500",
    },
  ];

  return (
    <Card className="h-full bg-white dark:bg-card shadow-sm rounded-xl border-none relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm font-medium">{t("totalBalance")}</span>
          <Info className="h-4 w-4" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight">
            ${balance.toLocaleString()}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              $1,455.93
            </span>
            <span className="text-muted-foreground">{t("fromLastMonth")}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("account")}</span>
            <Info className="h-3 w-3" />
          </div>
          <div className="space-y-3">
            {accounts.map((acc, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 border-dashed ${acc.color.replace(
                      "bg-",
                      "border-"
                    )} flex items-center justify-center`}
                  />
                  <span className="font-medium">{acc.name}</span>
                  <span className="text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">
                    {acc.percent}%
                  </span>
                </div>
                <span className="text-muted-foreground">
                  $
                  {acc.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <AddTransactionDrawer
            categories={categories}
            trigger={
              <Button
                variant="outline"
                className="flex-1 shadow-sm border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                {t("record")}
              </Button>
            }
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
