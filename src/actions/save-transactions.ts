"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface TransactionToSave {
  id?: string;
  date: string;
  description: string;
  amount: number;
  suggested_category: string;
  event_id?: string;
  goal_id?: string;
}

interface SaveResult {
  success: boolean;
  count?: number;
  error?: string;
}

export async function saveTransactions(
  transactions: TransactionToSave[],
  importId?: string
): Promise<SaveResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    if (!transactions || transactions.length === 0) {
      return { success: false, error: "No hay transacciones para guardar" };
    }

    // Get or create categories
    const categoryNames = [...new Set(transactions.map((t) => t.suggested_category))];
    
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

    // Prepare transactions for insert
    const transactionsToInsert = transactions.map((tx) => ({
      user_id: user.id,
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      type: tx.amount >= 0 ? "income" : "expense",
      category_id: categoryMap.get(tx.suggested_category) || null,
      event_id: tx.event_id || null,
      goal_id: tx.goal_id || null,
    }));

    // Bulk insert transactions
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(transactionsToInsert);

    if (insertError) {
      console.error("Transaction insert error:", insertError);
      return { success: false, error: "Error al guardar transacciones" };
    }

    // Update bank_import status to completed (don't delete file yet - rely on 24h expiry)
    if (importId) {
      await supabase
        .from("bank_imports")
        .update({ status: "committed" })
        .eq("id", importId)
        .eq("user_id", user.id);
    }

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return { success: true, count: transactions.length };

  } catch (error) {
    console.error("Save transactions error:", error);
    return { success: false, error: "Error inesperado" };
  }
}
