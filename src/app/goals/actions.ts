"use server";

import { createClient } from "@/utils/supabase/server";
import { Goal } from "@/types/finance";

export async function getGoals(): Promise<Goal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    console.error("Error fetching goals:", error);
    return [];
  }

  return data || [];
}

export async function createGoal(goal: Omit<Goal, "id" | "created_at" | "updated_at" | "user_id">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("goals")
    .insert({
      ...goal,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoalProgress(goalId: string, currentAmount: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("goals")
    .update({
      current_amount: currentAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId);

  if (error) throw error;
}

export async function seedDefaultGoals() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  // Check if goals exist
  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return; // Already has goals
  }

  const defaultGoals = [
    { 
      name: "Paris Trip", 
      target_amount: 5000, 
      current_amount: 0, 
      deadline: "2025-12-01",
      icon: "Plane", 
      color: "from-blue-500 to-cyan-500",
      priority: 0 
    },
    { 
      name: "Emergency Fund", 
      target_amount: 10000, 
      current_amount: 0, 
      deadline: null,
      icon: "Shield", 
      color: "from-green-500 to-emerald-500",
      priority: 1 
    },
    { 
      name: "New Car", 
      target_amount: 25000, 
      current_amount: 0, 
      deadline: "2026-06-01",
      icon: "Car", 
      color: "from-orange-500 to-red-500",
      priority: 2 
    },
    { 
      name: "Debt Free", 
      target_amount: 15000, 
      current_amount: 0, 
      deadline: "2025-06-01",
      icon: "Trophy", 
      color: "from-purple-500 to-pink-500",
      priority: 3 
    },
  ];

  for (const goal of defaultGoals) {
    await supabase.from("goals").insert({
      ...goal,
      user_id: user.id,
    });
  }
}
