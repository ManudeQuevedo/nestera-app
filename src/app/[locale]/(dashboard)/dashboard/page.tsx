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
import { NesteraCompass } from "@/components/dashboard/NesteraCompass";
import { createClient } from "@/utils/supabase/server";
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

// Calculate a simple health score based on financial data
function calculateHealthScore(
  balance: number,
  totalDebt: number,
  monthlyIncome: number,
  antExpenses: number
): number {
  let score = 70; // Base score

  // Positive balance adds points
  if (balance > 0) score += 10;
  if (balance > monthlyIncome * 0.5) score += 5;

  // High debt reduces score
  const debtToIncomeRatio = monthlyIncome > 0 ? totalDebt / monthlyIncome : 0;
  if (debtToIncomeRatio > 3) score -= 20;
  else if (debtToIncomeRatio > 2) score -= 10;
  else if (debtToIncomeRatio < 1) score += 5;

  // Ant expenses (impulse spending) reduce score
  const antRatio = monthlyIncome > 0 ? antExpenses / monthlyIncome : 0;
  if (antRatio > 0.2) score -= 10;
  else if (antRatio < 0.1) score += 5;

  return Math.min(100, Math.max(0, score));
}

// Generate insight based on financial data - returns key and params for translations
function getInsightKey(
  balance: number,
  weeklyExpenseChange: number,
  antExpenses: number
): { key: string; params: Record<string, number> } {
  if (weeklyExpenseChange < -10) {
    return {
      key: "compass.insights.spendingDown",
      params: { percent: Math.abs(weeklyExpenseChange) },
    };
  }
  if (weeklyExpenseChange > 15) {
    return {
      key: "compass.insights.spendingUp",
      params: { percent: weeklyExpenseChange },
    };
  }
  if (balance > 0) {
    return { key: "compass.insights.positiveBalance", params: {} };
  }
  return { key: "compass.insights.buildSavings", params: {} };
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

  // Calculate ant expenses (small impulse purchases)
  const antExpenses = transactions
    .filter((t) => t.type === "expense" && t.amount < 200)
    .reduce((acc, t) => acc + t.amount, 0);

  // Calculate health score
  const healthScore = calculateHealthScore(
    balance,
    totalDebt,
    totalIncome,
    antExpenses
  );

  // Generate insight (mock weekly change for demo)
  const weeklyChange = -12; // In production, calculate from actual data
  const insightData = getInsightKey(balance, weeklyChange, antExpenses);
  const insight = t(insightData.key, insightData.params);

  const firstName = profile?.first_name || "there";

  // Check for suspicious transactions (mock for demo)
  const suspiciousCount = 0; // In production, detect anomalies

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Nestera Compass - Financial Health Center */}
      <NesteraCompass
        healthScore={healthScore}
        insight={insight}
        userName={firstName}
        weeklyChange={weeklyChange}
        urgentAction={
          suspiciousCount > 0
            ? {
                label: `Review ${suspiciousCount} Suspicious Transactions`,
                href: "/transactions?filter=suspicious",
                count: suspiciousCount,
              }
            : undefined
        }
      />

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
    </div>
  );
}
