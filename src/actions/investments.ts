"use server";

import { createClient } from "@/utils/supabase/server";
import { Investment, InvestmentHistory } from "@/types/finance";

export async function getInvestments(): Promise<Investment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investments")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching investments:", error);
    return [];
  }

  return data || [];
}

export async function getInvestmentHistory(investmentId: string): Promise<InvestmentHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_history")
    .select("*")
    .eq("investment_id", investmentId)
    .order("recorded_at", { ascending: true });

  if (error) {
    console.error("Error fetching investment history:", error);
    return [];
  }

  return data || [];
}

export async function seedDefaultInvestments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  // Check if investments exist
  const { data: existing } = await supabase
    .from("investments")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return; // Already has investments
  }

  const defaultInvestments = [
    { 
      name: "Daughter's College Fund", 
      type: "college_fund",
      current_value: 0, 
      monthly_contribution: 0,
      year_started: 2024,
      icon: "GraduationCap",
    },
    { 
      name: "Retirement Fund", 
      type: "retirement",
      current_value: 0, 
      monthly_contribution: 0,
      year_started: 2020,
      icon: "Wallet",
    },
  ];

  for (const investment of defaultInvestments) {
    await supabase.from("investments").insert({
      ...investment,
      user_id: user.id,
    });
  }
}

export async function updateInvestmentValue(investmentId: string, newValue: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  // Update investment
  const { error: updateError } = await supabase
    .from("investments")
    .update({
      current_value: newValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", investmentId);

  if (updateError) throw updateError;

  // Add history point
  const { error: historyError } = await supabase
    .from("investment_history")
    .insert({
      investment_id: investmentId,
      user_id: user.id,
      value: newValue,
      recorded_at: new Date().toISOString().split('T')[0],
    });

  if (historyError) throw historyError;
}
