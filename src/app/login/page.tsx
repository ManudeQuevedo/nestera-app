import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, check onboarding and MFA status
  if (user) {
    // First check onboarding status
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed, has_completed_onboarding, onboarding_step")
      .eq("id", user.id)
      .single();

    // Check if onboarding is complete (support both legacy and new fields)
    const isOnboardingComplete =
      profile?.onboarding_completed ||
      profile?.has_completed_onboarding ||
      (profile?.onboarding_step && profile.onboarding_step >= 7);

    // If onboarding not complete, skip 2FA and go to onboarding
    if (!isOnboardingComplete) {
      redirect("/onboarding");
    }

    // Only check 2FA for onboarded users
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    // Check if user has TOTP factor enrolled
    const hasTOTP = factors?.totp && factors.totp.length > 0;

    if (hasTOTP && aalData?.currentLevel !== "aal2") {
      // Has MFA but not verified this session
      redirect("/verify-mfa");
    } else {
      // Fully authenticated (or No MFA configured)
      redirect("/");
    }
  }

  return <LoginClient />;
}
