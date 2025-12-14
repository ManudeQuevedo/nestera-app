import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Plane,
  Shield,
  Car,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { getGoals, seedDefaultGoals } from "@/actions/goals";
import { PageShell } from "@/components/layout/PageShell";
import { getTranslations } from "next-intl/server";

const iconMap: Record<string, React.ElementType> = {
  Plane: Plane,
  Shield: Shield,
  Car: Car,
  Trophy: Trophy,
  Target: Target,
};

export default async function GoalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Seed default goals if none exist
  try {
    await seedDefaultGoals();
  } catch (e) {
    // Ignore if not logged in
  }

  const [goals, t] = await Promise.all([
    getGoals(),
    getTranslations({ locale, namespace: "Goals" }),
  ]);

  return (
    <PageShell
      title={t("title")}
      description={t("description")}
      headerAction={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t("createGoal")}
        </Button>
      }>
      <div className="grid gap-6 md:grid-cols-2">
        {goals.map((goal) => {
          const Icon = iconMap[goal.icon || "Target"] || Target;
          const percent =
            goal.target_amount > 0
              ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
              : 0;
          const remaining = goal.target_amount - goal.current_amount;
          const daysLeft = goal.deadline
            ? Math.ceil(
                (new Date(goal.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : null;

          const monthlyAmount =
            daysLeft && daysLeft > 0
              ? Math.ceil(remaining / (daysLeft / 30)).toLocaleString()
              : "---";

          return (
            <Card
              key={goal.id}
              className="bg-white dark:bg-card shadow-sm rounded-xl border-none overflow-hidden">
              <div
                className={`h-1.5 bg-gradient-to-r ${
                  goal.color || "from-blue-500 to-indigo-500"
                }`}
              />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${
                        goal.color || "from-blue-500 to-indigo-500"
                      } flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{goal.name}</h3>
                      {daysLeft !== null && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {daysLeft > 0
                            ? t("daysLeft", { days: daysLeft })
                            : t("deadlinePassed")}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-bold">
                    {percent.toFixed(0)}%
                  </span>
                </div>

                <Progress value={percent} className="h-3" />

                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">
                    ${goal.current_amount.toLocaleString()} {t("saved")}
                  </span>
                  <span className="font-medium">
                    ${goal.target_amount.toLocaleString()} {t("goal")}
                  </span>
                </div>

                {/* AI Path to Success Section */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">
                      {t("pathToSuccess")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your spending patterns, saving{" "}
                    <span className="font-semibold text-foreground">
                      {t("monthlySaving", { amount: `$${monthlyAmount}` })}
                    </span>{" "}
                    {t("willReachGoal")}
                    {daysLeft && daysLeft > 0 ? ` ${t("onTime")}` : ""}.
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    {t("aiRecommendation")}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add Goal Card */}
        <Card className="bg-white dark:bg-card shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mt-3">{t("createNewGoal")}</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {t("setSavingsTarget")}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
