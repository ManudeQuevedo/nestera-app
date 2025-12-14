"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Loader2,
  AlertTriangle,
  Info,
  CreditCard,
  Home,
  Car,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DebtType, DebtCurrency } from "@/types/finance";
import {
  DEFAULTS,
  getDefaultIvaRate,
  calculateMonthlyPayment,
  convertToMXN,
} from "@/hooks/useDebtMath";
import { createDebt } from "@/actions/debts";

interface AddDebtModalProps {
  trigger?: React.ReactNode;
}

const DEBT_TYPE_OPTIONS: {
  value: DebtType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "credit_card", label: "Credit Card", icon: CreditCard },
  { value: "mortgage", label: "Mortgage", icon: Home },
  { value: "auto_loan", label: "Auto Loan", icon: Car },
  { value: "personal_loan", label: "Personal Loan", icon: User },
  { value: "friend_loan", label: "Family/Friend Loan", icon: Users },
];

const CURRENCY_OPTIONS: { value: DebtCurrency; label: string }[] = [
  { value: "MXN", label: "MXN - Mexican Pesos" },
  { value: "USD", label: "USD - US Dollars" },
  { value: "UDI", label: "UDI - Investment Units" },
  { value: "VSM", label: "VSM - Min. Wage Units" },
];

export function AddDebtModal({ trigger }: AddDebtModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [isExistingLoan, setIsExistingLoan] = useState(false);
  const [debtType, setDebtType] = useState<DebtType>("credit_card");
  const [concept, setConcept] = useState("");
  const [currency, setCurrency] = useState<DebtCurrency>("MXN");

  // Amount fields
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState("");

  // Interest & Tax
  const [interestRate, setInterestRate] = useState("");
  const [ivaRate, setIvaRate] = useState(DEFAULTS.IVA_STANDARD.toString());
  const [isBorderZone, setIsBorderZone] = useState(false);

  // MSI (0% APR promotional)
  const [isMSI, setIsMSI] = useState(false);

  // UDI/VSM conversion
  const [udiValue, setUdiValue] = useState(DEFAULTS.UDI_VALUE.toString());
  const [showUdiHelper, setShowUdiHelper] = useState(false);

  // Auto-update IVA based on debt type and border zone
  useEffect(() => {
    const defaultIva = getDefaultIvaRate(debtType, isBorderZone);
    setIvaRate(defaultIva.toString());
  }, [debtType, isBorderZone]);

  // Show UDI helper when UDI or VSM selected
  useEffect(() => {
    setShowUdiHelper(currency === "UDI" || currency === "VSM");
  }, [currency]);

  // Reset MSI when not credit card
  useEffect(() => {
    if (debtType !== "credit_card") {
      setIsMSI(false);
    }
  }, [debtType]);

  // Calculate estimated monthly payment
  const estimatedPayment = (() => {
    const principal = parseFloat(amount) || 0;
    const rate = isMSI ? 0 : parseFloat(interestRate) || 0;
    const iva = parseFloat(ivaRate) || 0;
    const months = parseInt(termMonths) || 0;

    if (principal > 0 && months > 0) {
      let mxnPrincipal = principal;
      if (currency === "UDI" || currency === "VSM") {
        mxnPrincipal = convertToMXN(
          principal,
          currency,
          parseFloat(udiValue) || DEFAULTS.UDI_VALUE
        );
      }
      return calculateMonthlyPayment(mxnPrincipal, rate, iva, months);
    }
    return 0;
  })();

  const handleSubmit = async () => {
    if (!concept.trim() || !amount) return;

    setIsSubmitting(true);
    try {
      const principal = parseFloat(amount) || 0;
      let mxnBalance = principal;

      // Convert to MXN for storage
      if (currency === "UDI" || currency === "VSM") {
        mxnBalance = convertToMXN(
          principal,
          currency,
          parseFloat(udiValue) || DEFAULTS.UDI_VALUE
        );
      }

      await createDebt({
        debt_type: debtType,
        concept: concept.trim(),
        balance: mxnBalance,
        original_amount: isExistingLoan ? null : mxnBalance,
        currency_code: currency,
        interest_rate: isMSI ? 0 : parseFloat(interestRate) || 0,
        iva_rate: parseFloat(ivaRate) || DEFAULTS.IVA_STANDARD,
        term_months_total: isExistingLoan ? null : parseInt(termMonths) || null,
        term_months_remaining: parseInt(termMonths) || null,
        is_msi: isMSI,
        prepayment_strategy: "reduce_term",
        status: "current",
      });

      // Reset and close
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating debt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsExistingLoan(false);
    setDebtType("credit_card");
    setConcept("");
    setCurrency("MXN");
    setAmount("");
    setTermMonths("");
    setInterestRate("");
    setIvaRate(DEFAULTS.IVA_STANDARD.toString());
    setIsBorderZone(false);
    setIsMSI(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Debt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Debt</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* New vs Existing Toggle */}
          <Tabs
            value={isExistingLoan ? "existing" : "new"}
            onValueChange={(v) => setIsExistingLoan(v === "existing")}
            className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Loan</TabsTrigger>
              <TabsTrigger value="existing">Existing Loan</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Debt Type */}
          <div className="space-y-2">
            <Label>Debt Type</Label>
            <Select
              value={debtType}
              onValueChange={(v) => setDebtType(v as DebtType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Concept/Name */}
          <div className="space-y-2">
            <Label htmlFor="concept">Name / Description</Label>
            <Input
              id="concept"
              placeholder="e.g., Chase Sapphire, Home Mortgage"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {isExistingLoan ? "Current Balance" : "Loan Amount"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as DebtCurrency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* UDI/VSM Conversion Helper */}
          {showUdiHelper && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                <Info className="w-4 h-4" />
                <span>MXN Conversion</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Current {currency} value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={udiValue}
                    onChange={(e) => setUdiValue(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Equivalent in MXN</Label>
                  <div className="h-8 flex items-center text-sm font-medium">
                    $
                    {convertToMXN(
                      parseFloat(amount) || 0,
                      currency,
                      parseFloat(udiValue) || DEFAULTS.UDI_VALUE
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Term */}
          <div className="space-y-2">
            <Label htmlFor="term">
              {isExistingLoan ? "Months Remaining" : "Term (Months)"}
            </Label>
            <Input
              id="term"
              type="number"
              placeholder="e.g., 36"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              placeholder="e.g., 18.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              disabled={isMSI}
              className={cn(isMSI && "opacity-50")}
            />
          </div>

          {/* Tax Section (Mexico-specific) */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="border-zone" className="text-sm cursor-pointer">
                  Border Zone (8% Tax)
                </Label>
              </div>
              <Switch
                id="border-zone"
                checked={isBorderZone}
                onCheckedChange={setIsBorderZone}
                disabled={debtType === "mortgage"}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-center">
              <span className="text-sm text-muted-foreground">
                Tax on Interest:
              </span>
              <Input
                type="number"
                step="0.1"
                value={ivaRate}
                onChange={(e) => setIvaRate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {debtType === "mortgage" && (
              <p className="text-xs text-muted-foreground">
                Mortgages typically don't have tax on interest.
              </p>
            )}
          </div>

          {/* MSI Toggle (Credit Cards Only) */}
          {debtType === "credit_card" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Label htmlFor="msi" className="text-sm cursor-pointer">
                    Is this a 0% APR Promotional?
                  </Label>
                </div>
                <Switch id="msi" checked={isMSI} onCheckedChange={setIsMSI} />
              </div>

              {isMSI && (
                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                    <strong>Tip:</strong> Don't pay this off early. It's better
                    to invest your available cash.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Estimated Monthly Payment */}
          {estimatedPayment > 0 && (
            <div className="p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Estimated Monthly Payment
              </p>
              <p className="text-2xl font-bold text-primary">
                ${estimatedPayment.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  MXN
                </span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting || !concept.trim() || !amount}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Saving..." : "Add Debt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
