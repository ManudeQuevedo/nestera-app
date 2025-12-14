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
      

      // Get user's preferred language
      const { data: profile } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", (await supabase.auth.getUser()).data.user!.id)
        .single();
        
      const userLocale = profile?.language || "en";

      if (!hasTOTP) {
        // Redirect to MFA setup
        return NextResponse.redirect(`${origin}/${userLocale}/setup-mfa`);
      }
      
      // Check AAL level
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalData?.currentLevel !== "aal2") {
        // Needs MFA verification
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
