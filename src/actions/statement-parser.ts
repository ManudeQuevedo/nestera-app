"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export interface ExtractedTransaction {
  date: string;
  concept: string;
  amount: number;
  currency: string;
  isMSI?: boolean; // Meses Sin Intereses flag
  suggestedCategory?: string;
}

export interface ParseStatementResult {
  success: boolean;
  transactions: ExtractedTransaction[];
  rawText?: string;
  error?: string;
}

const SYSTEM_PROMPT = `You are a Data Extraction Engine specialized in parsing Mexican bank statements.

TASK: Extract all financial transactions from the provided text.

RULES:
1. Ignore headers, footers, page numbers, and promotional text
2. Focus on transaction lines containing: date, concept/description, amount
3. Negative amounts = expenses/withdrawals, Positive amounts = deposits/credits
4. If you see "MSI" or "Meses Sin Intereses", flag that transaction with isMSI: true
5. Suggest a category for each transaction based on the concept (Housing, Food, Transport, Entertainment, Shopping, Services, etc.)

OUTPUT FORMAT - Return ONLY a valid JSON array, no markdown, no explanation:
[
  {
    "date": "YYYY-MM-DD",
    "concept": "Description of transaction",
    "amount": -1234.56,
    "currency": "MXN",
    "isMSI": false,
    "suggestedCategory": "Category Name"
  }
]

If no transactions are found, return an empty array: []

IMPORTANT: Only output the JSON array, nothing else.`;

export async function parseStatementWithAI(
  pdfText: string
): Promise<ParseStatementResult> {
  try {
    if (!pdfText || pdfText.trim().length < 50) {
      return {
        success: false,
        transactions: [],
        error: "El PDF no contiene suficiente texto para procesar.",
      };
    }

    const { text } = await generateText({
      model: google("gemini-1.5-pro"),
      system: SYSTEM_PROMPT,
      prompt: `Extract transactions from this bank statement:\n\n${pdfText.slice(0, 30000)}`,
      temperature: 0.1,
    });

    // Parse the JSON response
    let transactions: ExtractedTransaction[] = [];

    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/```json\n?/, "").replace(/```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/```\n?/, "").replace(/```$/, "");
      }

      transactions = JSON.parse(cleanedText);

      // Validate the structure
      if (!Array.isArray(transactions)) {
        throw new Error("Response is not an array");
      }

      // Normalize each transaction
      transactions = transactions.map((tx) => ({
        date: tx.date || new Date().toISOString().split("T")[0],
        concept: String(tx.concept || ""),
        amount: Number(tx.amount) || 0,
        currency: tx.currency || "MXN",
        isMSI: Boolean(tx.isMSI),
        suggestedCategory: tx.suggestedCategory || "Other",
      }));
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return {
        success: false,
        transactions: [],
        rawText: pdfText.slice(0, 1000),
        error: "No se pudieron extraer las transacciones. El formato del estado de cuenta no es compatible.",
      };
    }

    return {
      success: true,
      transactions,
      rawText: pdfText.slice(0, 500),
    };
  } catch (error) {
    console.error("Statement parsing error:", error);
    return {
      success: false,
      transactions: [],
      error: "Error al procesar el estado de cuenta con IA.",
    };
  }
}

// Helper to extract text from PDF (called from API route)
export async function extractPDFText(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues in client bundles
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("No se pudo leer el archivo PDF.");
  }
}
