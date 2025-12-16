"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Sun, Cloud, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarFamilyGreetingProps {
  familyName?: string | null;
  firstName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  collapsed?: boolean;
  className?: string;
}

type TimeOfDay = "morning" | "afternoon" | "evening";

/**
 * Determines the time of day based on current hour
 * - Morning: 05:00 - 11:59
 * - Afternoon: 12:00 - 18:59
 * - Evening: 19:00 - 04:59
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 19) {
    return "afternoon";
  } else {
    return "evening";
  }
}

const timeIcons = {
  morning: Sun,
  afternoon: Cloud,
  evening: Moon,
} as const;

const timeIconColors = {
  morning: "text-amber-400",
  afternoon: "text-sky-400",
  evening: "text-indigo-300",
} as const;

export function SidebarFamilyGreeting({
  familyName,
  firstName,
  avatarUrl,
  email,
  collapsed = false,
  className,
}: SidebarFamilyGreetingProps) {
  const t = useTranslations("Dashboard.greeting");

  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const TimeIcon = timeIcons[timeOfDay];

  // Build the display name
  const displayName = useMemo(() => {
    if (familyName) {
      return `${t("familyPrefix")} ${familyName}`;
    }
    return firstName || email?.split("@")[0] || "User";
  }, [familyName, firstName, email, t]);

  // Get user initials for avatar fallback
  const initials = useMemo(() => {
    if (familyName) return familyName.slice(0, 2).toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "US";
  }, [familyName, firstName, email]);

  // Get the time-based greeting
  const greeting = t(timeOfDay);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 mb-2 rounded-xl",
        "bg-white/5 border border-white/5",
        "hover:bg-white/10 transition-colors cursor-pointer",
        collapsed && "justify-center p-2",
        className
      )}>
      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0 border border-white/10">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Text Content - Hidden when collapsed */}
      {!collapsed && (
        <div className="flex-1 min-w-0">
          {/* Greeting Line with Icon */}
          <div className="flex items-center gap-1.5">
            <TimeIcon className={cn("h-3 w-3", timeIconColors[timeOfDay])} />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {greeting}
            </span>
          </div>

          {/* Name Line */}
          <p className="text-sm font-semibold text-white truncate max-w-[140px]">
            {displayName}
          </p>
        </div>
      )}
    </div>
  );
}
