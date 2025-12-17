import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { createClient } from "@/utils/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's current onboarding step to resume progress
  let initialStep = 1;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_step")
      .eq("id", user.id)
      .single();

    if (profile?.onboarding_step) {
      initialStep = profile.onboarding_step;
    }
  }

  return <OnboardingWizard initialStep={initialStep as any} />;
}
