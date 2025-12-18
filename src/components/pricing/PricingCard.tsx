"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  yearlyPrice: number;
  planName: string;
}

export function PricingCard({ yearlyPrice, planName }: PricingCardProps) {
  const t = useTranslations("Pricing");
  const monthlyEquivalent = yearlyPrice / 12;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{planName}</h3>

      <div className="mt-4 flex flex-col">
        {/* Total Annual Amount */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-slate-900">
            {formatMoney(yearlyPrice)}
          </span>
          <span className="text-sm font-semibold text-slate-500">
            /{t("yearSuffix")}
          </span>
        </div>

        {/* Monthly Breakdown */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {t("saveLabel")}
          </span>
          <p className="text-xs text-slate-500">
            {t("equivalentTo")}{" "}
            <span className="font-medium text-slate-900">
              {formatMoney(monthlyEquivalent)}
            </span>{" "}
            /{t("monthSuffix")}
          </p>
        </div>
      </div>

      <Button className="mt-6 w-full">{t("subscribeButton")}</Button>
    </div>
  );
}
