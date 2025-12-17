import { NextRequest, NextResponse } from "next/server";
import { extractPDFText, parseStatementWithAI } from "@/actions/statement-parser";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // Convert to buffer and extract text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const pdfText = await extractPDFText(buffer);

    // Parse with AI
    const result = await parseStatementWithAI(pdfText);

    // Store in bank_imports for ephemeral staging (Data Bridge pattern)
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
      console.error("Bank import staging error:", importError);
      // Don't fail the request, just return without importId
      return NextResponse.json(result);
    }

    return NextResponse.json({
      ...result,
      importId: importRecord.id,
    });
  } catch (error) {
    console.error("Statement upload error:", error);
    return NextResponse.json(
      { error: "Failed to process statement" },
      { status: 500 }
    );
  }
}

