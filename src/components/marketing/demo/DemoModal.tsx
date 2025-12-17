"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  TrendingUp,
  Check,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DemoModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DemoModal = ({ open, onOpenChange }: DemoModalProps) => {
  // Use controlled state if provided, otherwise internal state
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;

  const [step, setStep] = useState<"select" | "simulation" | "success">(
    "select"
  );
  const [scenario, setScenario] = useState<"leaks" | "growth" | null>(null);
  const [isOptimized, setIsOptimized] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }

    // Reset wizard when closing
    if (!newOpen) {
      setTimeout(() => {
        setStep("select");
        setScenario(null);
        setIsOptimized(false);
      }, 300);
    }
  };

  return (
    <>
      {/* Only show trigger button if NOT controlled (self-contained mode) */}
      {!isControlled && (
        <button
          onClick={() => handleOpenChange(true)}
          className="px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95">
          Ver Demo
        </button>
      )}

      {/* The Controlled Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {/* RESPONSIVE CONTAINER */}
        <DialogContent
          showCloseButton={false}
          className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-6xl p-0 overflow-hidden bg-slate-50 border-none shadow-2xl sm:rounded-2xl flex flex-col">
          <DialogTitle className="sr-only">Interactive Demo</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Simulador
              </span>
            </div>

            {/* Mobile Close Button */}
            <DialogClose className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </DialogClose>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="min-h-full p-6 md:p-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {/* STEP 1: SCENARIO SELECTION */}
                {step === "select" && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-5xl mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                      <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                        ¿Qué te quita el sueño?
                      </h2>
                      <p className="text-slate-500 text-base md:text-lg">
                        Personalizaremos la demo para ti.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      {/* Option A */}
                      <button
                        onClick={() => {
                          setScenario("leaks");
                          setStep("simulation");
                        }}
                        className="group relative flex flex-row md:flex-col items-center p-6 md:p-10 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 text-left md:text-center active:scale-[0.98]">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-xl md:rounded-2xl flex shrink-0 items-center justify-center mr-4 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform">
                          <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-3">
                            Detectar Fugas
                          </h3>
                          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                            Siento que el dinero se me escapa.
                          </p>
                        </div>
                        <ArrowRight className="md:hidden ml-auto text-slate-300 w-5 h-5" />
                      </button>

                      {/* Option B */}
                      <button
                        onClick={() => {
                          setScenario("growth");
                          setStep("simulation");
                        }}
                        className="group relative flex flex-row md:flex-col items-center p-6 md:p-10 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 text-left md:text-center active:scale-[0.98]">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-xl md:rounded-2xl flex shrink-0 items-center justify-center mr-4 md:mr-0 md:mb-6 group-hover:scale-110 transition-transform">
                          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-3">
                            Proyectar Riqueza
                          </h3>
                          <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                            Quiero construir un patrimonio.
                          </p>
                        </div>
                        <ArrowRight className="md:hidden ml-auto text-slate-300 w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SIMULATION */}
                {step === "simulation" && (
                  <motion.div
                    key="sim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 pb-6 border-b border-slate-200/50">
                      <div>
                        <p className="text-xs md:text-sm text-slate-400 font-medium mb-1 uppercase tracking-wider">
                          Patrimonio (10 Años)
                        </p>
                        <div className="flex items-center gap-3">
                          <h2
                            className={`text-4xl md:text-5xl font-bold tracking-tighter transition-all duration-700 ${isOptimized ? "text-emerald-600" : "text-slate-900"}`}>
                            {isOptimized ? "$2.4M" : "$850k"}
                          </h2>
                          {isOptimized && (
                            <span className="text-xs md:text-sm font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full animate-in fade-in zoom-in">
                              +188%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
                      <button
                        onClick={() => {
                          setIsOptimized(true);
                          setTimeout(() => setStep("success"), 2000);
                        }}
                        disabled={isOptimized}
                        className={`col-span-1 md:col-span-12 lg:col-span-4 relative p-6 md:p-8 rounded-2xl border-2 text-left transition-all duration-500 flex flex-col justify-center min-h-[200px]
                        ${
                          isOptimized
                            ? "bg-emerald-50 border-emerald-100 opacity-50"
                            : "bg-white border-rose-100 hover:border-rose-300 shadow-lg active:scale-[0.98] ring-4 ring-rose-500/5"
                        }`}>
                        {!isOptimized && (
                          <span className="absolute -top-2 -right-2 flex h-6 w-6 md:h-8 md:w-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 md:h-8 md:w-8 bg-rose-500 text-white items-center justify-center text-xs md:text-sm font-bold">
                              !
                            </span>
                          </span>
                        )}

                        <div className="flex items-center gap-3 md:gap-4 mb-4">
                          <div
                            className={`p-2 md:p-3 rounded-xl ${isOptimized ? "bg-emerald-100" : "bg-rose-100"}`}>
                            {scenario === "leaks" ? (
                              <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />
                            ) : (
                              <Lock className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Diagnóstico
                            </p>
                            <h4 className="font-bold text-slate-800 text-base md:text-lg">
                              {scenario === "leaks"
                                ? "Fugas Detectadas"
                                : "Capital Ocioso"}
                            </h4>
                          </div>
                        </div>

                        <p className="text-slate-600 mb-6 text-sm md:text-lg leading-relaxed">
                          {scenario === "leaks"
                            ? "Detectamos suscripciones olvidadas por $12,000/año."
                            : "Tienes $50,000 perdiendo valor por la inflación."}
                        </p>

                        <div
                          className={`w-full py-3 px-4 rounded-xl text-center text-sm font-bold tracking-wide transition-colors
                        ${isOptimized ? "bg-emerald-200 text-emerald-800" : "bg-rose-600 text-white shadow-lg shadow-rose-500/30"}`}>
                          {isOptimized ? "OPTIMIZADO" : "SOLUCIONAR"}
                        </div>
                      </button>

                      <div className="hidden sm:flex col-span-1 md:col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 items-end justify-between gap-2 md:gap-4 opacity-75">
                        {[20, 35, 30, 50, 45, 60, 55, 75, 70, 90].map(
                          (h, i) => (
                            <div
                              key={i}
                              style={{
                                height: `${isOptimized ? h + 10 : h * 0.4}%`,
                              }}
                              className={`w-full rounded-t-sm md:rounded-t-lg transition-all duration-1000 ease-out ${isOptimized ? "bg-emerald-400" : "bg-slate-200"}`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-[bounce_1s_infinite]">
                      <Check className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6">
                      ¡Listo!
                    </h2>
                    <p className="text-slate-500 mb-8 md:mb-10 text-lg md:text-xl leading-relaxed px-4">
                      Acabas de "ahorrar" <strong>$12,000</strong>.{" "}
                      <br className="hidden md:block" />
                      Imagina hacerlo con tu dinero real.
                    </p>

                    <div className="flex flex-col w-full gap-4 px-4 md:px-0">
                      <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-emerald-500/20 shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200">
                        Crear mi cuenta gratis
                      </button>
                      <button
                        onClick={() => setStep("select")}
                        className="text-slate-400 hover:text-slate-600 font-medium py-2 transition-colors">
                        Volver a probar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
