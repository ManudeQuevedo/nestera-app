"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface OnboardingData {
  sidebarLabels: {
    jfkSchool: string;
    [key: string]: string;
  };
}

// Family OS Configurator types
export interface FamilyOSConfig {
  familyMode: "solo" | "partner" | "family";
  incomeFrequency: "monthly" | "biweekly" | "variable";
  cashUsageLevel: number; // 0-100
  hasDebts: boolean;
  hasSchoolExpenses: boolean;
  antExpenseVices: string[];
}

/**
 * Save progress for a specific onboarding step
 */
export async function saveOnboardingStep(step: number, data: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_step: step,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error saving onboarding step:", error);
    throw new Error("Failed to save progress");
  }

  return { success: true };
}

/**
 * Save Family OS Configurator settings
 */
export async function saveConfiguratorSettings(config: Partial<FamilyOSConfig>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Build update object with only provided fields
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (config.familyMode !== undefined) updates.family_mode = config.familyMode;
  if (config.incomeFrequency !== undefined) updates.income_frequency = config.incomeFrequency;
  if (config.cashUsageLevel !== undefined) updates.cash_usage_level = config.cashUsageLevel;
  if (config.hasDebts !== undefined) updates.has_debts = config.hasDebts;
  if (config.hasSchoolExpenses !== undefined) updates.has_school_expenses = config.hasSchoolExpenses;
  if (config.antExpenseVices !== undefined) updates.ant_expense_vices = config.antExpenseVices;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Error saving configurator settings:", error);
    throw new Error("Failed to save settings");
  }

  return { success: true };
}

/**
 * Complete onboarding and redirect to dashboard
 */
export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get current profile to check which modules to enable
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_debts, has_school_expenses, cash_usage_level")
    .eq("id", user.id)
    .single();

  // Build enabled modules based on config
  const enabledModules = [
    "dashboard",
    "transactions",
    "budget",
    "goals",
    "insights",
  ];
  
  if (profile?.has_debts) enabledModules.push("debts");
  if (profile?.has_school_expenses) enabledModules.push("school_payments");
  if (profile?.cash_usage_level > 20) enabledModules.push("ant_expenses");

  // Update profile with onboarding data 
  const { error } = await supabase
    .from("profiles")
    .update({
      has_completed_onboarding: true,
      onboarding_step: 5, // Now 5 steps instead of 7
      app_settings: {
        sidebar_labels: {
          school_payments: data.sidebarLabels.jfkSchool || "School Payments",
          investments: "Inversiones",
        },
        enabled_modules: enabledModules,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error completing onboarding:", error);
    throw new Error("Failed to complete onboarding");
  }

  revalidatePath("/", "layout"); // Revalidate everything
}

