"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CashOnHandCardProps {
  balance: number;
  lastChange?: number;
  className?: string;
}

export function CashOnHandCard({
  balance,
  lastChange,
  className,
}: CashOnHandCardProps) {
  const isPositive = (lastChange ?? 0) >= 0;

  return (
    <Card
      className={cn(
        "h-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
        className
      )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Efectivo en Mano
              </p>
              <p className="text-xs text-amber-600">Cash Wallet</p>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-3xl font-bold text-amber-900 tabular-nums">
            ${balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
          {lastChange !== undefined && lastChange !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-600" : "text-red-500"
                )}>
                {isPositive ? "+" : ""}$
                {Math.abs(lastChange).toLocaleString("es-MX")} esta semana
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <p className="text-xs text-amber-700">
          Saldo calculado de retiros ATM menos gastos en efectivo registrados
        </p>
      </CardContent>
    </Card>
  );
}
