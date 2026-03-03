import { NextRequest, NextResponse } from "next/server";
import { enhancePrompt } from "@/lib/services/gemini.service";

// ─── POST /api/v1/enhance-prompt ────────────────────────────
// Free endpoint — no credit cost. Returns an AI-enhanced creative brief
// that the user can preview and optionally edit before generating.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const brandName = ((formData.get("brandName") as string) ?? "").trim();
    const productDescription = ((formData.get("productDescription") as string) ?? "").trim();
    const style = (formData.get("style") as string) ?? "luxury";
    const duration = parseInt((formData.get("duration") as string) ?? "6", 10);

    if (!productDescription) {
      return NextResponse.json(
        { error: "productDescription is required" },
        { status: 400 }
      );
    }

    const productPhotoFile = formData.get("productPhoto") as File | null;
    const modelPhotoFile = formData.get("modelPhoto") as File | null;

    let productImageBuffer: Buffer | undefined;
    let modelImageBuffer: Buffer | undefined;

    if (productPhotoFile && productPhotoFile.size > 0) {
      const bytes = await productPhotoFile.arrayBuffer();
      productImageBuffer = Buffer.from(bytes);
    }

    if (modelPhotoFile && modelPhotoFile.size > 0) {
      const bytes = await modelPhotoFile.arrayBuffer();
      modelImageBuffer = Buffer.from(bytes);
    }

    const enhanced = await enhancePrompt(
      productDescription,
      style,
      duration,
      brandName || undefined,
      productImageBuffer,
      modelImageBuffer
    );

    return NextResponse.json({ enhancedPrompt: enhanced });
  } catch (err) {
    console.error("POST /api/v1/enhance-prompt error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate brief";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
