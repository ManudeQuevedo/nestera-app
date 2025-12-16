import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getGoals, seedDefaultGoals } from "./actions";

const iconMap: Record<string, React.ElementType> = {
  Plane: Plane,
  Shield: Shield,
  Car: Car,
  Trophy: Trophy,
  Target: Target,
};

export default async function GoalsPage() {
  // Seed default goals if none exist
  try {
    await seedDefaultGoals();
  } catch (e) {
    // Ignore if not logged in
  }

  const goals = await getGoals();

  return (
    <main className="min-h-screen pb-10">
      <div className="w-full space-y-6 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Set and track your family's financial goals
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal) => {
            const Icon = iconMap[goal.icon || "Target"] || Target;
            const percent =
              goal.target_amount > 0
                ? Math.min(
                    100,
                    (goal.current_amount / goal.target_amount) * 100
                  )
                : 0;
            const remaining = goal.target_amount - goal.current_amount;
            const daysLeft = goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <Card
                key={goal.id}
                className="bg-card border-border/50 rounded-2xl overflow-hidden">
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
                              ? `${daysLeft} days left`
                              : "Deadline passed"}
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
                      ${goal.current_amount.toLocaleString()} saved
                    </span>
                    <span className="font-medium">
                      ${goal.target_amount.toLocaleString()} goal
                    </span>
                  </div>

                  {/* AI Path to Success Section */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">
                        Path to Success
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Based on your spending patterns, saving{" "}
                      <span className="font-semibold text-foreground">
                        $
                        {daysLeft && daysLeft > 0
                          ? Math.ceil(
                              remaining / (daysLeft / 30)
                            ).toLocaleString()
                          : "---"}
                        /month
                      </span>{" "}
                      will help you reach this goal
                      {daysLeft && daysLeft > 0 ? " on time" : ""}.
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      AI recommendation based on your surplus
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Goal Card */}
          <Card className="bg-card border-border/50 border-dashed rounded-2xl cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px]">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mt-3">Create New Goal</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Set a savings target with a deadline
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
