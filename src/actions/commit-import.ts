"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface TransactionSplit {
  amount: number;
  category: string;
}

interface TransactionToCommit {
  id?: string;
  date: string;
  description: string;
  amount: number;
  suggested_category: string;
  event_id?: string;
  goal_id?: string;
  is_cash_withdrawal?: boolean;
  splits?: TransactionSplit[];
  transfer_to_cash_wallet?: boolean; // True = ATM kept, not expense
}

interface CommitResult {
  success: boolean;
  inserted: number;
  merged: number;
  splits: number;
  transfers: number;
  total: number;
  error?: string;
}

/**
 * Smart Import with De-Duplication & Split Logic
 * 
 * CRITICAL LOGIC:
 * 1. Check if transaction exists with same date, amount, and similar description
 * 2. If YES: UPDATE existing (set is_verified=true, source='bank')
 * 3. If NO: INSERT new (set is_verified=true, source='bank')
 * 4. If has splits: Insert parent as hidden, insert children with parent_transaction_id
 */
export async function commitImport(
  transactions: TransactionToCommit[],
  importId?: string
): Promise<CommitResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, inserted: 0, merged: 0, splits: 0, transfers: 0, total: 0, error: "No autenticado" };
    }

    if (!transactions || transactions.length === 0) {
      return { success: false, inserted: 0, merged: 0, splits: 0, transfers: 0, total: 0, error: "No hay transacciones" };
    }

    // Collect ALL category names (including from splits)
    const allCategoryNames = new Set<string>();
    transactions.forEach((t) => {
      allCategoryNames.add(t.suggested_category);
      t.splits?.forEach((s) => allCategoryNames.add(s.category));
    });

    const categoryNames = [...allCategoryNames];
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", user.id)
      .in("name", categoryNames);

    const categoryMap = new Map<string, string>();
    existingCategories?.forEach((c) => categoryMap.set(c.name, c.id));

    // Create missing categories
    const missingCategories = categoryNames.filter((n) => !categoryMap.has(n));
    if (missingCategories.length > 0) {
      const { data: newCategories } = await supabase
        .from("categories")
        .insert(
          missingCategories.map((name) => ({
            user_id: user.id,
            name,
            type: name === "Income" ? "income" : "expense",
          }))
        )
        .select("id, name");

      newCategories?.forEach((c) => categoryMap.set(c.name, c.id));
    }

    // Get existing transactions for this user in the date range
    const dates = transactions.map((t) => t.date);
    const minDate = dates.reduce((a, b) => (a < b ? a : b));
    const maxDate = dates.reduce((a, b) => (a > b ? a : b));

    const { data: existingTransactions } = await supabase
      .from("transactions")
      .select("id, date, amount, description")
      .eq("user_id", user.id)
      .gte("date", minDate)
      .lte("date", maxDate);

    let insertedCount = 0;
    let mergedCount = 0;
    let splitsCount = 0;
    let transfersCount = 0;

    // Get user's Cash Wallet for transfers
    const { data: cashWallet } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "cash")
      .eq("is_system", true)
      .single();

    const cashWalletId = cashWallet?.id || null;

    // Process each transaction with Smart Merge
    for (const tx of transactions) {
      const hasSplits = tx.splits && tx.splits.length > 1;
      const isTransfer = tx.transfer_to_cash_wallet === true;
      const categoryId = categoryMap.get(tx.suggested_category) || null;
      const txAmount = Math.abs(tx.amount);
      const txType = tx.amount >= 0 ? "income" : "expense";

      // Handle TRANSFER to Cash Wallet (ATM kept)
      if (isTransfer && cashWalletId) {
        const { error: transferError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            date: tx.date,
            description: tx.description,
            amount: txAmount,
            type: "expense", // Expense from bank
            category_id: null,
            is_verified: true,
            source: "bank",
            is_cash_withdrawal: true,
            is_hidden: false,
            transfer_to_account_id: cashWalletId, // KEY: marks as transfer
          });

        if (!transferError) {
          transfersCount++;
          insertedCount++;
        }
        continue;
      }

      // SMART MERGE: Check for duplicate (only for non-split, non-transfer transactions)
      const duplicate = !hasSplits ? existingTransactions?.find((existing) => {
        const sameDate = existing.date === tx.date;
        const sameAmount = Math.abs(existing.amount - txAmount) < 0.01;
        const similarDesc = isSimilarDescription(existing.description, tx.description);
        return sameDate && sameAmount && similarDesc;
      }) : null;

      if (hasSplits && tx.splits) {
        // === SPLIT TRANSACTION LOGIC ===
        // 1. Insert parent as hidden
        const { data: parentData, error: parentError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            date: tx.date,
            description: tx.description,
            amount: txAmount,
            type: txType,
            category_id: categoryId,
            is_verified: true,
            source: "bank",
            is_cash_withdrawal: tx.is_cash_withdrawal || false,
            is_hidden: true, // Hidden because it has splits
          })
          .select("id")
          .single();

        if (parentError || !parentData) {
          console.error("Failed to insert parent transaction:", parentError);
          continue;
        }

        // 2. Insert child splits
        for (const split of tx.splits) {
          const splitCategoryId = categoryMap.get(split.category) || null;
          const { error: splitError } = await supabase
            .from("transactions")
            .insert({
              user_id: user.id,
              date: tx.date,
              description: `${tx.description} - ${split.category}`,
              amount: split.amount,
              type: "expense",
              category_id: splitCategoryId,
              is_verified: true,
              source: "bank",
              is_cash_withdrawal: false,
              is_hidden: false,
              parent_transaction_id: parentData.id,
            });

          if (!splitError) {
            splitsCount++;
          }
        }
        insertedCount++;

      } else if (duplicate) {
        // === UPDATE EXISTING (MERGE) ===
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            is_verified: true,
            source: "bank",
            category_id: categoryId,
            event_id: tx.event_id || null,
            goal_id: tx.goal_id || null,
            is_cash_withdrawal: tx.is_cash_withdrawal || false,
          })
          .eq("id", duplicate.id);

        if (!updateError) {
          mergedCount++;
          // Remove from array to avoid re-matching
          const idx = existingTransactions?.indexOf(duplicate);
          if (idx !== undefined && idx > -1) {
            existingTransactions?.splice(idx, 1);
          }
        }
      } else {
        // === INSERT NEW ===
        const { error: insertError } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            date: tx.date,
            description: tx.description,
            amount: txAmount,
            type: txType,
            category_id: categoryId,
            event_id: tx.event_id || null,
            goal_id: tx.goal_id || null,
            is_verified: true,
            source: "bank",
            is_cash_withdrawal: tx.is_cash_withdrawal || false,
            is_hidden: false,
          });

        if (!insertError) {
          insertedCount++;
        }
      }
    }

    // Update bank_import status
    if (importId) {
      await supabase
        .from("bank_imports")
        .update({ status: "committed" })
        .eq("id", importId)
        .eq("user_id", user.id);
    }

    // Calculate data coverage and update profile
    const { data: txDates } = await supabase
      .from("transactions")
      .select("date")
      .eq("user_id", user.id)
      .eq("source", "bank")
      .eq("is_hidden", false)
      .order("date", { ascending: true });

    if (txDates && txDates.length > 0) {
      const earliest = new Date(txDates[0].date);
      const latest = new Date(txDates[txDates.length - 1].date);
      const monthsDiff = Math.ceil(
        (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      await supabase
        .from("profiles")
        .update({ 
          data_coverage_months: monthsDiff,
          onboarding_completed: true  // Mark onboarding complete after first import
        })
        .eq("id", user.id);
    }

    // Revalidate
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return {
      success: true,
      inserted: insertedCount,
      merged: mergedCount,
      splits: splitsCount,
      transfers: transfersCount,
      total: insertedCount + mergedCount,
    };

  } catch (error) {
    console.error("Commit import error:", error);
    return { success: false, inserted: 0, merged: 0, splits: 0, transfers: 0, total: 0, error: "Error inesperado" };
  }
}

/**
 * Check if two descriptions are similar enough to be the same transaction
 * Uses simple normalized comparison
 */
function isSimilarDescription(a: string, b: string): boolean {
  const normalize = (s: string) => 
    s.toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20); // Compare first 20 chars
  
  const normA = normalize(a);
  const normB = normalize(b);
  
  // Exact match after normalization
  if (normA === normB) return true;
  
  // One contains the other
  if (normA.includes(normB) || normB.includes(normA)) return true;
  
  return false;
}

/**
 * Check for pending imports to resume
 */
export async function getPendingImport() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("bank_imports")
    .select("id, raw_data, file_count, created_at")
    .eq("user_id", user.id)
    .eq("status", "reviewing")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Quick Cash Expense - Log a cash expense without bank reconciliation
 */
export async function logCashExpense(
  amount: number,
  category: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Get or create category
    let categoryId: string | null = null;
    const { data: existingCat } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", category)
      .single();

    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const { data: newCat } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: category,
          type: "expense",
        })
        .select("id")
        .single();
      categoryId = newCat?.id || null;
    }

    // Insert cash expense
    const { error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split("T")[0],
        description: description || `Efectivo - ${category}`,
        amount: Math.abs(amount),
        type: "expense",
        category_id: categoryId,
        source: "manual",
        is_cash_withdrawal: false,
        is_verified: true,
        is_hidden: false,
      });

    if (error) {
      console.error("Log cash expense error:", error);
      return { success: false, error: "Error al guardar" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return { success: true };
  } catch (error) {
    console.error("Log cash expense error:", error);
    return { success: false, error: "Error inesperado" };
  }
}

/**
 * Get the current Cash Wallet balance for the user
 */
export async function getCashWalletBalance(): Promise<{ balance: number; accountId: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { balance: 0, accountId: null };
    }

    // Get Cash Wallet account
    const { data: cashWallet } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", "cash")
      .eq("is_system", true)
      .single();

    if (!cashWallet) {
      return { balance: 0, accountId: null };
    }

    // Sum deposits (transfers TO cash wallet)
    const { data: deposits } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("transfer_to_account_id", cashWallet.id)
      .eq("is_hidden", false);

    const totalDeposits = deposits?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    // Sum cash expenses (transactions with account_id = cash wallet and no transfer)
    const { data: expenses } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("account_id", cashWallet.id)
      .is("transfer_to_account_id", null)
      .eq("type", "expense")
      .eq("is_hidden", false);

    const totalExpenses = expenses?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    return { 
      balance: totalDeposits - totalExpenses,
      accountId: cashWallet.id 
    };
  } catch (error) {
    console.error("Get cash balance error:", error);
    return { balance: 0, accountId: null };
  }
}
