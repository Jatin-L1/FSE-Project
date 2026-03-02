export type GenerationStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled";

export type AdStyle =
  | "cinematic"
  | "minimal"
  | "bold"
  | "corporate"
  | "playful"
  | "luxury";

// ─── API Request / Response ──────────────────────────────────

export interface CreateAdRequest {
  prompt: string;
  brandName: string;
  duration: number;
  style: string;
  aspectRatio: string;
}

export interface GenerateAdParams {
  brandName: string;
  productDescription: string;
  style: string;
  duration: number;
  aspectRatio: string;
  productPhoto?: File;
  modelPhoto?: File;
}

export interface CreateAdResponse {
  success: true;
  generationId: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface AdStatusResponse {
  success: true;
  generationId: string;
  status: GenerationStatus;
  progress: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
}

export interface AdHistoryItem {
  generationId: string;
  prompt: string;
  brandName: string;
  duration: number;
  style: string;
  aspectRatio: string;
  status: GenerationStatus;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  productImageUrl: string | null;
  modelImageUrl: string | null;
  createdAt: string;
}

export interface AdHistoryResponse {
  success: true;
  generations: AdHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Internal DB record ──────────────────────────────────────

export interface Generation {
  id: string;
  userId: string;
  prompt: string;
  brandName: string;
  duration: number;
  style: string;
  aspectRatio: string;
  status: GenerationStatus;
  progress: number; // 0-100
  videoUrl: string | null;
  thumbnailUrl: string | null;
  productImageUrl: string | null;
  modelImageUrl: string | null;
  cloudinaryPublicId: string | null;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toHistoryItem(gen: Generation): AdHistoryItem {
  return {
    generationId: gen.id,
    prompt: gen.prompt,
    brandName: gen.brandName,
    duration: gen.duration,
    style: gen.style,
    aspectRatio: gen.aspectRatio,
    status: gen.status,
    videoUrl: gen.videoUrl,
    thumbnailUrl: gen.thumbnailUrl,
    productImageUrl: gen.productImageUrl,
    modelImageUrl: gen.modelImageUrl,
    createdAt: gen.createdAt.toISOString(),
  };
}
