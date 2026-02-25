import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { aiService } from "@/lib/services/ai.service";
import { generateAdSchema, extractZodError } from "@/lib/middleware/validate";
import { getGenerationRepository } from "@/lib/db/generation-repository";
import { getAuthUser } from "@/lib/auth/helpers";
import type { Generation } from "@/lib/types";

// ─── POST /api/v1/generate-ad ───────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let formData: FormData;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
    } else {
      const json = await request.json();
      formData = new FormData();
      formData.set("productDescription", json.prompt || json.productDescription || "");
      formData.set("brandName", json.brandName || "");
      formData.set("duration", String(json.duration || 6));
      formData.set("style", json.style || "luxury");
      formData.set("aspectRatio", json.aspectRatio || "16:9");
    }

    // Extract text fields and coerce types
    const body = {
      prompt: ((formData.get("productDescription") as string) || "").trim(),
      brandName: ((formData.get("brandName") as string) || "").trim(),
      duration: parseInt((formData.get("duration") as string) || "6", 10),
      style: (formData.get("style") as string) || "luxury",
      aspectRatio: (formData.get("aspectRatio") as string) || "16:9",
    };

    // Validate with Zod
    const parsed = generateAdSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: extractZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { prompt, brandName, duration, style, aspectRatio } = parsed.data;

    const productPhotoFile = formData.get("productPhoto") as File | null;
    const modelPhotoFile = formData.get("modelPhoto") as File | null;

    let productImageBuffer: Buffer | undefined;
    let modelImageBuffer: Buffer | undefined;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const isFreePlan = user.plan === "free";

    if (productPhotoFile && productPhotoFile.size > 0) {
      if (isFreePlan && productPhotoFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "Image exceeds 10 MB. Upgrade to Pro for larger uploads." },
          { status: 413 }
        );
      }
      const bytes = await productPhotoFile.arrayBuffer();
      productImageBuffer = Buffer.from(bytes);
    }

    if (modelPhotoFile && modelPhotoFile.size > 0) {
      if (isFreePlan && modelPhotoFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "Image exceeds 10 MB. Upgrade to Pro for larger uploads." },
          { status: 413 }
        );
      }
      const bytes = await modelPhotoFile.arrayBuffer();
      modelImageBuffer = Buffer.from(bytes);
    }

    // Create generation record
    const generationId = uuidv4();
    const now = new Date();
    const generation: Generation = {
      id: generationId,
      userId: user.id,
      prompt: prompt.trim(),
      brandName: brandName || "",
      duration,
      style,
      aspectRatio: aspectRatio || "16:9",
      status: "processing",
      progress: 0,
      videoUrl: null,
      thumbnailUrl: null,
      productImageUrl: null,
      modelImageUrl: null,
      cloudinaryPublicId: null,
      error: null,
      createdAt: now,
      updatedAt: now,
    };

    const repo = getGenerationRepository();
    await repo.create(generation);

    const result = await aiService.generateAdVideo(
      prompt,
      duration,
      style,
      brandName,
      aspectRatio,
      productImageBuffer,
      modelImageBuffer
    );

    await repo.updateStatus(generationId, {
      status: "succeeded",
      progress: 100,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      cloudinaryPublicId: result.cloudinaryPublicId,
    });

    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      generationId,
    });
  } catch (error) {
    console.error("POST /api/v1/generate-ad error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
