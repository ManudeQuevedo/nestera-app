import { createClient } from "@/utils/supabase/server";
import { setRequestLocale } from "next-intl/server";
import { GlassNavbar } from "@/components/marketing/GlassNavbar";
import { LandingClient } from "@/components/marketing/LandingClient";
import { LandingFooter } from "@/components/marketing/LandingFooter";

interface LandingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      {/* Glassmorphic Floating Navbar */}
      <GlassNavbar user={user} locale={locale} />

      {/* Scrollytelling Landing Page */}
      <LandingClient user={user} />

      {/* Premium Footer */}
      <LandingFooter />
    </>
  );
}
