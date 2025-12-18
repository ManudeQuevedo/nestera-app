"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "@/navigation"; // Added usePathname
import { UserMenuDropdown } from "@/components/marketing/UserMenuDropdown";

interface PublicNavbarProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  locale: string;
}

export function PublicNavbar({ user, locale }: PublicNavbarProps) {
  const t = useTranslations("Landing");
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check both window and body scroll since CSS may cause body to scroll instead of window
      const scrollPosition =
        window.scrollY ||
        document.body.scrollTop ||
        document.documentElement.scrollTop;
      setScrolled(scrollPosition > 20);
    };

    // Listen on both window and body for scroll events
    window.addEventListener("scroll", handleScroll);
    document.body.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinks = [
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.solution"), href: "#solution" },
    { label: t("nav.pricing"), href: "#pricing" },
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          scrolled
            ? "bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-slate-900/5 border-b border-slate-200/80 py-3"
            : "bg-transparent border-transparent py-5"
        )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-8 md:gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-300">
                N
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
                Nestera
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-500 transition-colors duration-200 cursor-pointer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side: Actions & User */}
          <div className="flex items-center gap-3">
            {/* ModeToggle removed or kept? User said "Dashboard... Must retain...". Landing "should NOT respond".
                 If I keep it, it changes the cookie/global state.
                 I'll keep it but maybe it looks weird. I'll leave it for now but remove dark styles from the navbar itself.
             */}
            {/* ModeToggle removed as per requirement */}
            {/* <ModeToggle /> */}

            {/* Language Switcher (Segmented) */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-1 border border-slate-200/50">
              <Link
                href={pathname}
                locale="es"
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full transition-all",
                  locale === "es"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                ES
              </Link>
              <Link
                href={pathname}
                locale="en"
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-full transition-all",
                  locale === "en"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                EN
              </Link>
            </div>

            {user ? (
              <UserMenuDropdown user={user} />
            ) : (
              /* Guest State */
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-emerald-500 hover:bg-transparent px-4">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="sm"
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-medium px-6 h-10 shadow-md transition-all hover:scale-105 ml-1">
                    {t("startFree")}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden ml-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full h-9 w-9 text-slate-600 hover:bg-slate-100">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - "Glass Sheet" */}
      {mobileMenuOpen && (
        <div className="fixed top-[4.5rem] left-0 right-0 z-40 animate-in fade-in slide-in-from-top-4 origin-top md:hidden p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-4 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-emerald-500 hover:bg-slate-100 transition-all cursor-pointer">
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-slate-200 my-2 mx-2" />
              {!user && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <div className="px-4 py-3 rounded-xl text-base font-medium text-slate-600 hover:text-emerald-500 hover:bg-slate-100 transition-all">
                    {t("login")}
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
