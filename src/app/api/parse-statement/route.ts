import { NextRequest, NextResponse } from "next/server";
import { extractPDFText, parseStatementWithAI } from "@/actions/statement-parser";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. API Key Check - fail fast with clean error
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[parse-statement] GOOGLE_GENERATIVE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "El servicio de análisis de IA no está configurado. Contacte al administrador." },
        { status: 503 }
      );
    }

    // 2. Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 3. Get file from form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error("[parse-statement] FormData parsing error:", formError);
      return NextResponse.json(
        { error: "No se pudo procesar la solicitud." },
        { status: 400 }
      );
    }
    
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // 5. Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // 6. Convert to buffer and extract text
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (bufferError) {
      console.error("[parse-statement] Buffer conversion error:", bufferError);
      return NextResponse.json(
        { error: "No se pudo leer el archivo." },
        { status: 400 }
      );
    }
    
    // 7. Extract PDF text
    let pdfText: string;
    try {
      pdfText = await extractPDFText(buffer);
    } catch (pdfError) {
      console.error("[parse-statement] PDF extraction error:", pdfError);
      return NextResponse.json(
        { error: "No se pudo leer el PDF. El archivo puede estar corrupto o protegido." },
        { status: 400 }
      );
    }

    // 8. Parse with AI
    const result = await parseStatementWithAI(pdfText);

    if (!result.success) {
      console.error("[parse-statement] AI parsing failed:", result.error);
      return NextResponse.json(
        { error: result.error || "No se pudieron extraer transacciones." },
        { status: 400 }
      );
    }

    // 9. Store in bank_imports for ephemeral staging (Data Bridge pattern)
    const { data: importRecord, error: importError } = await supabase
      .from("bank_imports")
      .insert({
        user_id: user.id,
        raw_data: result.transactions,
        status: "reviewing",
        file_path: null, // We don't store the file, just parsed data
      })
      .select("id")
      .single();

    if (importError) {
      console.error("[parse-statement] Bank import staging error:", importError);
      // Don't fail the request, just return without importId
      return NextResponse.json(result);
    }

    return NextResponse.json({
      ...result,
      importId: importRecord.id,
    });
  } catch (error) {
    // Catch-all for unexpected errors
    console.error("[parse-statement] Unexpected error:", error);
    console.error("[parse-statement] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    return NextResponse.json(
      { error: "Error inesperado al procesar el estado de cuenta. Por favor intente de nuevo." },
      { status: 500 }
    );
  }
}

