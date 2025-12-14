'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const TransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  category_id: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  date: z.string(),
  description: z.string().optional(),
  is_recurring: z.boolean().optional(),
})

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const rawData = {
    amount: formData.get('amount'),
    category_id: formData.get('category_id'),
    type: formData.get('type'),
    date: formData.get('date'),
    description: formData.get('description'),
    is_recurring: formData.get('is_recurring') === 'on',
    is_unexpected: formData.get('is_unexpected') === 'true',
    covered_by_emergency_fund: formData.get('covered_by_emergency_fund') === 'true',
  }

  const amount = parseFloat(rawData.amount as string)
  const category_id = rawData.category_id as string
  const type = rawData.type as string
  const date = rawData.date as string
  const description = rawData.description as string
  const is_recurring = rawData.is_recurring as boolean
  const is_unexpected = rawData.is_unexpected as boolean
  const covered_by_emergency_fund = rawData.covered_by_emergency_fund as boolean

  if (isNaN(amount) || !category_id || !type || !date) {
    return { error: 'Invalid input' }
  }

  // Get user's family_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      family_id: profile?.family_id,
      amount,
      category_id,
      type,
      date,
      description,
      is_recurring,
      is_unexpected,
      covered_by_emergency_fund,
      incurred_by: user.id
    })

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

export async function getTransactions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data
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

export async function createCategory(categoryData: {
  name: string
  type: 'expense' | 'income'
  budget_limit?: number
}) {
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
    .from('categories')
    .insert({
      user_id: user.id,
      family_id: profile?.family_id,
      name: categoryData.name,
      type: categoryData.type,
      budget_limit: categoryData.budget_limit || 0,
    })

  if (error) {
    console.error('Error creating category:', error)
    throw new Error(error.message)
  }

  revalidatePath('/budget')
  return { success: true }
}

