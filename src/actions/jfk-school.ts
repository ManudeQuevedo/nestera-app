"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { SchoolPayment, CreateSchoolPaymentInput } from "@/types/school";

export async function getSchoolPayments(): Promise<SchoolPayment[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from("school_payments")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });
  
  if (error) {
    console.error("Error fetching school payments:", error);
    return [];
  }
  
  return data || [];
}

export async function getSchoolPaymentsByYear(year: number): Promise<SchoolPayment[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  
  const { data, error } = await supabase
    .from("school_payments")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });
  
  if (error) {
    console.error("Error fetching school payments by year:", error);
    return [];
  }
  
  return data || [];
}

export async function createSchoolPayment(input: CreateSchoolPaymentInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  
  const { error } = await supabase
    .from("school_payments")
    .insert({
      user_id: user.id,
      ...input
    });
  
  if (error) {
    console.error("Error creating school payment:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/investments");
  return { success: true };
}

export async function deleteSchoolPayment(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  
  // First get the payment to check for receipt
  const { data: payment } = await supabase
    .from("school_payments")
    .select("receipt_url")
    .eq("id", id)
    .single();
  
  // Delete from storage if receipt exists
  if (payment?.receipt_url) {
    await supabase.storage
      .from("school-receipts")
      .remove([payment.receipt_url]);
  }
  
  const { error } = await supabase
    .from("school_payments")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting school payment:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/investments");
  return { success: true };
}

export async function uploadReceipt(file: File): Promise<{ url: string | null; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { url: null, error: "Not authenticated" };
  }
  
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from("school-receipts")
    .upload(fileName, file);
  
  if (error) {
    console.error("Error uploading receipt:", error);
    return { url: null, error: error.message };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from("school-receipts")
    .getPublicUrl(fileName);
  
  return { url: publicUrl };
}

export async function getTotalPaidThisYear(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;
  
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;
  
  const { data, error } = await supabase
    .from("school_payments")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);
  
  if (error || !data) return 0;
  
  return data.reduce((sum, p) => sum + (p.amount || 0), 0);
}
