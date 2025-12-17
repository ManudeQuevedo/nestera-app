import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface TransactionToCommit {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { importId, transactions } = body as {
      importId?: string;
      transactions: TransactionToCommit[];
    };

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions provided" },
        { status: 400 }
      );
    }

    // Get or create categories
    const categoryNames = [...new Set(transactions.map((t) => t.category))];
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
      type: tx.type,
      category_id: categoryMap.get(tx.category) || null,
    }));

    // Bulk insert transactions
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(transactionsToInsert);

    if (insertError) {
      console.error("Transaction insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save transactions" },
        { status: 500 }
      );
    }

    // CLEANUP: Delete the bank_import record (ephemeral staging)
    if (importId) {
      await supabase
        .from("bank_imports")
        .delete()
        .eq("id", importId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({
      success: true,
      count: transactions.length,
      message: `${transactions.length} transactions committed successfully`,
    });
  } catch (error) {
    console.error("Commit transactions error:", error);
    return NextResponse.json(
      { error: "Failed to commit transactions" },
      { status: 500 }
    );
  }
}
