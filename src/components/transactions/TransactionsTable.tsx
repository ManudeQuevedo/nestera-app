"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction, Category } from "@/types/finance";
import {
  Banknote,
  CreditCard,
  Wallet,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  Utensils,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";

// Map next-intl locale to BCP 47 locale tag
const getDateLocale = (locale: string) => {
  const localeMap: Record<string, string> = {
    es: "es-MX",
    en: "en-US",
  };
  return localeMap[locale] || locale;
};

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
}

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  coffee: Coffee,
  home: Home,
  car: Car,
  food: Utensils,
  default: Sparkles,
};

const paymentMethodConfig = {
  cash: {
    label: "Cash",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: Banknote,
  },
  debit: {
    label: "Debit",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Wallet,
  },
  credit: {
    label: "Credit",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: CreditCard,
  },
};

export function TransactionsTable({
  transactions,
  categories,
}: TransactionsTableProps) {
  const t = useTranslations("Transactions");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return t("category"); // Or translation for uncategorized
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || t("category");
  };

  const getCategoryIcon = (categoryId: string | null) => {
    if (!categoryId) return Sparkles;
    const category = categories.find((c) => c.id === categoryId);
    const iconName = category?.icon?.toLowerCase() || "default";
    return categoryIcons[iconName] || categoryIcons.default;
  };

  const paymentMethodConfig = {
    cash: {
      label: t("paymentMethod"), // Fallback or specific key if generic
      labelKey: "cash",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: Banknote,
    },
    debit: {
      label: "Debit",
      labelKey: "debit",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      icon: Wallet,
    },
    credit: {
      label: "Credit",
      labelKey: "credit",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: CreditCard,
    },
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("addTransaction")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">{t("date")}</TableHead>
            <TableHead>{t("establishment")}</TableHead>
            <TableHead>{t("category")}</TableHead>
            <TableHead>{t("paymentMethod")}</TableHead>
            <TableHead className="text-right">{t("amount")}</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const CategoryIcon = getCategoryIcon(transaction.category_id);
            const paymentMethod = transaction.payment_method || "debit";
            // Map payment method to config or default
            const paymentConfig =
              paymentMethodConfig[
                paymentMethod as keyof typeof paymentMethodConfig
              ] || paymentMethodConfig.debit;
            const PaymentIcon = paymentConfig.icon;

            // Safe translation of payment method
            const methodKey = (
              ["cash", "debit", "credit"].includes(paymentMethod || "")
                ? paymentMethod
                : "debit"
            ) as "cash" | "debit" | "credit";

            const paymentLabel = t(`methods.${methodKey}`);

            return (
              <TableRow
                key={transaction.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>
                      {new Date(transaction.date).toLocaleDateString(
                        dateLocale,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {transaction.establishment || "—"}
                    </span>
                    {transaction.description && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {transaction.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm">
                      {getCategoryName(transaction.category_id)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${paymentConfig.color} gap-1`}>
                    <PaymentIcon className="h-3 w-3" />
                    {paymentLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={`font-semibold ${
                      transaction.type === "expense"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}>
                    {transaction.type === "expense" ? "-" : "+"}$
                    {transaction.amount.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
