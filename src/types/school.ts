// Types for JFK School module

export type SchoolPaymentCategory = 
  | 'Tuition'
  | 'Extra Curricular'
  | 'Events'
  | 'Uniforms'
  | 'Books'
  | 'Other';

export interface SchoolPayment {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  concept: string;
  category: SchoolPaymentCategory;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolPaymentInput {
  date: string;
  amount: number;
  concept: string;
  category: SchoolPaymentCategory;
  receipt_url?: string | null;
  notes?: string | null;
}

export const SCHOOL_PAYMENT_CATEGORIES: { value: SchoolPaymentCategory; label: string; color: string }[] = [
  { value: 'Tuition', label: 'Tuition', color: 'bg-blue-500' },
  { value: 'Extra Curricular', label: 'Extra Curricular', color: 'bg-purple-500' },
  { value: 'Events', label: 'Events', color: 'bg-green-500' },
  { value: 'Uniforms', label: 'Uniforms', color: 'bg-orange-500' },
  { value: 'Books', label: 'Books', color: 'bg-cyan-500' },
  { value: 'Other', label: 'Other', color: 'bg-gray-500' },
];

export function getCategoryColor(category: SchoolPaymentCategory): string {
  return SCHOOL_PAYMENT_CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-500';
}
