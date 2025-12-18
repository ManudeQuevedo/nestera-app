import { generateText } from 'ai';
import { z } from 'zod';
import { AI_MODELS } from './model';
import MEXICAN_FINANCIAL_ADVISOR_PROMPT from './mexican-financial-advisor';

/**
 * Expected JSON output schema (runtime validation)
 */
const AdvisorResponseSchema = z.object({
  freezeList: z.array(z.string()),
  debtPayoffPriority: z.array(
    z.object({
      debtName: z.string(),
      effectiveRate: z.number(),
      balance: z.number(),
    })
  ),
  warnings: z.array(z.string()),
  strategicTips: z.array(z.string()).optional(),
});

export async function analyzeDebtPortfolio(userData: unknown) {
  const { text } = await generateText({
    model: AI_MODELS.reasoning, // Gemini 1.5 Pro (v1)
    prompt: `
${MEXICAN_FINANCIAL_ADVISOR_PROMPT}

Return ONLY valid JSON that matches this shape:

{
  "freezeList": string[],
  "debtPayoffPriority": {
    "debtName": string,
    "effectiveRate": number,
    "balance": number
  }[],
  "warnings": string[],
  "strategicTips"?: string[]
}

User data:
${JSON.stringify(userData, null, 2)}
`,
    temperature: 0,
  });

  // 1️⃣ Extract JSON safely (strip markdown code fences if present)
  let jsonString = text.trim();
  const fenceMatch = jsonString.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    jsonString = fenceMatch[1];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(`Gemini returned non-JSON output:\n${text}`);
  }

  // 2️⃣ Validate against schema
  const result = AdvisorResponseSchema.parse(parsed);

  return result;
}