"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSidebarLabel(key: string, newLabel: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch current settings
  const { data: profile } = await supabase
    .from("profiles")
    .select("app_settings")
    .eq("id", user.id)
    .single();

  const currentSettings = profile?.app_settings || { sidebar_labels: {} };
  
  // Deep merge logic
  const newSettings = {
    ...currentSettings,
    sidebar_labels: {
      ...(currentSettings.sidebar_labels || {}),
      [key]: newLabel,
    },
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      app_settings: newSettings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating sidebar label:", error);
    throw new Error("Failed to update label");
  }

  revalidatePath("/", "layout");
}

// Trial Management Functions

export interface TrialStatus {
  isOnTrial: boolean;
  daysRemaining: number;
  trialEndsAt: string | null;
  planTier: string;
}

export async function getTrialStatus(): Promise<TrialStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isOnTrial: false, daysRemaining: 0, trialEndsAt: null, planTier: "free" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_tier, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { isOnTrial: false, daysRemaining: 0, trialEndsAt: null, planTier: "free" };
  }

  const planTier = profile.plan_tier || "free";
  const trialEndsAt = profile.trial_ends_at;

  // Check if user is on trial (family_plus plan with trial_ends_at in the future)
  if (planTier === "family_plus" && trialEndsAt) {
    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        isOnTrial: true,
        daysRemaining: diffDays,
        trialEndsAt,
        planTier,
      };
    }
  }

  return { isOnTrial: false, daysRemaining: 0, trialEndsAt, planTier };
}

export async function cancelTrial(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      plan_tier: "free",
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error canceling trial:", error);
    return { success: false, error: "Failed to cancel trial" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Update workspace module visibility flags
 */
export interface WorkspaceModules {
  hasDebts?: boolean;
  hasSchoolExpenses?: boolean;
  enableCashWallet?: boolean;
}

export async function updateWorkspaceModules(modules: WorkspaceModules): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (modules.hasDebts !== undefined) updates.has_debts = modules.hasDebts;
  if (modules.hasSchoolExpenses !== undefined) updates.has_school_expenses = modules.hasSchoolExpenses;
  if (modules.enableCashWallet !== undefined) updates.enable_cash_wallet = modules.enableCashWallet;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    console.error("Error updating workspace modules:", error);
    return { success: false, error: "Failed to update modules" };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
