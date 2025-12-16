import { getCategories } from "@/actions/transactions";
import { DashboardClientLayout } from "@/components/layout/DashboardClientLayout";
import { createClient } from "@/utils/supabase/server";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const categories = await getCategories();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan = "FREE";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();

    if (profile?.subscription_tier) {
      plan = profile.subscription_tier;
    }
  }

  return (
    <DashboardClientLayout categories={categories || []} plan={plan}>
      {children}
    </DashboardClientLayout>
  );
}
