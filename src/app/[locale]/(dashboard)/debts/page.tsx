import { getDebts } from "@/actions/debts";
import { DebtsClient } from "./DebtsClient";
import { PageShell } from "@/components/layout/PageShell";
import { DebtsHeaderActions } from "@/components/debts/DebtsHeaderActions";
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
      headerAction={<DebtsHeaderActions />}>
      <DebtsClient debts={debts || []} />
    </PageShell>
  );
}
