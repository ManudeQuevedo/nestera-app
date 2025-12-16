import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, PiggyBank, Building2 } from "lucide-react";

export default function WalletPage() {
  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your accounts and payment methods
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Main Account",
              icon: Wallet,
              balance: 0,
              type: "Checking",
            },
            { name: "Savings", icon: PiggyBank, balance: 0, type: "Savings" },
            {
              name: "Credit Card",
              icon: CreditCard,
              balance: 0,
              type: "Credit",
            },
            {
              name: "Investment",
              icon: Building2,
              balance: 0,
              type: "Brokerage",
            },
          ].map((account, i) => (
            <Card
              key={i}
              className="bg-card border-border/50 shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {account.name}
                </CardTitle>
                <account.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${account.balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{account.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border/50 shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Connect Your Accounts</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mt-2">
              Link your bank accounts, credit cards, and investment accounts to
              see your complete financial picture.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
