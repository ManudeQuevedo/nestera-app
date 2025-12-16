"use client";

import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Languages,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "@/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("nav.about"), href: "#about" },
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

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          scrolled
            ? "bg-white/70 dark:bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-white/5 py-3"
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
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white hidden sm:block">
                Nestera
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side: Actions & User */}
          <div className="flex items-center gap-3">
            <ModeToggle />

            {/* Language Switcher (Simulated) */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 hidden sm:flex">
              <Languages className="h-4 w-4" />
            </Button>

            {user ? (
              /* Logged In State */
              <>
                <Link href="/dashboard" className="hidden sm:inline-flex">
                  <Button
                    variant="ghost"
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("nav.goToDashboard")}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-9 w-9 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-white/10">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl p-1 shadow-xl">
                    <div className="px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10 my-1" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer rounded-lg">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest State */
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-transparent px-4">
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
                className="rounded-full h-9 w-9 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10">
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
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  {link.label}
                </a>
              ))}
              <div className="h-px bg-slate-200 dark:bg-white/5 my-2 mx-2" />
              {!user && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <div className="px-4 py-3 rounded-xl text-base font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
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
