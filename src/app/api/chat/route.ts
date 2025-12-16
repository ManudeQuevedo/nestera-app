import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

// Get system prompt based on locale
function getSystemPrompt(locale: string) {
  const isSpanish = locale === "es";
  const name = isSpanish ? "Sabio" : "Wise";
  const languageInstruction = isSpanish 
    ? "Language: Spanish (Español) - ALWAYS respond in Spanish." 
    : "Language: English - ALWAYS respond in English.";
  
  return `You are **${name}**, the family's dedicated Financial Wealth Coach.
You are speaking to a family that operates in **MXN, USD, and EUR**.

**Your Prime Directives on Currency:**
1. **Never Mix Currencies:** Do not sum amounts with different currency codes. If the user has $1000 USD and $2000 MXN, report them separately: "You have $1,000 USD and $2,000 MXN."
2. **Context Awareness:** If the user asks "How much did I spend on food?", calculate the total per currency: "You spent $5,000 MXN and $200 USD on food."
3. **Conversion Awareness:** You do not have live exchange rates. Do not attempt to convert values unless the user explicitly gives you a rate (e.g., "Assume 1 USD = 20 MXN"). If you need to give a total estimate, clarify that it is an estimate.

**Your Coaching Persona:**
- Name: **${name}**
- Tone: Professional, Insightful, Protective of the family wealth
- Focus: Debt Eradication and Smart Spending
- ${languageInstruction}

**Your Strategy:**
1. **Debt Avalanche First:** Prioritize paying off high-interest debt, respecting currency segregation
2. **Identify "Ant Expenses":** Look for small, recurring daily spends and flag them (with their currency)
3. **Rule of Thumb:** If they have no Emergency Fund, that is Priority #1
4. **Budget Analysis:** When analyzing budgets, always group by currency first

**Response Guidelines:**
- Keep responses concise but actionable
- Use bullet points for lists
- Bold important numbers and action items
- Always include currency codes (USD, MXN, EUR) with amounts
- Be encouraging but honest
- Always end with a specific action step

**Input Data Context:**
The user's data will be provided below in JSON format. Pay close attention to the 'currency' field in every record.`;
}

// Format amount with currency code
function formatMoney(amount: number, currency: string = "USD"): string {
  return `${amount.toLocaleString()} ${currency}`;
}

// Group spending by category AND currency
function groupByCategory(
  transactions: any[]
): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};

  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      const catName = tx.categories?.name || "Uncategorized";
      const currency = tx.currency || "USD";

      if (!result[catName]) {
        result[catName] = {};
      }
      if (!result[catName][currency]) {
        result[catName][currency] = 0;
      }
      result[catName][currency] += tx.amount;
    }
  });

  return result;
}

// Sum by currency only
function sumByCurrency(transactions: any[]): Record<string, number> {
  const result: Record<string, number> = {};

  transactions.forEach((tx) => {
    const currency = tx.currency || "USD";
    if (!result[currency]) {
      result[currency] = 0;
    }
    result[currency] += tx.amount;
  });

  return result;
}

async function getFinancialContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  // Get date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

  // Fetch all required data in parallel - explicitly select currency
  const [
    { data: transactions },
    { data: debts },
    { data: categories },
    { data: accounts },
    { data: goals },
  ] = await Promise.all([
    // Recent transactions with currency
    supabase
      .from("transactions")
      .select("*, categories(name), currency")
      .gte("date", thirtyDaysAgoStr)
      .order("date", { ascending: false }),
    // Debts with currency
    supabase.from("debts").select("*, currency"),
    // Categories with budgets
    supabase.from("categories").select("*").eq("type", "expense"),
    // Accounts with currency
    supabase.from("accounts").select("*, currency"),
    // Goals with currency
    supabase.from("goals").select("*, currency"),
  ]);

  // Separate transactions by type and currency
  const expenseTransactions = (transactions || []).filter(
    (tx: any) => tx.type === "expense"
  );
  const incomeTransactions = (transactions || []).filter(
    (tx: any) => tx.type === "income"
  );
  const unexpectedTransactions = (transactions || []).filter(
    (tx: any) => tx.is_unexpected
  );

  // Calculate totals BY CURRENCY
  const expenseByCurrency = sumByCurrency(expenseTransactions);
  const incomeByCurrency = sumByCurrency(incomeTransactions);

  // Group spending by category AND currency
  const categorySpending = groupByCategory(expenseTransactions);

  // Format category spending for context
  const categoryBreakdown = Object.entries(categorySpending)
    .map(([category, currencies]) => {
      const amounts = Object.entries(currencies)
        .map(([currency, amount]) => formatMoney(amount, currency))
        .join(", ");
      return `- ${category}: ${amounts}`;
    })
    .join("\n");

  // Format debts with currency
  const debtsList = (debts || [])
    .map((d: any) => {
      const currency = d.currency || "USD";
      return `- ${d.name}: ${formatMoney(d.current_balance || 0, currency)} at ${d.interest_rate || 0}% APR`;
    })
    .join("\n");

  // Calculate total debt BY CURRENCY
  const debtByCurrency: Record<string, number> = {};
  (debts || []).forEach((d: any) => {
    const currency = d.currency || "USD";
    if (!debtByCurrency[currency]) {
      debtByCurrency[currency] = 0;
    }
    debtByCurrency[currency] += d.current_balance || 0;
  });

  const totalDebtStr = Object.entries(debtByCurrency)
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" + ");

  // Calculate account balances BY CURRENCY
  const assetByCurrency: Record<string, number> = {};
  const debtAccountByCurrency: Record<string, number> = {};

  (accounts || []).forEach((a: any) => {
    const currency = a.currency || "USD";
    if (a.is_debt) {
      if (!debtAccountByCurrency[currency])
        debtAccountByCurrency[currency] = 0;
      debtAccountByCurrency[currency] += a.current_balance || 0;
    } else {
      if (!assetByCurrency[currency]) assetByCurrency[currency] = 0;
      assetByCurrency[currency] += a.current_balance || 0;
    }
  });

  const totalAssetsStr =
    Object.entries(assetByCurrency)
      .map(([currency, amount]) => formatMoney(amount, currency))
      .join(" + ") || "0 USD";

  // Check emergency fund status
  const emergencyFundGoal = goals?.find((g: any) =>
    g.name?.toLowerCase().includes("emergency")
  );
  const hasEmergencyFund =
    emergencyFundGoal && emergencyFundGoal.current_amount > 0;

  // Format income/expense totals
  const incomeStr =
    Object.entries(incomeByCurrency)
      .map(([currency, amount]) => formatMoney(amount, currency))
      .join(" + ") || "0 USD";

  const expenseStr =
    Object.entries(expenseByCurrency)
      .map(([currency, amount]) => formatMoney(amount, currency))
      .join(" + ") || "0 USD";

  // Build context string with EXPLICIT CURRENCY TAGS
  let context = `
## User's Financial Snapshot (Last 30 Days)

### Income & Spending (BY CURRENCY - DO NOT MIX)
- **Total Income:** ${incomeStr}
- **Total Expenses:** ${expenseStr}
- ⚠️ These totals are separated by currency. Do not sum them together.

### Spending by Category (BY CURRENCY)
${categoryBreakdown || "- No transactions recorded"}

### Debt Status (BY CURRENCY)
- **Total Debt:** ${totalDebtStr || "0 USD"}
${debtsList || "- No debts recorded"}

### Liquid Assets (BY CURRENCY)
- **Total Liquid Assets:** ${totalAssetsStr}

### Emergency Fund Status
${
  hasEmergencyFund
    ? `- Emergency Fund: ${formatMoney(emergencyFundGoal.current_amount, emergencyFundGoal.currency || "USD")} saved`
    : "- ⚠️ NO EMERGENCY FUND - This should be Priority #1"
}`;

  // Add unexpected expenses if any
  if (unexpectedTransactions.length > 0) {
    context += `

### ⚠️ Unexpected Expenses This Month
${unexpectedTransactions
  .map((e: any) => {
    const currency = e.currency || "USD";
    return `- ${e.description || e.categories?.name || "Unknown"}: ${formatMoney(e.amount, currency)} (${e.date})`;
  })
  .join("\n")}`;
  }

  // Add raw JSON data for AI reference
  context += `

### Raw Data (JSON)
\`\`\`json
{
  "transactions": ${JSON.stringify(
    (transactions || []).slice(0, 20).map((t: any) => ({
      description: t.description,
      amount: `${t.amount} ${t.currency || "USD"}`,
      category: t.categories?.name,
      type: t.type,
      date: t.date,
      is_unexpected: t.is_unexpected,
    })),
    null,
    2
  )},
  "debts": ${JSON.stringify(
    (debts || []).map((d: any) => ({
      name: d.name,
      balance: `${d.current_balance} ${d.currency || "USD"}`,
      interest_rate: d.interest_rate,
    })),
    null,
    2
  )},
  "accounts": ${JSON.stringify(
    (accounts || []).map((a: any) => ({
      name: a.name,
      balance: `${a.current_balance} ${a.currency || "USD"}`,
      is_debt: a.is_debt,
    })),
    null,
    2
  )}
}
\`\`\``;

  return context;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, locale = "en" } = await req.json();

    // Get financial context with currency awareness
    const financialContext = await getFinancialContext(supabase, user.id);

    // Create the full system prompt with context and locale
    const systemPrompt = getSystemPrompt(locale);
    const systemPromptWithContext = `${systemPrompt}

---

${financialContext}

---

CRITICAL: When analyzing the above data, ALWAYS respect currency boundaries. Never sum amounts with different currency codes.`;

    // Stream response from Gemini
    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: systemPromptWithContext,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
