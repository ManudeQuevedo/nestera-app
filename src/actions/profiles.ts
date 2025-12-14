"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLanguage(locale: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ language: locale })
      .eq("id", user.id);

    if (error) throw error;
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating language:", error);
    return { success: false, error: "Failed to update language" };
  }
}

export async function getProfileLanguage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("language")
      .eq("id", user.id)
      .single();

    if (error) return null;
    return data?.language || null;
  } catch (error) {
    return null;
  }
}
