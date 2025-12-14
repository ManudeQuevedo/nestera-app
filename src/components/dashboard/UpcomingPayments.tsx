"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Transaction, Debt } from "@/types/finance";
import { ArrowRight, CalendarClock } from "lucide-react";

interface UpcomingPaymentsProps {
  payments: (Transaction | Debt)[];
}

export function UpcomingPayments({ payments }: UpcomingPaymentsProps) {
  // Helper to get actual date object for sorting
  const getPaymentDate = (item: Transaction | Debt): Date => {
    if ("next_payment_due_date" in item && item.next_payment_due_date) {
      // It's a Debt with a specific due date
      return new Date(item.next_payment_due_date);
    } else if ("date" in item) {
      // It's a Transaction
      return new Date(item.date);
    }
    return new Date(8640000000000000); // Far future if invalid
  };

  // Sort by due date (nearest first)
  const sorted = [...payments]
    .sort((a, b) => {
      return getPaymentDate(a).getTime() - getPaymentDate(b).getTime();
    })
    .filter((p) => {
      // Only show future or today
      // For debts, we always calculated the *next* date, so it's always future/today.
      // For transactions, we only show standard "future" ones if they are recurring instances,
      // but here we are passed raw transactions.
      // If we want "Upcoming", we probably shouldn't show past one-off transactions.
      // But the requirement says "Reminders: Query debts and recurring transactions".
      // The prop passed is a mix. Let's assume the caller filters or we filter here.
      const date = getPaymentDate(p);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return date > yesterday;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">No upcoming payments.</p>
        ) : (
          sorted.map((item, i) => {
            const isDebt = "concept" in item;
            const name = isDebt
              ? (item as Debt).concept
              : (item as any).description || "Transaction";
            const date = getPaymentDate(item);
            const isUrgent = i === 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  isUrgent
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900"
                    : "bg-card"
                )}>
                <div className="space-y-1">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      isUrgent && "text-red-600 dark:text-red-400 font-bold"
                    )}>
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div
                  className={cn(
                    "font-medium",
                    isUrgent && "text-red-600 dark:text-red-400"
                  )}>
                  $
                  {("balance" in item
                    ? (item as Debt).balance
                    : (item as Transaction).amount
                  ).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
