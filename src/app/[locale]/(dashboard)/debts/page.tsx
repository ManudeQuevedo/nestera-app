import { getDebts } from "@/actions/debts";
import { DebtsClient } from "./DebtsClient";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function DebtsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [debts, t] = await Promise.all([
    getDebts(),
    getTranslations({ locale, namespace: "Debts" }),
  ]);

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("addDebt")}
        </Button>
      }>
      <DebtsClient debts={debts || []} />
    </PageShell>
  );
}
