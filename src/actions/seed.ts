'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateMockData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // 1. Create Categories
  const categories = [
    { name: 'Salary', type: 'income', icon: '💰', budget_limit: 0 },
    { name: 'Rent', type: 'expense', icon: '🏠', budget_limit: 1600 },
    { name: 'Groceries', type: 'expense', icon: '🛒', budget_limit: 600 },
    { name: 'Utilities', type: 'expense', icon: '💡', budget_limit: 250 },
    { name: 'Dining Out', type: 'expense', icon: '🍽️', budget_limit: 300 },
    { name: 'Entertainment', type: 'expense', icon: '🎮', budget_limit: 200 },
    { name: 'Transport', type: 'expense', icon: '🚗', budget_limit: 150 },
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user.id })
      .select()
      .single()
    
    if (data) {
      categoryMap[cat.name] = data.id
    }
  }

  // 2. Create Debts
  const debts = [
    { name: 'Car Loan', current_balance: 15000, interest_rate: 5.5, min_payment: 350, due_day: 15 },
    { name: 'Credit Card', current_balance: 2450, interest_rate: 18.9, min_payment: 100, due_day: 28 },
  ]

  for (const debt of debts) {
    await supabase.from('debts').insert({ ...debt, user_id: user.id })
  }

  // 3. Generate Transactions for 2025 (Jan - Dec)
  const transactions = []
  const months = 12
  const year = 2025

  for (let month = 0; month < months; month++) {
    // Salary (Income) - 1st of month
    transactions.push({
      user_id: user.id,
      category_id: categoryMap['Salary'],
      type: 'income',
      amount: 5200,
      date: new Date(year, month, 1).toISOString().split('T')[0],
      description: 'Monthly Salary',
      is_recurring: true,
      incurred_by: user.id
    })

    // Rent (Expense) - 1st of month
    transactions.push({
      user_id: user.id,
      category_id: categoryMap['Rent'],
      type: 'expense',
      amount: 1500,
      date: new Date(year, month, 1).toISOString().split('T')[0],
      description: 'Apartment Rent',
      is_recurring: true,
      incurred_by: user.id
    })

    // Utilities (Expense) - ~15th of month
    transactions.push({
      user_id: user.id,
      category_id: categoryMap['Utilities'],
      type: 'expense',
      amount: 180 + Math.random() * 50, // Vary slightly
      date: new Date(year, month, 15).toISOString().split('T')[0],
      description: 'Electric & Internet',
      is_recurring: true,
      incurred_by: user.id
    })

    // Groceries (Expense) - Weekly (4 times a month)
    for (let week = 0; week < 4; week++) {
      const day = 2 + week * 7
      transactions.push({
        user_id: user.id,
        category_id: categoryMap['Groceries'],
        type: 'expense',
        amount: 120 + Math.random() * 60,
        date: new Date(year, month, day).toISOString().split('T')[0],
        description: 'Weekly Groceries',
        is_recurring: false,
        incurred_by: user.id
      })
    }

    // Dining Out (Expense) - Random ~2-3 times
    for (let i = 0; i < 3; i++) {
        const day = Math.floor(Math.random() * 28) + 1
        transactions.push({
            user_id: user.id,
            category_id: categoryMap['Dining Out'],
            type: 'expense',
            amount: 40 + Math.random() * 60,
            date: new Date(year, month, day).toISOString().split('T')[0],
            description: 'Restaurant / Cafe',
            is_recurring: false,
            incurred_by: user.id
        })
    }
  }

  if (transactions.length > 0) {
      // Chunk insert if too large? 12 * (1+1+1+4+3) = 120 rows. Single insert is fine.
      await supabase.from('transactions').insert(transactions)
  }

  revalidatePath('/')
  return { success: true }
}
