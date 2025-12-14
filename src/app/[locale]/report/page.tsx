import { AnalyticsClient } from "./AnalyticsClient";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Insights" });

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      constrainWidth={false}>
      <AnalyticsClient />
    </PageShell>
  );
}
