"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import type { ReviewTransaction } from "@/hooks/useTransactionReview";

/**
 * Commit approved transactions to the database
 * This is called AFTER the user reviews and approves their parsed transactions
 */
export async function commitTransactions(
  transactions: ReviewTransaction[],
  newCategories: string[]
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // Step A: Create any new custom categories
    if (newCategories.length > 0) {
      const categoryInserts = newCategories.map((name) => ({
        user_id: user.id,
        name,
        type: "expense", // Default type
        icon: "📦",
      }));

      const { error: catError } = await supabase
        .from("categories")
        .upsert(categoryInserts, { onConflict: "name,user_id" });

      if (catError) {
        console.error("Error creating categories:", catError);
        // Don't throw - continue with transaction import
      }
    }

    // Step B: Bulk insert transactions
    const transactionInserts = transactions.map((tx) => ({
      user_id: user.id,
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      type: tx.type,
      category: tx.category,
      payment_method: tx.isMSI ? "MSI" : "card",
      created_at: new Date().toISOString(),
    }));

    const { error: txError } = await supabase
      .from("transactions")
      .insert(transactionInserts);

    if (txError) {
      console.error("Error inserting transactions:", txError);
      throw new Error("Failed to import transactions");
    }

    // Step C: Update onboarding status if this is part of onboarding
    await supabase
      .from("profiles")
      .update({
        has_completed_onboarding: true,
        onboarding_step: 7,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    revalidatePath("/", "layout");

    return {
      success: true,
      importedCount: transactions.length,
      newCategoriesCount: newCategories.length,
    };
  } catch (error) {
    console.error("commitTransactions error:", error);
    throw error;
  }
}

/**
 * Parse a bank statement and return data for review (does NOT save to DB)
 * This creates a staging area for the user to review before committing
 */
export async function parseStatementForReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Call the existing parse endpoint
  const parseFormData = new FormData();
  parseFormData.append("file", file);

  // Note: In production, you'd call your actual parsing logic here
  // For now, we return a mock set of transactions for the review wizard
  
  // Mock data for testing the review wizard
  const mockTransactions: ReviewTransaction[] = [
    {
      id: "1",
      date: "2024-12-01",
      description: "UBER TRIP",
      amount: -150.5,
      type: "expense",
      category: "Transport",
      suggestedCategory: "Transport",
      selected: true,
    },
    {
      id: "2",
      date: "2024-12-02",
      description: "STARBUCKS REFORMA",
      amount: -89.0,
      type: "expense",
      category: "Food",
      suggestedCategory: "Food",
      selected: true,
    },
    {
      id: "3",
      date: "2024-12-03",
      description: "COLEGIO JFK - COLEGIATURA",
      amount: -15000.0,
      type: "expense",
      category: "Education",
      suggestedCategory: "Education",
      selected: true,
    },
    {
      id: "4",
      date: "2024-12-04",
      description: "TRANSFERENCIA RECIBIDA",
      amount: 35000.0,
      type: "income",
      category: "Other",
      suggestedCategory: "Other",
      selected: true,
    },
    {
      id: "5",
      date: "2024-12-05",
      description: "NETFLIX MX",
      amount: -279.0,
      type: "expense",
      category: "Entertainment",
      suggestedCategory: "Entertainment",
      selected: true,
    },
  ];

  return {
    success: true,
    transactions: mockTransactions,
  };
}
