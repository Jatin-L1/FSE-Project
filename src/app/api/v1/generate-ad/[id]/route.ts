import { NextRequest, NextResponse } from "next/server";
import { getGenerationRepository } from "@/lib/db/generation-repository";
import { deleteMedia } from "@/lib/services/cloudinary.service";
import { getAuthUser } from "@/lib/auth/helpers";

// ─── GET — Return stored generation status ───────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const repo = getGenerationRepository();
    const generation = await repo.findById(id);

    if (!generation) {
      return NextResponse.json(
        { success: false, error: "Generation not found" },
        { status: 404 }
      );
    }

    if (generation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (generation.status === "failed") {
      return NextResponse.json({
        success: false,
        error: generation.error || "Generation failed",
      });
    }

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      status: generation.status,
      progress: generation.progress,
      videoUrl: generation.videoUrl,
      thumbnailUrl: generation.thumbnailUrl,
    });
  } catch (error) {
    console.error("GET /api/v1/generate-ad/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── DELETE — Remove generation + Cloudinary assets ──────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const repo = getGenerationRepository();
    const generation = await repo.findById(id);

    if (!generation) {
      return NextResponse.json(
        { success: false, error: "Generation not found" },
        { status: 404 }
      );
    }

    if (generation.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (generation.cloudinaryPublicId) {
      try {
        await deleteMedia(generation.cloudinaryPublicId, "video");
      } catch {
        console.warn(
          `Failed to delete Cloudinary asset: ${generation.cloudinaryPublicId}`
        );
      }
    }

    await repo.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/generate-ad/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
