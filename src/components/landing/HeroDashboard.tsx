"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Target,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bug,
} from "lucide-react";

export function HeroDashboard() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Window Frame */}
      <div
        className={cn(
          "rounded-xl overflow-hidden",
          "border border-slate-200 dark:border-slate-800",
          "bg-white dark:bg-[#0B1121]",
          "shadow-2xl"
        )}>
        {/* macOS Window Header */}
        <div className="h-8 bg-slate-100 dark:bg-slate-900/80 flex items-center px-4 gap-2 border-b border-slate-200 dark:border-slate-800">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            app.nestera.mx
          </span>
        </div>

        {/* Dashboard Content */}
        <div className="flex min-h-[320px]">
          {/* Mini Sidebar */}
          <div className="w-48 bg-slate-50 dark:bg-[#0B1121]/80 border-r border-slate-200 dark:border-slate-800 p-3 hidden md:block">
            {/* Identity Card */}
            <div className="flex items-center gap-2 p-2 mb-3 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5">
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-medium">
                  FP
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Buenos días
                </p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  Familia Pérez
                </p>
              </div>
            </div>

            {/* Nav Items */}
            <div className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: Wallet, label: "Deudas", active: false },
                { icon: Target, label: "Metas", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                    item.active
                      ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 bg-slate-50/50 dark:bg-[#030712]">
            {/* Financial Health Score Header */}
            <div className="mb-4 p-3 rounded-lg bg-white dark:bg-[#0B1121]/60 border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                      Salud Financiera
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-tight">
                    Vas por buen camino, Familia Pérez. Tu gasto hormiga bajó
                    15%.
                  </p>
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 ring-2 ring-emerald-500/20">
                  <span className="text-lg font-bold text-emerald-500">85</span>
                </div>
              </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Balance Card */}
              <Card className="p-3 bg-white dark:bg-[#0B1121]/60 border-slate-200 dark:border-white/5">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                  Balance Total
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    $45,200
                  </span>
                  <span className="text-[10px] text-slate-400">MXN</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-medium">
                    +$1,200
                  </span>
                </div>
              </Card>

              {/* Ant Expenses Card */}
              <Card className="p-3 bg-white dark:bg-[#0B1121]/60 border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Bug className="h-3 w-3 text-rose-500" />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Gastos Hormiga
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-rose-500">
                    $12,500
                  </span>
                  <span className="text-[10px] text-slate-400">este mes</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-rose-400" />
                  <span className="text-[10px] text-rose-400 font-medium">
                    -15% vs mes pasado
                  </span>
                </div>
              </Card>

              {/* Mini Chart Placeholder */}
              <Card className="col-span-2 p-3 bg-white dark:bg-[#0B1121]/60 border-slate-200 dark:border-white/5">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2">
                  Tendencia de Gastos
                </p>
                {/* Simple SVG Chart */}
                <svg
                  viewBox="0 0 200 50"
                  className="w-full h-10"
                  preserveAspectRatio="none">
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="0%"
                        stopColor="rgb(16, 185, 129)"
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(16, 185, 129)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,28 L140,20 L160,22 L180,15 L200,10"
                    fill="none"
                    stroke="rgb(16, 185, 129)"
                    strokeWidth="2"
                    className="drop-shadow-sm"
                  />
                  <path
                    d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,28 L140,20 L160,22 L180,15 L200,10 L200,50 L0,50 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Glow Effect */}
      <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl opacity-50 dark:opacity-30" />
    </div>
  );
}
