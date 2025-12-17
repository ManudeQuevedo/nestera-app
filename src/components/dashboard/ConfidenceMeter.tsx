"use client";

import { AlertTriangle, TrendingUp, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  dataCoverageMonths: number;
  className?: string;
}

export function ConfidenceMeter({
  dataCoverageMonths,
  className,
}: ConfidenceMeterProps) {
  // Calculate confidence level
  const getConfidenceLevel = () => {
    if (dataCoverageMonths >= 6)
      return { level: "high", label: "Alta", color: "emerald" };
    if (dataCoverageMonths >= 3)
      return { level: "medium", label: "Media", color: "blue" };
    if (dataCoverageMonths >= 1)
      return { level: "low", label: "Limitada", color: "amber" };
    return { level: "none", label: "Sin datos", color: "slate" };
  };

  const confidence = getConfidenceLevel();
  const percentage = Math.min(100, (dataCoverageMonths / 6) * 100);

  if (dataCoverageMonths >= 3) {
    // Adequate coverage - show subtle indicator
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100",
          className
        )}>
        <Shield className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">
          {dataCoverageMonths} meses de datos • Alertas activas
        </span>
      </div>
    );
  }

  // Limited coverage - show warning
  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        dataCoverageMonths > 0
          ? "bg-amber-50 border-amber-200"
          : "bg-slate-50 border-slate-200",
        className
      )}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            dataCoverageMonths > 0 ? "bg-amber-100" : "bg-slate-100"
          )}>
          {dataCoverageMonths > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <Info className="w-5 h-5 text-slate-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              "font-bold text-sm",
              dataCoverageMonths > 0 ? "text-amber-800" : "text-slate-700"
            )}>
            {dataCoverageMonths > 0
              ? "⚠️ Visión Limitada"
              : "📊 Sin historial bancario"}
          </h4>
          <p
            className={cn(
              "text-xs mt-1",
              dataCoverageMonths > 0 ? "text-amber-700" : "text-slate-500"
            )}>
            {dataCoverageMonths > 0
              ? `Tienes ${dataCoverageMonths} mes${dataCoverageMonths > 1 ? "es" : ""} de datos. Sube más meses para activar alertas de tendencias.`
              : "Sube estados de cuenta para desbloquear análisis y alertas inteligentes."}
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className={cn(
                  dataCoverageMonths > 0 ? "text-amber-600" : "text-slate-400"
                )}>
                {dataCoverageMonths}/3 meses mínimos
              </span>
              <span
                className={cn(
                  dataCoverageMonths > 0 ? "text-amber-600" : "text-slate-400"
                )}>
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  dataCoverageMonths >= 3
                    ? "bg-emerald-500"
                    : dataCoverageMonths > 0
                      ? "bg-amber-400"
                      : "bg-slate-200"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline badge for dashboard
export function ConfidenceBadge({
  dataCoverageMonths,
}: {
  dataCoverageMonths: number;
}) {
  if (dataCoverageMonths >= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
        <TrendingUp className="w-3 h-3" />
        Tendencias activas
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
      <AlertTriangle className="w-3 h-3" />
      {dataCoverageMonths > 0 ? `${dataCoverageMonths}m datos` : "Sin datos"}
    </span>
  );
}
