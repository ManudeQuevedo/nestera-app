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
