/**
 * Mexican Finance Engine
 * ----------------------
 * Comprehensive utility library for Mexican market finance calculations.
 * Handles IVA on interest, prepayment scenarios, and currency conversions.
 */

import { DebtType, DebtCurrency, FiscalZone } from "@/types/finance";

// ============================================
// CONSTANTS
// ============================================

/** Current UDI value in MXN (Banxico - update periodically) */
export const UDI_VALUE = 8.28; // December 2024

/** Veces Salario Mínimo (VSM) - Daily minimum wage × 30 */
export const VSM_VALUE = 248.93;

/** USD to MXN (approximate - should fetch live rate in production) */
export const USD_TO_MXN = 17.15;

/** EUR to MXN (approximate) */
export const EUR_TO_MXN = 18.50;

/** Standard IVA rates by zone */
export const IVA_RATES = {
  standard: 16.0,
  border_north: 8.0,
  border_south: 8.0,
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PaymentBreakdown {
  principal: number;
  baseInterest: number;
  ivaOnInterest: number;
  totalPayment: number;
  effectiveRate: number; // Annual rate including IVA
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  iva: number;
  balance: number;
}

export interface PrepaymentScenario {
  strategy: "reduce_term" | "reduce_payment";
  newBalance: number;
  newTermMonths: number;
  newMonthlyPayment: number;
  monthsSaved: number;
  interestSaved: number;
  totalSaved: number;
}

// ============================================
// IVA CALCULATORS
// ============================================

/**
 * Get IVA rate based on debt type and fiscal zone
 * - Mortgages: 0% IVA (exempt)
 * - Credit cards/Personal: 16% (or 8% border zone)
 */
export function getIvaRate(
  debtType: DebtType,
  zone: FiscalZone = "standard"
): number {
  // Mortgages are IVA exempt on interest
  if (debtType === "mortgage") {
    return 0;
  }
  
  // All other debt types apply standard IVA
  return IVA_RATES[zone] || IVA_RATES.standard;
}

/**
 * Calculate effective annual rate including IVA on interest
 */
export function getEffectiveRate(
  nominalRate: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): number {
  const ivaRate = getIvaRate(debtType, zone);
  return nominalRate * (1 + ivaRate / 100);
}

// ============================================
// MONTHLY PAYMENT CALCULATOR
// ============================================

/**
 * Calculate monthly payment with full breakdown
 * 
 * @param principal - Current balance or loan amount
 * @param annualRate - Annual interest rate (e.g., 18 for 18%)
 * @param termMonths - Remaining term in months
 * @param debtType - Type of debt (affects IVA)
 * @param zone - Fiscal zone (affects IVA rate)
 * @returns PaymentBreakdown with principal, interest, IVA, and total
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): PaymentBreakdown {
  if (principal <= 0 || termMonths <= 0) {
    return {
      principal: 0,
      baseInterest: 0,
      ivaOnInterest: 0,
      totalPayment: 0,
      effectiveRate: 0,
    };
  }

  const ivaRate = getIvaRate(debtType, zone);
  const effectiveRate = getEffectiveRate(annualRate, debtType, zone);
  
  // For 0% interest (MSI balances)
  if (annualRate === 0) {
    return {
      principal: Math.round((principal / termMonths) * 100) / 100,
      baseInterest: 0,
      ivaOnInterest: 0,
      totalPayment: Math.round((principal / termMonths) * 100) / 100,
      effectiveRate: 0,
    };
  }

  // Monthly rate (effective = includes IVA)
  const monthlyEffectiveRate = effectiveRate / 100 / 12;
  const monthlyNominalRate = annualRate / 100 / 12;
  
  // Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const totalMonthlyPayment =
    principal *
    ((monthlyEffectiveRate * Math.pow(1 + monthlyEffectiveRate, termMonths)) /
      (Math.pow(1 + monthlyEffectiveRate, termMonths) - 1));

  // Calculate first month's interest breakdown
  const baseInterest = principal * monthlyNominalRate;
  const ivaOnInterest = baseInterest * (ivaRate / 100);
  const principalPortion = totalMonthlyPayment - baseInterest - ivaOnInterest;

  return {
    principal: Math.round(principalPortion * 100) / 100,
    baseInterest: Math.round(baseInterest * 100) / 100,
    ivaOnInterest: Math.round(ivaOnInterest * 100) / 100,
    totalPayment: Math.round(totalMonthlyPayment * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

/**
 * Calculate just the monthly interest (for revolving credit)
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): { baseInterest: number; ivaOnInterest: number; total: number } {
  const ivaRate = getIvaRate(debtType, zone);
  const baseInterest = balance * (annualRate / 100) / 12;
  const ivaOnInterest = baseInterest * (ivaRate / 100);
  
  return {
    baseInterest: Math.round(baseInterest * 100) / 100,
    ivaOnInterest: Math.round(ivaOnInterest * 100) / 100,
    total: Math.round((baseInterest + ivaOnInterest) * 100) / 100,
  };
}

// ============================================
// PREPAYMENT SIMULATOR
// ============================================

/**
 * Simulate prepayment scenarios (Adelantos a Capital)
 * 
 * @param currentBalance - Current outstanding balance
 * @param extraAmount - Extra payment amount
 * @param monthlyPayment - Current monthly payment
 * @param annualRate - Annual interest rate
 * @param remainingMonths - Remaining term
 * @param debtType - Type of debt
 * @param zone - Fiscal zone
 * @returns Both scenarios: reduce_term and reduce_payment
 */
export function simulatePrepayment(
  currentBalance: number,
  extraAmount: number,
  monthlyPayment: number,
  annualRate: number,
  remainingMonths: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): { reduceTerm: PrepaymentScenario; reducePayment: PrepaymentScenario } {
  const newBalance = Math.max(0, currentBalance - extraAmount);
  const effectiveRate = getEffectiveRate(annualRate, debtType, zone);
  const monthlyRate = effectiveRate / 100 / 12;
  
  // Calculate original total interest
  const originalTotalPayments = monthlyPayment * remainingMonths;
  const originalTotalInterest = originalTotalPayments - currentBalance;
  
  // SCENARIO A: Reduce Term (keep payment same)
  let newTermReduceTerm = remainingMonths;
  if (monthlyRate > 0 && monthlyPayment > newBalance * monthlyRate) {
    newTermReduceTerm = Math.ceil(
      -Math.log(1 - (monthlyRate * newBalance) / monthlyPayment) /
        Math.log(1 + monthlyRate)
    );
  } else if (monthlyRate === 0) {
    newTermReduceTerm = Math.ceil(newBalance / monthlyPayment);
  }
  
  const newTotalPaymentsReduceTerm = monthlyPayment * newTermReduceTerm;
  const newTotalInterestReduceTerm = newTotalPaymentsReduceTerm - newBalance;
  const monthsSaved = remainingMonths - newTermReduceTerm;
  const interestSavedReduceTerm = originalTotalInterest - newTotalInterestReduceTerm;
  
  // SCENARIO B: Reduce Payment (keep term same)
  const newPaymentBreakdown = calculateMonthlyPayment(
    newBalance,
    annualRate,
    remainingMonths,
    debtType,
    zone
  );
  const newTotalPaymentsReducePayment = newPaymentBreakdown.totalPayment * remainingMonths;
  const newTotalInterestReducePayment = newTotalPaymentsReducePayment - newBalance;
  const interestSavedReducePayment = originalTotalInterest - newTotalInterestReducePayment;
  const paymentSaved = (monthlyPayment - newPaymentBreakdown.totalPayment) * remainingMonths;
  
  return {
    reduceTerm: {
      strategy: "reduce_term",
      newBalance,
      newTermMonths: newTermReduceTerm,
      newMonthlyPayment: monthlyPayment,
      monthsSaved,
      interestSaved: Math.round(interestSavedReduceTerm * 100) / 100,
      totalSaved: Math.round((interestSavedReduceTerm + extraAmount) * 100) / 100,
    },
    reducePayment: {
      strategy: "reduce_payment",
      newBalance,
      newTermMonths: remainingMonths,
      newMonthlyPayment: newPaymentBreakdown.totalPayment,
      monthsSaved: 0,
      interestSaved: Math.round(interestSavedReducePayment * 100) / 100,
      totalSaved: Math.round((paymentSaved) * 100) / 100,
    },
  };
}

// ============================================
// CURRENCY CONVERTERS
// ============================================

/**
 * Convert any currency to MXN
 */
export function convertToMxn(
  amount: number,
  currency: DebtCurrency | string,
  customUdiValue?: number,
  customVsmValue?: number
): number {
  const udiValue = customUdiValue || UDI_VALUE;
  const vsmValue = customVsmValue || VSM_VALUE;
  
  switch (currency) {
    case "MXN":
      return amount;
    case "USD":
      return Math.round(amount * USD_TO_MXN * 100) / 100;
    case "EUR":
      return Math.round(amount * EUR_TO_MXN * 100) / 100;
    case "UDI":
      return Math.round(amount * udiValue * 100) / 100;
    case "VSM":
      return Math.round(amount * vsmValue * 100) / 100;
    default:
      return amount;
  }
}

/**
 * Convert MXN to other currency
 */
export function convertFromMxn(
  amountMxn: number,
  targetCurrency: DebtCurrency | string,
  customUdiValue?: number
): number {
  const udiValue = customUdiValue || UDI_VALUE;
  
  switch (targetCurrency) {
    case "MXN":
      return amountMxn;
    case "USD":
      return Math.round((amountMxn / USD_TO_MXN) * 100) / 100;
    case "EUR":
      return Math.round((amountMxn / EUR_TO_MXN) * 100) / 100;
    case "UDI":
      return Math.round((amountMxn / udiValue) * 100) / 100;
    default:
      return amountMxn;
  }
}

/**
 * Fetch current UDI value from Banxico (placeholder)
 * In production, implement API call to Banxico SIE
 */
export async function fetchCurrentUdiValue(): Promise<number> {
  // TODO: Implement Banxico API call
  // https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP68257/datos/ultimos/1
  console.warn("Using hardcoded UDI value. Implement Banxico API for production.");
  return UDI_VALUE;
}

// ============================================
// AMORTIZATION TABLE GENERATOR
// ============================================

/**
 * Generate full amortization schedule
 */
export function generateAmortizationTable(
  principal: number,
  annualRate: number,
  termMonths: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): AmortizationRow[] {
  const table: AmortizationRow[] = [];
  const ivaRate = getIvaRate(debtType, zone);
  const monthlyNominalRate = annualRate / 100 / 12;
  
  const { totalPayment } = calculateMonthlyPayment(
    principal,
    annualRate,
    termMonths,
    debtType,
    zone
  );
  
  let balance = principal;
  
  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * monthlyNominalRate;
    const iva = interest * (ivaRate / 100);
    const principalPaid = totalPayment - interest - iva;
    balance = Math.max(0, balance - principalPaid);
    
    table.push({
      month,
      payment: Math.round(totalPayment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }
  
  return table;
}

// ============================================
// SUMMARY CALCULATORS
// ============================================

/**
 * Calculate total cost of a loan
 */
export function calculateTotalLoanCost(
  principal: number,
  annualRate: number,
  termMonths: number,
  debtType: DebtType,
  zone: FiscalZone = "standard"
): {
  totalPayments: number;
  totalInterest: number;
  totalIva: number;
  totalCost: number;
} {
  const amortization = generateAmortizationTable(
    principal,
    annualRate,
    termMonths,
    debtType,
    zone
  );
  
  const totalPayments = amortization.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = amortization.reduce((sum, row) => sum + row.interest, 0);
  const totalIva = amortization.reduce((sum, row) => sum + row.iva, 0);
  
  return {
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalIva: Math.round(totalIva * 100) / 100,
    totalCost: Math.round((totalInterest + totalIva) * 100) / 100,
  };
}

/**
 * Get debt health score (0-100)
 */
export function getDebtHealthScore(
  totalDebt: number,
  monthlyIncome: number,
  lateDebotsCount: number
): number {
  // Debt-to-income ratio (ideal < 36%)
  const dtiRatio = monthlyIncome > 0 ? (totalDebt / (monthlyIncome * 12)) * 100 : 100;
  
  let score = 100;
  
  // Penalize high DTI
  if (dtiRatio > 50) score -= 40;
  else if (dtiRatio > 36) score -= 20;
  else if (dtiRatio > 20) score -= 10;
  
  // Penalize late debts heavily (credit bureau impact)
  score -= lateDebotsCount * 25;
  
  return Math.max(0, Math.min(100, score));
}
