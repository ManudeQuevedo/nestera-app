'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { DebtType, DebtCurrency, PrepaymentStrategy, DebtStatus } from '@/types/finance'

interface CreateDebtData {
  debt_type: DebtType
  concept: string
  balance: number
  original_amount: number | null
  currency_code: DebtCurrency
  interest_rate: number
  iva_rate: number
  term_months_total: number | null
  term_months_remaining: number | null
  is_msi: boolean
  prepayment_strategy: PrepaymentStrategy
  status: DebtStatus
  next_payment_due_date?: string
  notes?: string
}

export async function createDebt(data: CreateDebtData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get user's family_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('debts')
    .insert({
      user_id: user.id,
      family_id: profile?.family_id,
      ...data,
    })

  if (error) {
    console.error('Error creating debt:', error)
    throw new Error(error.message)
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function getDebts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .order('balance', { ascending: false })

  if (error) {
    console.error('Error fetching debts:', error)
    return []
  }

  return data
}

export async function updateDebt(
  id: string,
  updates: Partial<CreateDebtData>
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('debts')
    .update(updates)
    .eq('id', id)

  if (error) {
    console.error('Error updating debt:', error)
    throw new Error(error.message)
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function deleteDebt(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting debt:', error)
    throw new Error(error.message)
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function recordPayment(
  debtId: string,
  amount: number,
  isExtraPayment: boolean = false,
  notes?: string
) {
  const supabase = await createClient()
  
  // Insert payment record
  const { error: paymentError } = await supabase
    .from('debt_payments')
    .insert({
      debt_id: debtId,
      amount_paid: amount,
      date: new Date().toISOString().split('T')[0],
      is_extra_payment: isExtraPayment,
      notes,
    })

  if (paymentError) {
    console.error('Error recording payment:', paymentError)
    throw new Error(paymentError.message)
  }

  // Update debt balance
  const { data: debt } = await supabase
    .from('debts')
    .select('balance')
    .eq('id', debtId)
    .single()

  if (debt) {
    const newBalance = Math.max(0, debt.balance - amount)
    await supabase
      .from('debts')
      .update({
        balance: newBalance,
        last_payment_date: new Date().toISOString().split('T')[0],
        status: newBalance === 0 ? 'paid_off' : 'current',
      })
      .eq('id', debtId)
  }

  revalidatePath('/debts')
  return { success: true }
}

export async function getDebtPayments(debtId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('debt_payments')
    .select('*')
    .eq('debt_id', debtId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }

  return data
}
