"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { locales, type Locale } from "@/config";
import { updateLanguage } from "@/actions/profiles";

const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

const LANGUAGE_FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇲🇽",
};

interface LanguageSwitcherProps {
  variant?: "dropdown" | "buttons";
}

export function LanguageSwitcher({
  variant = "dropdown",
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Optimistic update
    router.replace(pathname, { locale: newLocale });
    router.refresh();

    // Persist to database if logged in (ignores error if not)
    await updateLanguage(newLocale);
  };

  if (variant === "buttons") {
    return (
      <div className="flex gap-2">
        {locales.map((loc) => (
          <Button
            key={loc}
            variant={locale === loc ? "default" : "outline"}
            size="sm"
            onClick={() => switchLocale(loc)}
            className="gap-2">
            <span>{LANGUAGE_FLAGS[loc]}</span>
            {LANGUAGE_NAMES[loc]}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white dark:bg-card shadow-sm border-none">
          <Globe className="h-4 w-4" />
          <span>{LANGUAGE_FLAGS[locale]}</span>
          <span className="hidden sm:inline">{LANGUAGE_NAMES[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-accent" : ""}>
            <span className="mr-2">{LANGUAGE_FLAGS[loc]}</span>
            {LANGUAGE_NAMES[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
