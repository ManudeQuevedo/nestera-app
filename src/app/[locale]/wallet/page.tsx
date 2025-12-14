import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, PiggyBank, Building2, Plus } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function WalletPage() {
  const t = await getTranslations("Accounts");

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("addAccount")}
        </Button>
      }>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Main Account",
              icon: Wallet,
              balance: 0,
              type: t("bank"),
            },
            { name: "Savings", icon: PiggyBank, balance: 0, type: t("bank") },
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
              type: t("investment"),
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
            <h3 className="text-lg font-medium">{t("title")}</h3>
            <p className="text-muted-foreground text-sm text-center max-w-md mt-2">
              {t("description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
