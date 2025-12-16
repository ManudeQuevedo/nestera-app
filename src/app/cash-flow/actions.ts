"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { DailyReceipt, CreateDailyReceiptInput } from "@/types/daily-receipts";

export async function getDailyReceipts(): Promise<DailyReceipt[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from("daily_receipts")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  
  if (error) {
    console.error("Error fetching daily receipts:", error);
    return [];
  }
  
  return data || [];
}

export async function getTodaysReceipts(): Promise<DailyReceipt[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const today = new Date().toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("daily_receipts")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching today's receipts:", error);
    return [];
  }
  
  return data || [];
}

export async function getMonthlyReceipts(): Promise<DailyReceipt[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  
  const { data, error } = await supabase
    .from("daily_receipts")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)
    .order("date", { ascending: false });
  
  if (error) {
    console.error("Error fetching monthly receipts:", error);
    return [];
  }
  
  return data || [];
}

export async function createDailyReceipt(input: CreateDailyReceiptInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  
  const { error } = await supabase
    .from("daily_receipts")
    .insert({
      user_id: user.id,
      date: input.date || new Date().toISOString().split("T")[0],
      ...input
    });
  
  if (error) {
    console.error("Error creating daily receipt:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/cash-flow");
  return { success: true };
}

export async function deleteDailyReceipt(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  
  const { error } = await supabase
    .from("daily_receipts")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting daily receipt:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/cash-flow");
  return { success: true };
}

// Metrics calculations
export async function getDailyReceiptsMetrics() {
  const [todayReceipts, monthlyReceipts] = await Promise.all([
    getTodaysReceipts(),
    getMonthlyReceipts(),
  ]);

  const todaysLeak = todayReceipts.reduce((sum, r) => sum + r.amount, 0);
  const monthlyProjection = todaysLeak * 30;
  const recoverableSavings = monthlyReceipts
    .filter((r) => !r.is_necessary)
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    todaysLeak,
    monthlyProjection,
    recoverableSavings,
    todayReceipts,
    monthlyReceipts,
  };
}
