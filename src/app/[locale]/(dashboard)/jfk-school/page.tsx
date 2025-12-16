import { getSchoolPayments, getTotalPaidThisYear } from "@/actions/jfk-school";
import { JFKSchoolClient } from "./JFKSchoolClient";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function JFKSchoolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [payments, totalPaid, t] = await Promise.all([
    getSchoolPayments(),
    getTotalPaidThisYear(),
    getTranslations({ locale, namespace: "JFKSchool" }),
  ]);

  return (
    <PageShell title={t("title")} description={t("description")}>
      <JFKSchoolClient payments={payments} totalPaid={totalPaid} />
    </PageShell>
  );
}
