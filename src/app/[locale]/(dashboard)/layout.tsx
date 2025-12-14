import { Sidebar } from "@/components/layout/Sidebar";
import { getCategories } from "@/actions/transactions";
import { AskAIBubble } from "@/components/ai/AskAIBubble";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const categories = await getCategories();

  return (
    <>
      {/* App Shell - Fixed Viewport */}
      <div className="flex h-screen w-screen overflow-hidden bg-[#e7ecef] dark:bg-obsidian-gradient">
        {/* Sidebar - Floating (positioned via fixed in component) */}
        <Sidebar categories={categories || []} />

        {/* Main Content Area - Account for floating sidebar */}
        <main className="flex-1 h-full overflow-hidden md:pl-[calc(15rem+2rem)] relative">
          {/* Scrollable Content Wrapper */}
          <div className="scrollable-canvas p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Floating AI Chat Bubble */}
      <AskAIBubble />
    </>
  );
}
