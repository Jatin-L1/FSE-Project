import { NextRequest, NextResponse } from "next/server";
import { getGenerationRepository } from "@/lib/db/generation-repository";
import { getAuthUser } from "@/lib/auth/helpers";
import { toHistoryItem } from "@/lib/types";
import type { AdHistoryResponse } from "@/lib/types";

// ─── GET /api/v1/generate-ad/history ────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10))
    );

    const repo = getGenerationRepository();
    const { generations, total } = await repo.findByUserId(
      user.id,
      page,
      pageSize
    );

    const response: AdHistoryResponse = {
      success: true,
      generations: generations.map(toHistoryItem),
      total,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/v1/generate-ad/history error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
