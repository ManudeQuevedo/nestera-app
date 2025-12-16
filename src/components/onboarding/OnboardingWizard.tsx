"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { completeOnboarding } from "@/actions/onboarding";
import { CurrencySetup } from "./steps/CurrencySetup";
import { ManualAccountSetup } from "./steps/ManualAccountSetup";
import { DebtConfiguration } from "./steps/DebtConfiguration";
import { FamilyIdentity } from "./steps/FamilyIdentity";
import { MealPreferences } from "./steps/MealPreferences";
import { StatementUploader } from "@/components/importer/StatementUploader";
// Fallback if StatementUploader props don't match or for styling
const StatementStep = () => (
  <div className="p-4 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 min-h-[200px] flex items-center justify-center">
    Statement Upload (Placeholder for reused component)
  </div>
);

interface OnboardingWizardProps {
  plan: string; // 'free' | 'pro' | 'plus' | 'kickstart'
}

export function OnboardingWizard({ plan }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  // Normalize plan
  const planKey = plan?.toUpperCase() || "FREE";

  // Define steps based on plan
  let steps: { component: any; title: string }[] = [];

  if (planKey === "FREE") {
    steps = [
      { component: CurrencySetup, title: "Currency Setup" },
      { component: ManualAccountSetup, title: "Account Setup" },
    ];
  } else if (planKey === "PRO") {
    steps = [
      // Conceptually PRO users skip manual setup and go to statement upload
      { component: StatementStep, title: "Upload Statement" },
      { component: DebtConfiguration, title: "Debt Config" },
    ];
  } else {
    // PLUS or KICKSTART
    steps = [
      { component: FamilyIdentity, title: "Family Identity" },
      { component: StatementStep, title: "Upload Statement" },
      { component: MealPreferences, title: "Meal Preferences" },
    ];
  }

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // In a real app we'd save formData here before completing
    console.log("Submitting onboarding data:", formData);
    const form = new FormData();
    await completeOnboarding(form);
  };

  const updateData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <Card className="glass-card border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Step {step + 1} of {steps.length}
            </span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">
              {planKey} PLAN
            </span>
          </div>
          <Progress value={progress} className="h-1 mb-4" />
          <CardTitle className="text-2xl font-bold text-center">
            {currentStep.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 min-h-[300px] flex flex-col justify-center">
          {/* Render Current Step Component */}
          {/* We pass a specialized update function or props */}
          <currentStep.component onUpdate={updateData} />
        </CardContent>
        <CardFooter className="flex justify-between pt-6 border-t border-slate-100 dark:border-white/5">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-slate-500">
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8">
            {step === steps.length - 1 ? "Complete Setup" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
