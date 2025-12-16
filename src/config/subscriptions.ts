export const PLANS = {
  FREE: {
    id: 'price_free',
    name: 'Gratis',
    features: ['manual_tracking', 'basic_charts'] as const,
    max_users: 1
  },
  PRO: {
    id: 'price_pro_monthly', // Stripe ID placeholder
    name: 'Pro',
    features: ['manual_tracking', 'basic_charts', 'ai_chat', 'pdf_import', 'unlimited_history'] as const,
    max_users: 2
  },
  PLUS: {
    id: 'price_plus_family', // Stripe ID placeholder
    name: 'Family Plus',
    features: ['all_pro_features', 'meal_planner', 'grocery_list', 'family_calendar'] as const,
    max_users: 5
  },
  KICKSTART: {
    id: 'price_kickstart_quarterly',
    name: 'Kickstart (3 Months)',
    features: ['all_pro_features', 'meal_planner', 'grocery_list', 'family_calendar'] as const,
    max_users: 5,
    description: 'Quarterly billing. Best value for new families.'
  }
} as const;

export type PlanId = keyof typeof PLANS;
export type PlanFeature = typeof PLANS.FREE.features[number] | typeof PLANS.PRO.features[number] | typeof PLANS.PLUS.features[number];
