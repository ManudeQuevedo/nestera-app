import { getCategories, getTransactions } from "@/app/transactions/actions";
import { BudgetBentoCompact } from "@/components/budget/BudgetBentoCompact";
import { BudgetPageHeader } from "@/components/budget/BudgetPageHeader";

export default async function BudgetPage() {
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions(),
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
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <BudgetPageHeader categories={categories || []} />

        <BudgetBentoCompact
          categories={categories || []}
          transactions={transactions || []}
          categorySpending={categorySpending}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
        />
      </div>
    </main>
  );
}
