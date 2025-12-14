import { getSchoolPayments, getTotalPaidThisYear } from "@/actions/jfk-school";
import { JFKSchoolClient } from "./JFKSchoolClient";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("addPayment")}
        </Button>
      }>
      <JFKSchoolClient payments={payments} totalPaid={totalPaid} />
    </PageShell>
  );
}
