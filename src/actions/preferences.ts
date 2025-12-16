"use server";

import { createClient } from "@/utils/supabase/server";

interface UserPreferences {
  enabled_modules: string[];
  has_school_expenses: boolean;
  has_debt: boolean;
  pain_point: "ants" | "debts" | "chaos";
  onboarding_completed: boolean;
}

export async function saveUserPreferences(preferences: UserPreferences) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Upsert user preferences
  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      enabled_modules: preferences.enabled_modules,
      has_school_expenses: preferences.has_school_expenses,
      has_debt: preferences.has_debt,
      pain_point: preferences.pain_point,
      onboarding_completed: preferences.onboarding_completed,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });

  if (error) {
    console.error("Failed to save preferences:", error);
    throw new Error("Failed to save preferences");
  }

  return { success: true };
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    enabled_modules: data.enabled_modules || [],
    has_school_expenses: data.has_school_expenses ?? false,
    has_debt: data.has_debt ?? false,
    pain_point: data.pain_point ?? "chaos",
    onboarding_completed: data.onboarding_completed ?? false,
  };
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const prefs = await getUserPreferences();
  return prefs?.onboarding_completed ?? false;
}
