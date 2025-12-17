"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Type definitions
export interface Goal {
  id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  type: "short" | "mid" | "long";
  deadline?: string;
  priority?: number;
}

export interface AntExpense {
  id?: string;
  name: string;
  amount: number;
  frequency: "once" | "daily" | "weekly" | "monthly";
  category?: string;
}

export interface OnboardingConfig {
  hasSchoolExpenses: boolean;
  monthlyIncome: number;
  currency: string;
}

// Save goals during onboarding
export async function saveOnboardingGoals(goals: Goal[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Insert all goals
  const goalsWithUser = goals.map((goal) => ({
    user_id: user.id,
    name: goal.name,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount || 0,
    type: goal.type,
    deadline: goal.deadline || null,
    priority: goal.priority || 1,
  }));

  const { error } = await supabase
    .from("goals")
    .insert(goalsWithUser);

  if (error) {
    console.error("Error saving goals:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// Save ant expenses during onboarding
export async function saveOnboardingAntExpenses(expenses: AntExpense[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const expensesWithUser = expenses.map((expense) => ({
    user_id: user.id,
    name: expense.name,
    amount: expense.amount,
    frequency: expense.frequency,
    category: expense.category || null,
  }));

  const { error } = await supabase
    .from("ant_expenses")
    .insert(expensesWithUser);

  if (error) {
    console.error("Error saving ant expenses:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// Save onboarding configuration (school expenses, income, etc.)
export async function saveOnboardingConfig(config: OnboardingConfig) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      has_school_expenses: config.hasSchoolExpenses,
      monthly_income: config.monthlyIncome,
      currency: config.currency,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error saving config:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
