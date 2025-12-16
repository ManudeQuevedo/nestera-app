"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  // Update user profile to set is_onboarded = true
  const { error } = await supabase
    .from('profiles')
    .update({ is_onboarded: true })
    .eq('id', user.id);

  if (error) {
    console.error('Error completing onboarding:', error);
    return { error: 'Failed to complete onboarding' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
