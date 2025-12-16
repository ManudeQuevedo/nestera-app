import {
  getCategories,
  getTransactions,
  getDebts,
} from "@/app/transactions/actions";
import { TotalBalanceCard } from "@/components/dashboard/TotalBalanceCard";
import { ExpenseTrendChart } from "@/components/dashboard/ExpenseTrendChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { GenerateDemoButton } from "@/components/dashboard/GenerateDemoButton";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";

async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, avatar_url")
    .eq("id", user.id)
    .single();

  return profile;
}

export default async function Home() {
  const [categories, transactions, debts, profile] = await Promise.all([
    getCategories(),
    getTransactions(),
    getDebts(),
    getUserProfile(),
  ]);

  // Calculate Balance
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const isEmpty = transactions.length === 0;
  const firstName = profile?.first_name || "there";

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight dark:text-gradient-hero">
            Welcome, {firstName}!
          </h1>
          <div className="flex gap-2">
            {isEmpty && <GenerateDemoButton />}
            <Button
              variant="outline"
              className="bg-card border-border/50 shadow-sm text-sm h-9">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              Calendar
            </Button>
            <Button
              variant="outline"
              className="bg-card border-border/50 shadow-sm text-sm h-9">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Card Row */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Total Balance - Full width on mobile, 7 cols on desktop */}
          <div className="col-span-12 lg:col-span-7">
            <TotalBalanceCard balance={balance} categories={categories || []} />
          </div>
          {/* Expense Trend Chart - 5 cols on desktop */}
          <div className="col-span-12 lg:col-span-5">
            <ExpenseTrendChart transactions={transactions} />
          </div>
        </div>

        {/* Activity Row */}
        <div className="w-full">
          <RecentTransactions
            transactions={transactions}
            categories={categories || []}
          />
        </div>
      </div>
    </main>
  );
}
