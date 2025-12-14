"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface TransactionImport {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  payment_method?: string;
}

export async function bulkImportTransactions(
  transactions: TransactionImport[]
): Promise<{ success: boolean; imported: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, imported: 0, error: "Not authenticated" };
  }

  try {
    // Transform data for database insertion
    const transactionsToInsert = transactions.map((tx) => ({
      user_id: user.id,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      payment_method: tx.payment_method || null,
      // Note: category_id would need to be resolved from category name
      // For now, we'll leave it null and let users categorize later
    }));

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let totalImported = 0;

    for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
      const batch = transactionsToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase.from("transactions").insert(batch);

      if (error) {
        console.error("Batch import error:", error);
        return {
          success: false,
          imported: totalImported,
          error: `Error en lote ${Math.floor(i / batchSize) + 1}: ${error.message}`,
        };
      }

      totalImported += batch.length;
    }

    revalidatePath("/transactions");
    revalidatePath("/");

    return { success: true, imported: totalImported };
  } catch (error) {
    console.error("Bulk import error:", error);
    return {
      success: false,
      imported: 0,
      error: "Error al importar transacciones",
    };
  }
}
