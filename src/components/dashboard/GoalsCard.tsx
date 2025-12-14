"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/finance";
import { Target, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface GoalsCardProps {
  goals: Goal[];
}

export function GoalsCard({ goals }: GoalsCardProps) {
  const t = useTranslations("Dashboard");
  const tGoals = useTranslations("Goals");

  const activeGoals = goals.filter((g) => !g.is_completed).slice(0, 3);
  const totalProgress =
    activeGoals.length > 0
      ? activeGoals.reduce(
          (acc, g) => acc + (g.current_amount / g.target_amount) * 100,
          0
        ) / activeGoals.length
      : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            {tGoals("title")}
          </CardTitle>
          <Link href="/goals" className="text-sm text-primary hover:underline">
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("noActiveGoals")}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/goals">
                <Plus className="w-4 h-4 mr-1" />
                {tGoals("createGoal")}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Goals List */}
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const progress =
                  (goal.current_amount / goal.target_amount) * 100;
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[140px]">
                        {goal.name}
                      </span>
                      <span className="text-muted-foreground">
                        ${goal.current_amount.toLocaleString()} / $
                        {goal.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={cn(
                        "h-2",
                        progress >= 100 && "[&>div]:bg-green-500",
                        progress >= 75 &&
                          progress < 100 &&
                          "[&>div]:bg-blue-500",
                        progress < 75 && "[&>div]:bg-primary"
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* Overall Progress */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("overallProgress")}
                </span>
                <span className="font-medium">
                  {Math.round(totalProgress)}%
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
