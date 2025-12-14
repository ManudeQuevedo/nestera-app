"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@/types/finance";
import { Target, Plus } from "lucide-react";
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
          <CardTitle className="text-base font-medium tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            {tGoals("title")}
          </CardTitle>
          <Link
            href="/goals"
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            {t("viewAll")}
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length === 0 ? (
          /* Ghost State - Empty */
          <div className="ghost-state py-6">
            <Target className="ghost-state-icon" />
            <p className="ghost-state-text">{t("noActiveGoals")}</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              asChild>
              <Link href="/goals">
                <Plus className="w-3.5 h-3.5 mr-1" />
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
                      <span className="font-medium tracking-tight truncate max-w-[140px]">
                        {goal.name}
                      </span>
                      <span className="text-slate-400 tabular-nums text-xs">
                        ${goal.current_amount.toLocaleString()} / $
                        {goal.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className={cn(
                        "h-1.5",
                        progress >= 100 && "[&>div]:bg-emerald-500",
                        progress >= 75 &&
                          progress < 100 &&
                          "[&>div]:bg-blue-500",
                        progress < 75 &&
                          "[&>div]:bg-slate-400 dark:[&>div]:bg-slate-500"
                      )}
                    />
                  </div>
                );
              })}
            </div>

            {/* Overall Progress */}
            <div className="pt-3 border-t border-slate-200/50 dark:border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 text-xs">
                  {t("overallProgress")}
                </span>
                <span className="font-medium tabular-nums">
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
