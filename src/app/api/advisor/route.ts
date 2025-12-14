import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT } from "@/lib/mexican-financial-advisor";
import { NextResponse } from "next/server";

// Types for request payload
interface DebtData {
  id: string;
  concept: string;
  debt_type: string;
  balance: number;
  interest_rate: number;
  iva_rate: number;
  cat_val?: number;
  is_msi: boolean;
  term_months_remaining?: number;
  status: string;
  currency_code?: string;
}

interface CashFlowData {
  monthly_income: number;
  monthly_expenses: number;
  available_for_debt: number;
  currency?: string;
}

interface UserProfileData {
  fiscal_zone?: "standard" | "border_north" | "border_south";
  currency_preference?: string;
}

interface AdvisorRequest {
  debts: DebtData[];
  cashFlow?: CashFlowData;
  userProfile?: UserProfileData;
}

export async function POST(req: Request) {
  try {
    // Check for API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
      return NextResponse.json(
        { error: "AI service not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY." },
        { status: 500 }
      );
    }

    // Parse request body
    const body: AdvisorRequest = await req.json();
    const { debts, cashFlow, userProfile } = body;

    if (!debts || !Array.isArray(debts)) {
      return NextResponse.json(
        { error: "Invalid request: 'debts' array is required" },
        { status: 400 }
      );
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.4, // Low creativity for analytical accuracy
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Construct the user data context
    const userDataContext = buildUserContext(debts, cashFlow, userProfile);

    // Combine system prompt with user data
    const fullPrompt = `${SYSTEM_PROMPT}

---

# User's Financial Data

${userDataContext}

---

Analyze the above data and provide your recommendations following the output format specified in your instructions.`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const advice = response.text();

    return NextResponse.json({ advice }, { status: 200 });

  } catch (error) {
    console.error("Advisor API error:", error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate financial advice. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Build formatted context string from user data
 */
function buildUserContext(
  debts: DebtData[],
  cashFlow?: CashFlowData,
  userProfile?: UserProfileData
): string {
  let context = "";

  // User profile section
  if (userProfile) {
    context += `## User Profile
- Fiscal Zone: ${userProfile.fiscal_zone || "standard"} (${getFiscalZoneIVA(userProfile.fiscal_zone)}% IVA)
- Currency Preference: ${userProfile.currency_preference || "MXN"}

`;
  }

  // Cash flow section
  if (cashFlow) {
    const currency = cashFlow.currency || "MXN";
    context += `## Cash Flow (Monthly)
- Monthly Income: $${cashFlow.monthly_income.toLocaleString()} ${currency}
- Monthly Expenses: $${cashFlow.monthly_expenses.toLocaleString()} ${currency}
- Available for Debt Payoff: $${cashFlow.available_for_debt.toLocaleString()} ${currency}

`;
  }

  // Debts section
  context += `## Debts (${debts.length} total)

`;

  if (debts.length === 0) {
    context += "No debts recorded. User appears to be debt-free.\n";
  } else {
    // Calculate totals
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const lateDebts = debts.filter(d => d.status === "late");
    const msiDebts = debts.filter(d => d.is_msi);

    context += `### Summary
- Total Debt Balance: $${totalDebt.toLocaleString()}
- Late Debts: ${lateDebts.length}
- MSI (0% APR) Debts: ${msiDebts.length}

### Debt Details (JSON)
\`\`\`json
${JSON.stringify(debts.map(d => ({
  concept: d.concept,
  type: d.debt_type,
  balance: d.balance,
  stated_rate: `${d.interest_rate}%`,
  iva_rate: `${d.iva_rate}%`,
  effective_rate: `${calculateEffectiveRate(d.interest_rate, d.iva_rate)}%`,
  cat: d.cat_val ? `${d.cat_val}%` : null,
  is_msi: d.is_msi,
  months_remaining: d.term_months_remaining,
  status: d.status,
  currency: d.currency_code || "MXN"
})), null, 2)}
\`\`\`
`;
  }

  return context;
}

/**
 * Get IVA rate based on fiscal zone
 */
function getFiscalZoneIVA(zone?: string): number {
  if (zone === "border_north" || zone === "border_south") {
    return 8;
  }
  return 16;
}

/**
 * Calculate effective rate with IVA
 */
function calculateEffectiveRate(rate: number, ivaRate: number): number {
  return Math.round(rate * (1 + ivaRate / 100) * 100) / 100;
}
