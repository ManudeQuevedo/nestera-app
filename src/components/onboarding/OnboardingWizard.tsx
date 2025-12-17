"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Shield,
  Upload,
  Brain,
  LayoutDashboard,
  Loader2,
  FileText,
} from "lucide-react";
import { saveOnboardingStep, completeOnboarding } from "@/actions/onboarding";
import { commitTransactions } from "@/actions/transaction-review";
import { useRouter } from "next/navigation";
import { StatementUploader } from "@/components/importer/StatementUploader";
import { StatementUploaderForReview } from "@/components/importer/StatementUploaderForReview";
import { TransactionReviewWizard } from "@/components/importer/TransactionReviewWizard";
import type { ReviewTransaction } from "@/hooks/useTransactionReview";

// Define steps - matching implementation plan
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STEP_TITLES: Record<WizardStep, string> = {
  1: "Welcome",
  2: "Profile Setup",
  3: "Security",
  4: "Import Data",
  5: "Review Categories",
  6: "Customize Sidebar",
  7: "Complete",
};

interface OnboardingWizardProps {
  initialStep?: WizardStep;
}

export function OnboardingWizard({ initialStep = 1 }: OnboardingWizardProps) {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    familyName: "",
    familySize: 2,
  });
  const [enable2FA, setEnable2FA] = useState(false);
  const [customLabels, setCustomLabels] = useState({
    schoolPayments: "",
  });
  const [showStatementUploader, setShowStatementUploader] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<
    ReviewTransaction[]
  >([]);

  // Progress bar percentage
  const progress = ((currentStep - 1) / 6) * 100;

  const nextStep = async () => {
    if (currentStep < 7) {
      setIsLoading(true);
      // Save progress to DB
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
        sidebarLabels: {
          jfkSchool: customLabels.schoolPayments || "School Payments",
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding failed", error);
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-slate-200/50 bg-white/80 backdrop-blur-xl">
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Step {currentStep} of 7</span>
          <span className="font-medium text-slate-600">
            {STEP_TITLES[currentStep]}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader>
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                  <Sparkles className="w-7 h-7" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  ¡Bienvenido a Nestera!
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 mt-2">
                  Tu prueba gratuita de 14 días ha sido activada. Vamos a
                  configurar tu espacio de trabajo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 text-sm">
                      Funciones Pro Desbloqueadas
                    </h4>
                    <p className="text-emerald-700 text-xs mt-1">
                      Tienes acceso completo a Chat con IA, Conexiones
                      Bancarias, y Sincronización Familiar.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                  onClick={nextStep}
                  disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Comenzar Configuración
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 2: PROFILE SETUP */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Cuéntanos sobre tu familia
                </CardTitle>
                <CardDescription>
                  Esta información nos ayuda a personalizar tu experiencia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Nombre de la Familia</Label>
                  <Input
                    id="familyName"
                    placeholder="Ej: Familia García"
                    value={profileData.familyName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        familyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familySize">Número de Miembros</Label>
                  <Input
                    id="familySize"
                    type="number"
                    min={1}
                    max={20}
                    value={profileData.familySize}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        familySize: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
                <Button onClick={nextStep} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Continuar <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 3: SECURITY (Optional 2FA) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                  <Shield className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Protege tu cuenta
                </CardTitle>
                <CardDescription>
                  Recomendamos activar la autenticación de dos factores (2FA)
                  para mayor seguridad.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                  <p className="text-amber-800 text-sm">
                    💡 Puedes configurar 2FA más tarde desde Configuración {">"}{" "}
                    Seguridad.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={nextStep}>
                    Saltar por ahora
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      // TODO: Open 2FA setup modal
                      nextStep();
                    }}>
                    Configurar 2FA
                  </Button>
                </div>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 4: BANK STATEMENT UPLOAD */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader>
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-4 text-violet-600">
                  <Upload className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Importa tus datos
                </CardTitle>
                <CardDescription>
                  Sube un estado de cuenta bancario (PDF) y Gemini AI analizará
                  tus transacciones automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Inline Statement Uploader with Real Gemini Parsing */}
                <StatementUploaderForReview
                  onSuccess={(transactions) => {
                    setParsedTransactions(transactions);
                    nextStep(); // Advance to category review
                  }}
                  onError={(error) => {
                    console.error("Upload error:", error);
                  }}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
                <Button variant="outline" onClick={nextStep}>
                  Saltar por ahora <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* STEP 5: CATEGORY REVIEW */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full">
              {parsedTransactions.length > 0 ? (
                // Show the full Transaction Review Wizard
                <TransactionReviewWizard
                  initialData={parsedTransactions}
                  onBack={() => prevStep()}
                  onConfirm={async (txs, newCats) => {
                    await commitTransactions(txs, newCats);
                    setParsedTransactions([]); // Clear after commit
                    nextStep(); // Move to sidebar customization
                  }}
                />
              ) : (
                // No transactions - show placeholder
                <>
                  <CardHeader>
                    <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-4 text-pink-600">
                      <Brain className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Revisa las categorías
                    </CardTitle>
                    <CardDescription>
                      La IA ha analizado tus transacciones. Revisa y ajusta las
                      categorías según tus necesidades.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <p className="text-slate-500 text-sm">
                        Aún no hay transacciones importadas.
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Puedes importar estados de cuenta después desde el
                        Dashboard.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={prevStep}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                    </Button>
                    <Button onClick={nextStep}>
                      Continuar <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 6: SIDEBAR CUSTOMIZATION */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit">
              <CardHeader>
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 text-amber-600">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Personaliza tu menú
                </CardTitle>
                <CardDescription>
                  Renombra las secciones del menú para que se adapten a tu
                  vocabulario familiar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="schoolLabel"
                    className="text-slate-700 font-medium">
                    Sección de Pagos Escolares
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="schoolLabel"
                      placeholder="Ej: Colegio JFK, Los Niños, Educación"
                      className="pl-9"
                      value={customLabels.schoolPayments}
                      onChange={(e) =>
                        setCustomLabels({
                          ...customLabels,
                          schoolPayments: e.target.value,
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Predeterminado: "Pagos Escolares"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Finalizar Configuración
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
