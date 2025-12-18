"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  Users,
  Heart,
  Calendar,
  Wallet,
  GraduationCap,
  Banknote,
  Coffee,
  ShoppingBag,
  Utensils,
  CreditCard,
  Cigarette,
  Smartphone,
  Upload,
  Check,
  Loader2,
} from "lucide-react";
import {
  saveOnboardingStep,
  saveConfiguratorSettings,
  completeOnboarding,
} from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { StatementUploaderForReview } from "@/components/importer/StatementUploaderForReview";
import { TransactionReviewWizard } from "@/components/importer/TransactionReviewWizard";
import { commitTransactions } from "@/actions/transaction-review";
import type { ReviewTransaction } from "@/hooks/useTransactionReview";
import { cn } from "@/lib/utils";

type WizardStep = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<WizardStep, string> = {
  1: "The Tribe",
  2: "The Rhythm",
  3: "Reality Check",
  4: "The Vices",
  5: "The Bridge",
};

// Vice options for the tag cloud
const VICE_OPTIONS = [
  { id: "amazon", label: "Amazon/Temu", icon: ShoppingBag },
  { id: "eating_out", label: "Eating Out", icon: Utensils },
  { id: "msi", label: "MSI (Meses Sin Intereses)", icon: CreditCard },
  { id: "vices", label: "Cigarros/Vices", icon: Cigarette },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "tech", label: "Tech/Gadgets", icon: Smartphone },
];

interface OnboardingWizardProps {
  initialStep?: WizardStep;
}

export function OnboardingWizard({ initialStep = 1 }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // Configurator State
  const [familyMode, setFamilyMode] = useState<"solo" | "partner" | "family">(
    "solo"
  );
  const [incomeFrequency, setIncomeFrequency] = useState<
    "monthly" | "biweekly" | "variable"
  >("monthly");
  const [cashUsageLevel, setCashUsageLevel] = useState(30);
  const [hasDebts, setHasDebts] = useState(false);
  const [hasSchoolExpenses, setHasSchoolExpenses] = useState(false);
  const [selectedVices, setSelectedVices] = useState<string[]>([]);

  // Import state
  const [parsedTransactions, setParsedTransactions] = useState<
    ReviewTransaction[]
  >([]);

  const progress = ((currentStep - 1) / 4) * 100;

  const nextStep = async () => {
    if (currentStep < 5) {
      setIsLoading(true);

      // Save config based on step
      if (currentStep === 1) {
        await saveConfiguratorSettings({ familyMode });
      } else if (currentStep === 2) {
        await saveConfiguratorSettings({ incomeFrequency });
      } else if (currentStep === 3) {
        await saveConfiguratorSettings({
          hasDebts,
          hasSchoolExpenses,
          cashUsageLevel,
        });
      } else if (currentStep === 4) {
        await saveConfiguratorSettings({ antExpenseVices: selectedVices });
      }

      await saveOnboardingStep(currentStep + 1, {});
      setCurrentStep((currentStep + 1) as WizardStep);
      setIsLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        sidebarLabels: { jfkSchool: "School Payments" },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding failed", error);
      setIsLoading(false);
    }
  };

  const toggleVice = (viceId: string) => {
    setSelectedVices((prev) =>
      prev.includes(viceId)
        ? prev.filter((v) => v !== viceId)
        : [...prev, viceId]
    );
  };

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicator */}
        <div className="px-10 pt-6 flex items-center justify-between text-sm text-slate-400">
          <span>Step {currentStep} of 5</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {STEP_TITLES[currentStep]}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: THE TRIBE */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader className="px-10 pt-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  ¿Para quién construyes riqueza?
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  Selecciona el modo que mejor describa tu situación.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "solo",
                      label: "Solo",
                      desc: "Finanzas individuales",
                      icon: User,
                    },
                    {
                      id: "partner",
                      label: "Pareja",
                      desc: "Finanzas compartidas",
                      icon: Heart,
                    },
                    {
                      id: "family",
                      label: "Familia",
                      desc: "Con hijos o dependientes",
                      icon: Users,
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        setFamilyMode(option.id as typeof familyMode)
                      }
                      className={cn(
                        "p-8 rounded-2xl border-2 transition-all duration-200 text-left",
                        familyMode === option.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}>
                      <option.icon
                        className={cn(
                          "h-10 w-10 mb-4",
                          familyMode === option.id
                            ? "text-emerald-600"
                            : "text-slate-400"
                        )}
                      />
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-6 flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  size="lg"
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 2: THE RHYTHM */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader className="px-10 pt-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  ¿Cuál es tu ritmo de ingresos?
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  Esto nos ayuda a optimizar tus proyecciones de flujo.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      id: "monthly",
                      label: "Mensual",
                      desc: "Pago una vez al mes",
                    },
                    {
                      id: "biweekly",
                      label: "Quincenal",
                      desc: "Pago cada 15 días",
                    },
                    {
                      id: "variable",
                      label: "Variable",
                      desc: "Freelance o comisiones",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        setIncomeFrequency(option.id as typeof incomeFrequency)
                      }
                      className={cn(
                        "p-8 rounded-2xl border-2 transition-all duration-200 text-left",
                        incomeFrequency === option.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      )}>
                      <Calendar
                        className={cn(
                          "h-10 w-10 mb-4",
                          incomeFrequency === option.id
                            ? "text-emerald-600"
                            : "text-slate-400"
                        )}
                      />
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-6 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  size="lg"
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 px-8">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 3: REALITY CHECK */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader className="px-10 pt-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  Hablemos de tu realidad financiera
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  Configura los módulos que necesitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 space-y-8">
                {/* Debts Toggle */}
                <div className="flex items-center justify-between p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-slate-900 dark:text-white">
                        ¿Tienes deudas activas?
                      </Label>
                      <p className="text-sm text-slate-500">
                        Tarjetas, préstamos, créditos
                      </p>
                    </div>
                  </div>
                  <Switch checked={hasDebts} onCheckedChange={setHasDebts} />
                </div>

                {/* School Toggle */}
                <div className="flex items-center justify-between p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-slate-900 dark:text-white">
                        ¿Pagas colegiaturas/educación?
                      </Label>
                      <p className="text-sm text-slate-500">
                        Escuelas, cursos, tutorías
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={hasSchoolExpenses}
                    onCheckedChange={setHasSchoolExpenses}
                  />
                </div>

                {/* Cash Slider */}
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-slate-900 dark:text-white">
                        ¿Cuánto usas efectivo?
                      </Label>
                      <p className="text-sm text-slate-500">
                        Porcentaje de tus gastos en cash
                      </p>
                    </div>
                  </div>
                  <Slider
                    value={[cashUsageLevel]}
                    onValueChange={(v: number[]) => setCashUsageLevel(v[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-2">
                    <span>0% - Todo digital</span>
                    <span className="font-bold text-emerald-600">
                      {cashUsageLevel}%
                    </span>
                    <span>100% - Todo efectivo</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-6 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  size="lg"
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 px-8">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 4: THE VICES */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader className="px-10 pt-8">
                <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  ¿A dónde "desaparece" tu dinero?
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                  Selecciona tus "gastos hormiga" más comunes. La IA los
                  detectará.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 space-y-6">
                <div className="flex flex-wrap gap-4">
                  {VICE_OPTIONS.map((vice) => (
                    <button
                      key={vice.id}
                      onClick={() => toggleVice(vice.id)}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3 rounded-full border-2 transition-all duration-200",
                        selectedVices.includes(vice.id)
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                      )}>
                      <vice.icon className="h-5 w-5" />
                      <span className="font-medium">{vice.label}</span>
                      {selectedVices.includes(vice.id) && (
                        <Check className="h-4 w-4 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedVices.length > 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Seleccionados: {selectedVices.length} — La IA buscará estos
                    patrones en tus transacciones.
                  </p>
                )}
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-6 flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={isLoading}
                  size="lg"
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 px-8">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 5: THE BRIDGE */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              {parsedTransactions.length > 0 ? (
                <TransactionReviewWizard
                  initialData={parsedTransactions}
                  onBack={() => setParsedTransactions([])}
                  onConfirm={async (txs, newCats) => {
                    await commitTransactions(txs, newCats);
                    await handleComplete();
                  }}
                />
              ) : (
                <>
                  <CardHeader className="px-10 pt-8">
                    <div className="h-16 w-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4">
                      <Upload className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                      Importa tus transacciones
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                      Sube un estado de cuenta y Gemini AI categorizará todo
                      automáticamente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 space-y-6">
                    <StatementUploaderForReview
                      onSuccess={(transactions) => {
                        setParsedTransactions(transactions);
                      }}
                      onError={(error) => {
                        console.error("Upload error:", error);
                      }}
                    />
                  </CardContent>
                  <CardFooter className="px-10 pb-10 pt-6 flex justify-between">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-2" /> Atrás
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleComplete}
                      disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Saltar e ir al Dashboard
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
