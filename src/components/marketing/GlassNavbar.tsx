"use client";

import { Link, useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Menu, X, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface GlassNavbarProps {
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

export function GlassNavbar({ user, locale }: GlassNavbarProps) {
  const t = useTranslations("Landing");
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("nav.about"), href: "#problem" },
    { label: t("nav.solution"), href: "#solution" },
    { label: t("nav.pricing"), href: "#pricing" },
  ];

  const userName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitials = userName.slice(0, 2).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const toggleLocale = () => {
    const newLocale = locale === "es" ? "en" : "es";
    window.location.href = `/${newLocale}`;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-white/70 dark:bg-[#020617]/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-white/5 py-3"
            : "bg-transparent py-5"
        )}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Nestera
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLocale}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10">
                <Globe className="h-4 w-4 mr-1" />
                {locale.toUpperCase()}
              </Button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {t("nav.goToDashboard")}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        suppressHydrationWarning
                        size="icon"
                        className="rounded-full h-9 w-9 border border-slate-200 dark:border-white/10">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("nav.logout")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-full px-5 shadow-lg shadow-emerald-500/20">
                      {t("startFree")}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-900 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, idx) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-2xl font-medium text-slate-900 dark:text-white"
                  onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-4 mt-8">
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      size="lg"
                      className="bg-slate-900 text-white dark:bg-white dark:text-black">
                      {t("nav.goToDashboard")}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-slate-200 dark:border-white/20 text-slate-900 dark:text-white">
                        {t("login")}
                      </Button>
                    </Link>
                    <Link
                      href="/login?plan=pro_trial"
                      onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        size="lg"
                        className="bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90">
                        {t("tryProFree")}
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
