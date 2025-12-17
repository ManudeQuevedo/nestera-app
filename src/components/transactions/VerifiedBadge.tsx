"use client";

import { CheckCircle2, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  source: "bank" | "manual";
  isVerified: boolean;
  size?: "sm" | "md";
  showTooltip?: boolean;
}

export function VerifiedBadge({
  source,
  isVerified,
  size = "sm",
  showTooltip = true,
}: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  const content = (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        size === "sm" ? "w-5 h-5" : "w-6 h-6",
        source === "bank" && isVerified
          ? "bg-emerald-100 text-emerald-600"
          : "bg-slate-100 text-slate-400"
      )}>
      {source === "bank" && isVerified ? (
        <CheckCircle2 className={iconSize} />
      ) : (
        <Clock className={iconSize} />
      )}
    </span>
  );

  if (!showTooltip) return content;

  const tooltipText =
    source === "bank" && isVerified
      ? "Verificado desde estado de cuenta"
      : "Entrada manual (pendiente verificación)";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simpler inline version
export function SourceIndicator({
  source,
  isVerified,
}: {
  source: "bank" | "manual";
  isVerified: boolean;
}) {
  if (source === "bank" && isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="w-3 h-3" />
        Banco
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Clock className="w-3 h-3" />
      Manual
    </span>
  );
}
