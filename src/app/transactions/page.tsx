import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Download } from "lucide-react";
import { getTransactions, getCategories } from "@/app/transactions/actions";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Transactions
            </h1>
            <p className="text-muted-foreground">
              View and manage all your transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-0">
            <TransactionsTable
              transactions={transactions}
              categories={categories || []}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
