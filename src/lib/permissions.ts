import { PLANS, PlanId } from "@/config/subscriptions";

/**
 * Checks if a user on a given plan can access a specific feature.
 * Handles feature inheritance (e.g. PLUS includes all PRO features).
 */
export function canAccess(feature: string, userPlan: string | undefined | null): boolean {
  if (!userPlan) return false;

  // Normalize plan string to match config keys (e.g., 'pro' -> 'PRO')
  const planKey = userPlan.toUpperCase() as PlanId;
  const planConfig = PLANS[planKey];

  if (!planConfig) {
    console.warn(`Unknown plan: ${userPlan}`);
    return false;
  }

  // Direct feature check
  // @ts-ignore - The features array is readonly string[]
  if (planConfig.features.includes(feature)) {
    return true;
  }

  // Inheritance check: If plan has 'all_pro_features', check against PRO plan
  // @ts-ignore
  if (planConfig.features.includes('all_pro_features')) {
     // Check if the requested feature is in PRO capabilities
     // @ts-ignore
     if (PLANS.PRO.features.includes(feature)) {
       return true;
     }
  }

  return false;
}

/**
 * Helper to get the max users allowed for a plan
 */
export function getMaxUsers(userPlan: string | undefined | null): number {
  if (!userPlan) return 1;
  const planKey = userPlan.toUpperCase() as PlanId;
  const planConfig = PLANS[planKey];
  return planConfig?.max_users || 1;
}
