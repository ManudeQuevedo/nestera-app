import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Mock transaction data for testing the review wizard
function generateMockTransactions() {
  const transactions = [
    // Uber - 5 transactions (for grouping test)
    { id: "tx_1", date: "2024-12-01", description: "Uber", amount: -89, suggested_category: "Transport" },
    { id: "tx_2", date: "2024-12-03", description: "Uber", amount: -125, suggested_category: "Transport" },
    { id: "tx_3", date: "2024-12-05", description: "Uber", amount: -67, suggested_category: "Transport" },
    { id: "tx_4", date: "2024-12-08", description: "Uber", amount: -98, suggested_category: "Transport" },
    { id: "tx_5", date: "2024-12-12", description: "Uber", amount: -71, suggested_category: "Transport" },
    
    // Starbucks - 3 transactions (for grouping test)
    { id: "tx_6", date: "2024-12-02", description: "Starbucks", amount: -85, suggested_category: "Food" },
    { id: "tx_7", date: "2024-12-06", description: "Starbucks", amount: -92, suggested_category: "Food" },
    { id: "tx_8", date: "2024-12-10", description: "Starbucks", amount: -78, suggested_category: "Food" },
    
    // Netflix - 1 subscription
    { id: "tx_9", date: "2024-12-01", description: "Netflix", amount: -199, suggested_category: "Subscriptions" },
    
    // Spotify - 1 subscription
    { id: "tx_10", date: "2024-12-01", description: "Spotify", amount: -115, suggested_category: "Subscriptions" },
    
    // Amazon - 2 transactions
    { id: "tx_11", date: "2024-12-04", description: "Amazon", amount: -1299, suggested_category: "Shopping" },
    { id: "tx_12", date: "2024-12-09", description: "Amazon", amount: -459, suggested_category: "Shopping" },
    
    // Costco - 1 large transaction (for event/goal linking test)
    { id: "tx_13", date: "2024-12-07", description: "Costco", amount: -3500, suggested_category: "Shopping" },
    
    // OXXO - 3 small transactions
    { id: "tx_14", date: "2024-12-02", description: "OXXO", amount: -45, suggested_category: "Food" },
    { id: "tx_15", date: "2024-12-05", description: "OXXO", amount: -38, suggested_category: "Food" },
    { id: "tx_16", date: "2024-12-11", description: "OXXO", amount: -52, suggested_category: "Food" },
    
    // CFE - Electricity
    { id: "tx_17", date: "2024-12-03", description: "CFE Recibo Luz", amount: -850, suggested_category: "Services" },
    
    // Telmex - Internet
    { id: "tx_18", date: "2024-12-05", description: "Telmex Internet", amount: -599, suggested_category: "Services" },
    
    // Income - Salary
    { id: "tx_19", date: "2024-12-01", description: "Nómina Empresa", amount: 25000, suggested_category: "Income" },
    
    // Gas Station
    { id: "tx_20", date: "2024-12-06", description: "Pemex Gasolinera", amount: -1200, suggested_category: "Transport" },
  ];

  return transactions;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get file from form data (we don't actually process it in mock mode)
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se subió ningún archivo" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.some(type => file.type.includes(type.split("/")[1]))) {
      return NextResponse.json(
        { error: "Tipo de archivo inválido. Solo PDF, CSV o Excel." },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Archivo muy grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // In production, we would:
    // 1. Upload to temp_imports bucket
    // 2. Parse with AI
    // 3. Store in bank_imports table
    
    // For now, return MOCK DATA for testing
    const mockTransactions = generateMockTransactions();

    // Create a bank_import record for tracking (optional)
    const { data: importRecord, error: importError } = await supabase
      .from("bank_imports")
      .insert({
        user_id: user.id,
        raw_data: mockTransactions,
        file_path: `${user.id}/mock_${Date.now()}.pdf`,
        status: "reviewing",
      })
      .select("id")
      .single();

    if (importError) {
      console.error("Bank import staging error:", importError);
      // Don't fail - just return without importId
    }

    return NextResponse.json({
      success: true,
      importId: importRecord?.id,
      transactions: mockTransactions,
      message: "Archivo procesado exitosamente (modo demo)",
    });

  } catch (error) {
    console.error("Upload statement error:", error);
    return NextResponse.json(
      { error: "Error al procesar el archivo" },
      { status: 500 }
    );
  }
}
