"use client";

import { useMemo } from "react";

export type RunwayStatus = "safe" | "warning" | "danger";

interface FinancialRunwayResult {
  daysRemaining: number;
  projectedBalance: number;
  status: RunwayStatus;
  nextPayDay: Date;
  dailyBudget: number;
}

interface UseFinancialRunwayOptions {
  currentBalance: number;
  averageDailySpend: number;
  customPayDay?: Date;
}

/**
 * Calculates the next pay day based on Mexican bi-weekly cycle (15th and 30th)
 */
function getNextPayDay(fromDate: Date = new Date()): Date {
  const day = fromDate.getDate();
  const month = fromDate.getMonth();
  const year = fromDate.getFullYear();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  if (day < 15) {
    // Next payday is the 15th of this month
    return new Date(year, month, 15);
  } else if (day < 30) {
    // Next payday is the 30th (or last day if month is shorter)
    const payDay = Math.min(30, lastDayOfMonth);
    return new Date(year, month, payDay);
  } else {
    // We're at the 30th or 31st, next payday is 15th of next month
    return new Date(year, month + 1, 15);
  }
}

/**
 * Calculates the number of days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / oneDay);
}

/**
 * Hook to analyze financial runway until next paycheck
 * 
 * @param options.currentBalance - Current available balance
 * @param options.averageDailySpend - Average daily spending amount
 * @param options.customPayDay - Optional custom payday date
 * 
 * @returns Runway analysis with days remaining, projected balance, and status
 */
export function useFinancialRunway({
  currentBalance,
  averageDailySpend,
  customPayDay,
}: UseFinancialRunwayOptions): FinancialRunwayResult {
  return useMemo(() => {
    const today = new Date();
    const nextPayDay = customPayDay || getNextPayDay(today);
    const daysRemaining = Math.max(0, daysBetween(today, nextPayDay));
    
    // Project how much will be spent by payday
    const projectedSpend = averageDailySpend * daysRemaining;
    const projectedBalance = currentBalance - projectedSpend;
    
    // Calculate daily budget if we want to survive until payday
    const dailyBudget = daysRemaining > 0 
      ? currentBalance / daysRemaining 
      : currentBalance;

    // Determine status based on multiple factors
    let status: RunwayStatus;
    
    // Calculate runway days (how many days the balance can last)
    const runwayDays = averageDailySpend > 0 
      ? currentBalance / averageDailySpend 
      : Infinity;

    if (projectedBalance >= 0 && runwayDays >= daysRemaining) {
      // Will have money left over on payday - all good!
      status = "safe";
    } else if (runwayDays >= daysRemaining * 0.7) {
      // Cutting it close, within 70% of needed days
      status = "warning";
    } else {
      // Won't make it to payday at current spending rate
      status = "danger";
    }

    // Edge case: if very low balance but payday is tomorrow
    if (daysRemaining <= 1 && currentBalance > 0) {
      status = "safe";
    }

    // Edge case: if balance is already negative
    if (currentBalance <= 0) {
      status = "danger";
    }

    return {
      daysRemaining,
      projectedBalance,
      status,
      nextPayDay,
      dailyBudget,
    };
  }, [currentBalance, averageDailySpend, customPayDay]);
}

/**
 * Helper to get runway message key based on status and locale context
 */
export function getRunwayMessageKey(status: RunwayStatus): string {
  switch (status) {
    case "safe":
      return "runway.safe";
    case "warning":
      return "runway.warning";
    case "danger":
      return "runway.danger";
    default:
      return "runway.safe";
  }
}
