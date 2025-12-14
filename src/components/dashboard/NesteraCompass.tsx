"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

interface UrgentAction {
  label: string;
  href: string;
  count?: number;
}

interface NesteraCompassProps {
  healthScore: number;
  insight: string;
  userName: string;
  urgentAction?: UrgentAction;
  weeklyChange?: number;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 80)
    return {
      color: "text-emerald-400",
      glow: "score-glow",
      ring: "ring-emerald-500/20",
    };
  if (score >= 60)
    return {
      color: "text-amber-400",
      glow: "score-glow-warning",
      ring: "ring-amber-500/20",
    };
  return {
    color: "text-rose-400",
    glow: "score-glow-danger",
    ring: "ring-rose-500/20",
  };
}

function getScoreLabelKey(score: number): string {
  if (score >= 90) return "excellent";
  if (score >= 80) return "great";
  if (score >= 70) return "good";
  if (score >= 60) return "fair";
  if (score >= 40) return "needsWork";
  return "critical";
}

export function NesteraCompass({
  healthScore,
  insight,
  userName,
  urgentAction,
  weeklyChange = 0,
  className,
}: NesteraCompassProps) {
  const t = useTranslations("Dashboard");
  const scoreStyle = getScoreColor(healthScore);
  const scoreLabelKey = getScoreLabelKey(healthScore);
  const scoreLabel = t(`compass.scoreLabels.${scoreLabelKey}`);
  const isPositiveChange = weeklyChange >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl h-28",
        // Smoked Glass
        "bg-white dark:bg-[#0B1121]/60",
        "dark:backdrop-blur-md",
        "border border-slate-200/50 dark:border-white/5",
        "shadow-sm dark:shadow-2xl",
        className
      )}>
      <div className="relative h-full px-5 py-4 flex items-center justify-between gap-6">
        {/* Left Section: Insight */}
        <div className="flex-1 min-w-0">
          {/* Title - Subtle */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
              {t("compass.title")}
            </span>
          </div>

          {/* Insight Text - Prominent */}
          <p className="text-base lg:text-lg font-medium text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2">
            {insight}
          </p>

          {/* Weekly Trend + Action */}
          <div className="flex items-center gap-3 mt-2">
            {weeklyChange !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  isPositiveChange
                    ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
                )}>
                {isPositiveChange ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span className="tabular-nums">{Math.abs(weeklyChange)}%</span>
              </div>
            )}

            {urgentAction && (
              <Link href={urgentAction.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-500/10">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {urgentAction.label}
                  <ChevronRight className="h-3 w-3 ml-0.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Right Section: Score */}
        <div className="flex-shrink-0 flex items-center gap-4">
          {/* Score Circle */}
          <div
            className={cn(
              "relative flex items-center justify-center",
              "h-16 w-16",
              "rounded-full",
              "bg-slate-100 dark:bg-slate-900/60",
              "ring-2",
              scoreStyle.ring,
              scoreStyle.glow
            )}>
            <div className="text-center">
              <span
                className={cn(
                  "text-xl font-bold tracking-tight tabular-nums",
                  scoreStyle.color
                )}>
                {healthScore}
              </span>
            </div>
          </div>

          {/* Score Label */}
          <div className="hidden lg:block text-right">
            <p
              className={cn(
                "text-sm font-medium tracking-tight",
                scoreStyle.color
              )}>
              {scoreLabel}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t("compass.score")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
