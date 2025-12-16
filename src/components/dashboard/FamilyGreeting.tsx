"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface FamilyGreetingProps {
  familyName?: string | null;
  firstName?: string | null;
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

export function FamilyGreeting({
  familyName,
  firstName,
  className,
}: FamilyGreetingProps) {
  const t = useTranslations("Dashboard.greeting");

  const timeOfDay = useMemo(() => getTimeOfDay(), []);

  // Build the name display
  const nameDisplay = useMemo(() => {
    if (familyName) {
      return `${t("familyPrefix")} ${familyName}`;
    }
    return firstName || "";
  }, [familyName, firstName, t]);

  // Get the time-based greeting
  const greeting = t(timeOfDay);

  return (
    <h1 className={className}>
      {greeting}
      {nameDisplay && (
        <>
          , <span className="font-semibold">{nameDisplay}</span>
        </>
      )}
    </h1>
  );
}

/**
 * Hook to get time-aware greeting text
 * Use this if you need the raw greeting string
 */
export function useTimeGreeting() {
  const t = useTranslations("Dashboard.greeting");
  const timeOfDay = useMemo(() => getTimeOfDay(), []);

  return {
    timeOfDay,
    greeting: t(timeOfDay),
    familyPrefix: t("familyPrefix"),
  };
}
