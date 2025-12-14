// Types for Daily Receipts / Ant Expenses module

export type AntExpenseCategory = 
  | 'Coffee'
  | 'Snack'
  | 'Restaurants'
  | 'Social'
  | 'Impulse'
  | 'Subscription'
  | 'Delivery'
  | 'Other';

export type Currency = 'USD' | 'MXN' | 'EUR';

// Exchange rates (base: USD)
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  MXN: 20.50,
  EUR: 0.95,
};

// Currency conversion helper
export function convert(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return amount;
  // Convert to USD first, then to target currency
  const inUSD = amount / EXCHANGE_RATES[fromCurrency];
  return inUSD * EXCHANGE_RATES[toCurrency];
}

// Format currency with proper locale
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export interface DailyReceipt {
  id: string;
  user_id: string;
  amount: number;
  currency: Currency;
  category: AntExpenseCategory;
  is_necessary: boolean;
  context_tag: string | null;
  date: string;
  created_at: string;
}

export interface CreateDailyReceiptInput {
  amount: number;
  currency?: Currency;
  category: AntExpenseCategory;
  is_necessary: boolean;
  context_tag?: string | null;
  date?: string;
}

export const ANT_EXPENSE_CATEGORIES: { value: AntExpenseCategory; label: string; emoji: string }[] = [
  { value: 'Coffee', label: 'Coffee', emoji: '☕' },
  { value: 'Snack', label: 'Snack', emoji: '🍪' },
  { value: 'Restaurants', label: 'Restaurants', emoji: '🍽️' },
  { value: 'Social', label: 'Social', emoji: '🍻' },
  { value: 'Impulse', label: 'Impulse', emoji: '🛒' },
  { value: 'Subscription', label: 'Subscription', emoji: '📱' },
  { value: 'Delivery', label: 'Delivery', emoji: '🚗' },
  { value: 'Other', label: 'Other', emoji: '💸' },
];

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'MXN', label: 'Mexican Peso', symbol: '$' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
];
