import {
  getCategories,
  getTransactions,
  getDebts,
} from "@/actions/transactions";
import { TotalBalanceCard } from "@/components/dashboard/TotalBalanceCard";
import { ExpenseTrendChart } from "@/components/dashboard/ExpenseTrendChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DebtSummaryCard } from "@/components/dashboard/DebtSummaryCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, avatar_url, family_id")
    .eq("id", user.id)
    .single();

  // Get name from profile, user metadata, or email
  const firstName =
    profile?.first_name ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.user_metadata?.name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    null;

  return {
    ...profile,
    first_name: firstName,
  };
}

async function getGoals() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .order("priority", { ascending: true });
  return data || [];
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [categories, transactions, debts, profile, goals, t] =
    await Promise.all([
      getCategories(),
      getTransactions(),
      getDebts(),
      getUserProfile(),
      getGoals(),
      getTranslations({ locale, namespace: "Dashboard" }),
    ]);

  // Calculate Balance
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Calculate Total Debt
  const totalDebt = debts.reduce((acc, d) => acc + (d.balance || 0), 0);
  const activeDebts = debts.filter((d) => d.status !== "paid_off");

  const firstName = profile?.first_name || "there";

  return (
    <PageShell
      title={t("welcome", { name: firstName })}
      headerAction={
        <Button
          variant="outline"
          className="bg-white dark:bg-card shadow-sm border-none text-sm h-9">
          <Download className="w-4 h-4 mr-2 text-muted-foreground" />
          {t("export")}
        </Button>
      }>
      {/* Bento Grid Layout - Premium spacing */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* ===== ROW 1: Top Section ===== */}

        {/* Column 1: Total Balance Card (Span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <TotalBalanceCard balance={balance} categories={categories || []} />
        </div>

        {/* Column 2: Debt Summary Card (Span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <DebtSummaryCard totalDebt={totalDebt} debts={activeDebts} />
        </div>

        {/* Column 3: Recent Activity (Span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <RecentTransactions
            transactions={transactions.slice(0, 5)}
            categories={categories || []}
            compact
          />
        </div>

        {/* ===== ROW 2: Bottom Section ===== */}

        {/* Column 1: Goals Card (Span 4) */}
        <div className="col-span-12 lg:col-span-4">
          <GoalsCard goals={goals} />
        </div>

        {/* Column 2: Spending Chart (Span 8) */}
        <div className="col-span-12 lg:col-span-8">
          <ExpenseTrendChart transactions={transactions} expanded />
        </div>
      </div>
    </PageShell>
  );
}
