import { getCategories, getTransactions } from "@/actions/transactions";
import { BudgetBentoCompact } from "@/components/budget/BudgetBentoCompact";
import { PageShell } from "@/components/layout/PageShell";
import { BudgetHeaderActions } from "@/components/budget/BudgetHeaderActions";
import { getTranslations } from "next-intl/server";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [categories, transactions, t] = await Promise.all([
    getCategories(),
    getTransactions(),
    getTranslations({ locale, namespace: "Budget" }),
  ]);

  // Calculate spending per category
  const categorySpending: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === "expense" && tx.category_id) {
      categorySpending[tx.category_id] =
        (categorySpending[tx.category_id] || 0) + tx.amount;
    }
  });

  // Calculate total budget and spent
  const expenseCategories = (categories || []).filter(
    (c) => c.type === "expense"
  );
  const totalBudget = expenseCategories.reduce(
    (sum, c) => sum + (c.budget_limit || 0),
    0
  );
  const totalSpent = Object.values(categorySpending).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={<BudgetHeaderActions />}>
      <BudgetBentoCompact
        categories={categories || []}
        transactions={transactions || []}
        categorySpending={categorySpending}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
      />
    </PageShell>
  );
}
