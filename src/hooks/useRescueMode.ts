"use client";

import { useEffect, useRef } from "react";
import { RunwayStatus } from "@/hooks/useFinancialRunway";

const SESSION_KEY = "nestera-rescue-alert-shown";

interface UseRescueModeOptions {
  status: RunwayStatus;
  onTriggerRescue: () => void;
  enabled?: boolean;
}

/**
 * Hook to trigger rescue mode when user is in financial danger
 * Uses sessionStorage to only show once per session
 */
export function useRescueMode({
  status,
  onTriggerRescue,
  enabled = true,
}: UseRescueModeOptions) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Check if already triggered this session
    const hasShownThisSession = sessionStorage.getItem(SESSION_KEY) === "true";
    
    if (status === "danger" && !hasShownThisSession && !hasTriggered.current) {
      hasTriggered.current = true;
      sessionStorage.setItem(SESSION_KEY, "true");
      
      // Small delay for better UX (let the dashboard load first)
      const timer = setTimeout(() => {
        onTriggerRescue();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [status, onTriggerRescue, enabled]);

  // Reset function to allow re-triggering (for testing or new sessions)
  const resetRescueAlert = () => {
    sessionStorage.removeItem(SESSION_KEY);
    hasTriggered.current = false;
  };

  return { resetRescueAlert };
}

/**
 * Get the rescue mode prompt message based on locale
 */
export function getRescuePrompt(locale: string): string {
  if (locale === "es") {
    return "Detecto que tu quincena está en riesgo. ¿Quieres que revisemos tus Gastos Hormiga para liberar flujo de efectivo?";
  }
  return "I noticed a potential cash flow gap before payday. Shall we look at your 'Ant Expenses' to fix it?";
}
