"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Plus, MoreHorizontal, Info } from "lucide-react";
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
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">
            {t("totalBalance")}
          </span>
          <Info className="h-3.5 w-3.5" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight tabular-nums">
            ${balance.toLocaleString()}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-500 font-medium flex items-center tabular-nums">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              $1,455.93
            </span>
            <span className="text-slate-400 text-xs">{t("fromLastMonth")}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase tracking-wider">
            <span>{t("account")}</span>
            <Info className="h-3 w-3" />
          </div>
          <div className="space-y-2.5">
            {accounts.map((acc, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${acc.color}`} />
                  <span className="font-medium tracking-tight text-[13px]">
                    {acc.name}
                  </span>
                  <span className="text-slate-500 text-[10px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded tabular-nums">
                    {acc.percent}%
                  </span>
                </div>
                <span className="text-slate-400 tabular-nums text-xs">
                  $
                  {acc.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <AddTransactionDrawer
            categories={categories}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs border-dashed border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {t("record")}
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
