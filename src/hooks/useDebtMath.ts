import { Debt, DebtCurrency, PrepaymentStrategy } from "@/types/finance";

// Current default values for Mexican market (December 2024)
export const DEFAULTS = {
  UDI_VALUE: 8.66, // Approximate UDI value in MXN
  VSM_VALUE: 248.93, // Daily minimum wage (CDMX) * 30
  IVA_STANDARD: 16.0,
  IVA_BORDER: 8.0,
  IVA_MORTGAGE: 0.0,
};

/**
 * Calculate monthly interest payment including IVA
 * Mexican formula: (Balance * (Rate / 100) / 12) * (1 + (IvaRate / 100))
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number,
  ivaRate: number = DEFAULTS.IVA_STANDARD
): number {
  if (balance <= 0 || annualRate <= 0) return 0;
  
  const monthlyInterest = balance * (annualRate / 100) / 12;
  const interestWithIva = monthlyInterest * (1 + ivaRate / 100);
  
  return Math.round(interestWithIva * 100) / 100;
}

/**
 * Calculate amortized monthly payment (includes principal + interest + IVA)
 * Standard amortization formula with IVA applied to interest portion
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  ivaRate: number,
  termMonths: number
): number {
  if (termMonths <= 0 || principal <= 0) return 0;
  
  // For MSI or zero-interest loans
  if (annualRate === 0) {
    return Math.round((principal / termMonths) * 100) / 100;
  }
  
  // Effective rate including IVA on interest
  const effectiveAnnualRate = annualRate * (1 + ivaRate / 100);
  const monthlyRate = effectiveAnnualRate / 100 / 12;
  
  // Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const payment =
    principal *
    ((monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1));
  
  return Math.round(payment * 100) / 100;
}

/**
 * Convert UDI or VSM to MXN
 */
export function convertToMXN(
  amount: number,
  currency: DebtCurrency,
  udiValue: number = DEFAULTS.UDI_VALUE,
  vsmValue: number = DEFAULTS.VSM_VALUE
): number {
  switch (currency) {
    case "UDI":
      return Math.round(amount * udiValue * 100) / 100;
    case "VSM":
      return Math.round(amount * vsmValue * 100) / 100;
    case "USD":
      return Math.round(amount * 17.5 * 100) / 100; // Approximate, should fetch live rate
    case "EUR":
      return Math.round(amount * 19.0 * 100) / 100; // Approximate
    default:
      return amount;
  }
}

/**
 * Get default IVA rate based on debt type
 */
export function getDefaultIvaRate(
  debtType: string,
  isBorderZone: boolean = false
): number {
  if (debtType === "mortgage") {
    return DEFAULTS.IVA_MORTGAGE;
  }
  return isBorderZone ? DEFAULTS.IVA_BORDER : DEFAULTS.IVA_STANDARD;
}

interface PrepaymentResult {
  newBalance: number;
  newTermMonths: number;
  newMonthlyPayment: number;
  interestSaved: number;
  monthsSaved: number;
}

/**
 * Simulate prepayment on a debt
 * @param balance Current outstanding balance
 * @param monthlyPayment Current monthly payment
 * @param annualRate Annual interest rate
 * @param ivaRate IVA rate
 * @param remainingMonths Months remaining
 * @param extraPayment Extra one-time payment amount
 * @param strategy 'reduce_term' or 'reduce_payment'
 */
export function simulatePrepayment(
  balance: number,
  monthlyPayment: number,
  annualRate: number,
  ivaRate: number,
  remainingMonths: number,
  extraPayment: number,
  strategy: PrepaymentStrategy
): PrepaymentResult {
  const newBalance = Math.max(0, balance - extraPayment);
  const effectiveRate = annualRate * (1 + ivaRate / 100);
  const monthlyRate = effectiveRate / 100 / 12;
  
  // Original total interest
  const originalTotalPayments = monthlyPayment * remainingMonths;
  const originalTotalInterest = originalTotalPayments - balance;
  
  if (strategy === "reduce_term") {
    // Keep payment same, reduce term
    // n = -log(1 - (r * P) / M) / log(1 + r)
    if (monthlyRate > 0 && monthlyPayment > newBalance * monthlyRate) {
      const newMonths = Math.ceil(
        -Math.log(1 - (monthlyRate * newBalance) / monthlyPayment) /
          Math.log(1 + monthlyRate)
      );
      const newTotalPayments = monthlyPayment * newMonths;
      const newTotalInterest = newTotalPayments - newBalance;
      
      return {
        newBalance,
        newTermMonths: newMonths,
        newMonthlyPayment: monthlyPayment,
        interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
        monthsSaved: remainingMonths - newMonths,
      };
    }
    // Fallback for edge cases
    return {
      newBalance,
      newTermMonths: remainingMonths,
      newMonthlyPayment: monthlyPayment,
      interestSaved: 0,
      monthsSaved: 0,
    };
  } else {
    // reduce_payment: Keep term same, reduce payment
    const newPayment = calculateMonthlyPayment(
      newBalance,
      annualRate,
      ivaRate,
      remainingMonths
    );
    const newTotalPayments = newPayment * remainingMonths;
    const newTotalInterest = newTotalPayments - newBalance;
    
    return {
      newBalance,
      newTermMonths: remainingMonths,
      newMonthlyPayment: newPayment,
      interestSaved: Math.max(0, originalTotalInterest - newTotalInterest),
      monthsSaved: 0,
    };
  }
}

/**
 * Calculate total cost of debt (principal + all interest)
 */
export function calculateTotalCost(
  balance: number,
  monthlyPayment: number,
  remainingMonths: number
): number {
  return Math.round(monthlyPayment * remainingMonths * 100) / 100;
}

/**
 * Calculate payoff date
 */
export function calculatePayoffDate(remainingMonths: number): Date {
  const now = new Date();
  now.setMonth(now.getMonth() + remainingMonths);
  return now;
}

/**
 * Get debt health status based on payment history
 */
export function getDebtHealth(debt: Debt): "healthy" | "warning" | "critical" {
  if (debt.status === "paid_off") return "healthy";
  if (debt.status === "late") return "critical";
  
  // Check if balance is decreasing (would need history)
  // For now, just check if MSI and close to end
  if (debt.is_msi && debt.term_months_remaining && debt.term_months_remaining <= 2) {
    return "warning";
  }
  
  return "healthy";
}

/**
 * Hook for debt calculations
 */
export function useDebtMath(debt: Debt | null) {
  if (!debt) {
    return {
      monthlyInterest: 0,
      monthlyPayment: 0,
      totalCost: 0,
      payoffDate: null,
      health: "healthy" as const,
    };
  }
  
  const monthlyInterest = calculateMonthlyInterest(
    debt.balance,
    debt.interest_rate,
    debt.iva_rate
  );
  
  const monthlyPayment = debt.term_months_remaining
    ? calculateMonthlyPayment(
        debt.balance,
        debt.interest_rate,
        debt.iva_rate,
        debt.term_months_remaining
      )
    : monthlyInterest * 1.1; // Minimum payment estimate for revolving credit
  
  const totalCost = debt.term_months_remaining
    ? calculateTotalCost(debt.balance, monthlyPayment, debt.term_months_remaining)
    : debt.balance;
  
  const payoffDate = debt.term_months_remaining
    ? calculatePayoffDate(debt.term_months_remaining)
    : null;
  
  const health = getDebtHealth(debt);
  
  return {
    monthlyInterest,
    monthlyPayment,
    totalCost,
    payoffDate,
    health,
  };
}
