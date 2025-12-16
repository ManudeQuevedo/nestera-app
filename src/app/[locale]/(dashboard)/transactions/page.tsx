import { Card, CardContent } from "@/components/ui/card";
import { getTransactions, getCategories } from "@/actions/transactions";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { TransactionsHeaderActions } from "@/components/transactions/TransactionsHeaderActions";
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
        <TransactionsHeaderActions categories={categories || []} />
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
