export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'cash' | 'debit' | 'credit'
export type AccountType = 'bank' | 'cash' | 'credit' | 'other'
export type InvestmentType = 'college_fund' | 'retirement' | 'stocks' | 'crypto' | 'real_estate' | 'other'

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
  budget_limit: number
  icon: string | null
  group_id: string | null
  created_at: string
}

export interface CategoryGroup {
  id: string
  user_id: string
  name: string
  sort_order: number
  is_system: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  date: string
  description: string | null
  establishment: string | null
  payment_method: PaymentMethod
  is_recurring: boolean
  recurring_frequency: string | null
  created_at: string
  // Joined data
  category?: Category
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  current_balance: number
  is_debt: boolean
  icon: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  icon: string | null
  color: string | null
  priority: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  user_id: string
  name: string
  type: InvestmentType
  current_value: number
  monthly_contribution: number
  year_started: number | null
  icon: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvestmentHistory {
  id: string
  investment_id: string
  user_id: string
  value: number
  recorded_at: string
  created_at: string
}

// Debt types for Mexican market
export type DebtType = 'credit_card' | 'mortgage' | 'auto_loan' | 'personal_loan' | 'friend_loan' | 'msi_balance'
export type DebtCurrency = 'MXN' | 'USD' | 'EUR' | 'UDI' | 'VSM'
export type PrepaymentStrategy = 'reduce_term' | 'reduce_payment'
export type DebtStatus = 'current' | 'late' | 'paid_off'

export interface Debt {
  id: string
  user_id: string
  family_id: string | null
  
  // Core identification
  debt_type: DebtType
  concept: string // e.g., "BBVA Platinum", "Hipoteca Santander"
  
  // Amount tracking
  balance: number
  original_amount: number | null
  currency_code: DebtCurrency
  
  // Interest & Tax (Mexican market)
  interest_rate: number // Annual % (Tasa Ordinaria)
  interest_rate_ordinaria: number | null // Explicit ordinaria rate
  cat_val: number | null // Costo Anual Total (CAT) for display
  iva_rate: number // 16% standard, 8% border, 0% mortgages
  
  // Term tracking
  term_months_total: number | null
  term_months_remaining: number | null
  
  // Payment preferences
  prepayment_strategy: PrepaymentStrategy
  amortization_strategy: string | null
  is_msi: boolean // Meses Sin Intereses
  
  // Dates
  next_payment_due_date: string | null
  last_payment_date: string | null
  start_date: string | null
  
  // Status
  status: DebtStatus
  notes: string | null
  
  created_at: string
  updated_at: string
}

export interface DebtPayment {
  id: string
  debt_id: string
  amount_paid: number
  date: string
  is_extra_payment: boolean
  payment_method: string | null
  notes: string | null
  created_at: string
}

// Asset types for Mexican market
export type AssetType = 'real_estate' | 'vehicle' | 'investment' | 'savings' | 'crypto' | 'business' | 'collectible' | 'other'

export interface Asset {
  id: string
  user_id: string
  family_id: string | null
  
  name: string
  asset_type: AssetType
  
  // Valuation
  valuation_mxn: number
  acquisition_cost: number | null
  acquisition_date: string | null
  currency_code: string
  
  // Depreciation
  is_depreciating: boolean
  depreciation_rate: number | null
  useful_life_years: number | null
  
  // Classification
  is_liquid: boolean
  is_income_generating: boolean
  
  notes: string | null
  created_at: string
  updated_at: string
}

// Income stream types for Mexican tax compliance
export type IncomeFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually' | 'irregular'
export type TaxRegime = 'sueldos' | 'resico' | 'pfae' | 'arrendamiento' | 'dividendos' | 'intereses' | 'plataformas'
export type FiscalZone = 'standard' | 'border_north' | 'border_south'

export interface IncomeStream {
  id: string
  user_id: string
  family_id: string | null
  
  name: string
  amount: number
  currency_code: string
  frequency: IncomeFrequency
  
  // Tax classification (SAT)
  tax_regime: TaxRegime
  withholding_rate: number | null
  is_tax_exempt: boolean
  
  // Status
  is_active: boolean
  start_date: string | null
  end_date: string | null
  
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  currency_preference: string | null
  theme: string | null
  
  // Mexican compliance fields
  fiscal_zone: FiscalZone | null
  privacy_accepted_at: string | null
  rfc: string | null
  family_id: string | null
  
  created_at: string
  updated_at: string
}
