"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface OnboardingData {
  sidebarLabels: {
    jfkSchool: string;
    [key: string]: string;
  };
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

  // Update profile with onboarding data 
  const { error } = await supabase
    .from("profiles")
    .update({
      has_completed_onboarding: true,
      onboarding_step: 7,
      app_settings: {
        sidebar_labels: {
          school_payments: data.sidebarLabels.jfkSchool || "School Payments",
          investments: "Inversiones",
        },
        enabled_modules: [
          "dashboard",
          "debts",
          "transactions",
          "school_payments",
          "budget",
          "goals",
        ],
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
