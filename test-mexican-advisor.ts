// Run with: npx tsx test-mexican-advisor.ts
import { analyzeDebtPortfolio } from './src/lib/ai-prompts/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function validateAdvisor() {
  console.log("🇲🇽 Testing Mexican Financial Advisor (Gemini 1.5 Pro)...");

  const mockUser = {
    debts: [
      {
        concept: "iPhone 15 Pro (Liverpool)",
        balance: 25000,
        interest_rate: 0,
        interest_rate_ordinaria: 0,
        iva_rate: 16,
        is_msi: true,
        cat_val: 0,
        status: "current",
      },
      {
        concept: "Tarjeta BBVA Oro",
        balance: 45000,
        interest_rate: 65,
        interest_rate_ordinaria: 65,
        iva_rate: 16,
        cat_val: 85,
        status: "current",
      },
    ],
    assets: [
      { type: "Cetes", valuation_mxn: 10000 }
    ],
  };

  try {
    const result = await analyzeDebtPortfolio(mockUser);

    console.log("✅ Analysis Complete!");
    console.log("------------------------------------------------");
    console.log("❄️ Frozen Debts:", result.freezeList);
    console.log("🔥 Top Priority:", result.debtPayoffPriority[0]?.debtName);
    console.log("⚠️ Warnings:", result.warnings);
    console.log("💡 Tips:", result.strategicTips);
    console.log("------------------------------------------------");

  } catch (e) {
    console.error("❌ Error:", e);
  }
}

validateAdvisor();