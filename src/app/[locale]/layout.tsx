import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/config";

import { Sidebar } from "@/components/layout/Sidebar";
import { getCategories } from "@/actions/transactions";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AskAIBubble } from "@/components/ai/AskAIBubble";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Family Wealth OS",
  description: "Your financial command center",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const [messages, categories] = await Promise.all([
    getMessages({ locale }),
    getCategories(),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html { visibility: hidden; }
            html.theme-ready { visibility: visible; }
          `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {/* App Shell - Fixed Viewport */}
            <div className="flex h-screen w-screen overflow-hidden">
              {/* Sidebar - Fixed width, full height */}
              <Sidebar categories={categories || []} />

              {/* Main Content Area - Scrollable Canvas */}
              <main className="flex-1 h-full overflow-hidden md:pl-64 relative bg-[#e7ecef] dark:bg-[#002855]">
                {/* Scrollable Content Wrapper */}
                <div className="scrollable-canvas p-6">{children}</div>
              </main>
            </div>

            {/* Floating AI Chat Bubble */}
            <AskAIBubble />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
