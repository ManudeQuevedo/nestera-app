import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check if user needs MFA setup
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasTOTP = factors?.totp && factors.totp.length > 0;
      

      // Get user's preferred language and onboarding status
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("language, onboarding_completed, has_completed_onboarding, onboarding_step")
        .eq("id", user!.id)
        .single();
        
      const userLocale = profile?.language || "en";
      
      // Check if onboarding is complete (support both legacy and new fields)
      const isOnboardingComplete = profile?.onboarding_completed || 
        profile?.has_completed_onboarding || 
        (profile?.onboarding_step && profile.onboarding_step >= 7);

      /* 
       * 2FA is OPTIONAL and only enforced AFTER onboarding is complete.
       * If onboarding is not complete, skip 2FA check entirely and let 
       * middleware redirect to /onboarding.
       */
      
      if (!isOnboardingComplete) {
        // User hasn't completed onboarding - redirect to onboarding (skip 2FA)
        return NextResponse.redirect(`${origin}/${userLocale}/onboarding`);
      }
      
      // Only enforce 2FA for onboarded users who have it set up
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (hasTOTP && aalData?.currentLevel !== "aal2") {
        // Has MFA but not verified this session - verify it
        return NextResponse.redirect(`${origin}/${userLocale}/verify-mfa`);
      }
      
      // Fully authenticated - Respect next param but ensure locale prefix matches preference
      // If next is root '/', use '/locale'
      // If next has locale, replace it with userLocale IF it differs?
      // For simplicity, just prefix the next path with userLocale if it doesn't have one, 
      // or replace the existing one.
      
      let finalPath = next;
      // Remove existing locale if present to prepend the correct one
      if (finalPath.startsWith("/en/") || finalPath.startsWith("/es/")) {
        finalPath = finalPath.replace(/^\/(en|es)/, "");
      } else if (finalPath === "/en" || finalPath === "/es") {
        finalPath = "";
      }
      
      // Ensure it starts with /
      if (!finalPath.startsWith("/") && finalPath !== "") {
        finalPath = "/" + finalPath;
      }
      
      return NextResponse.redirect(`${origin}/${userLocale}${finalPath}`);
    }
    
    // Check if error is due to email restriction
    if (error.message.includes("Access Restricted") || error.message.includes("authorized")) {
      return NextResponse.redirect(`${origin}/login?error=access_restricted`);
    }
  }

  // OAuth flow failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
