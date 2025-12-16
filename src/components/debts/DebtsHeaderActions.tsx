"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddDebtModal } from "@/components/debts/AddDebtModal";
import { useTranslations } from "next-intl";

export function DebtsHeaderActions() {
  const t = useTranslations("Debts");

  return (
    <AddDebtModal
      trigger={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("addDebt")}
        </Button>
      }
    />
  );
}
