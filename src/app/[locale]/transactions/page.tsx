import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import { getTransactions, getCategories } from "@/actions/transactions";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

export default async function TransactionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [transactions, categories, t] = await Promise.all([
    getTransactions(),
    getCategories(),
    getTranslations({ locale, namespace: "Transactions" }),
  ]);

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <>
          <Button
            variant="outline"
            className="bg-white dark:bg-card shadow-sm border-none">
            <Filter className="w-4 h-4 mr-2" />
            {t("filter")}
          </Button>
          <Button
            variant="outline"
            className="bg-white dark:bg-card shadow-sm border-none">
            <Download className="w-4 h-4 mr-2" />
            {t("export")}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t("addTransaction")}
          </Button>
        </>
      }>
      <Card className="bg-white dark:bg-card shadow-sm rounded-xl border-none">
        <CardContent className="p-0">
          <TransactionsTable
            transactions={transactions}
            categories={categories || []}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
