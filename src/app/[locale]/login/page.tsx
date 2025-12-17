import { redirect } from "@/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginClient } from "./LoginClient";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in, check MFA status
  if (user) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    // Check if user has TOTP factor enrolled
    const hasTOTP = factors?.totp && factors.totp.length > 0;

    if (hasTOTP && aalData?.currentLevel !== "aal2") {
      // Has MFA but not verified this session
      redirect({ href: "/verify-mfa", locale });
    } else {
      // Fully authenticated (or No MFA configured)
      redirect({ href: "/", locale });
    }
  }

  return <LoginClient />;
}
