import { enhancePrompt, generateMedia } from "./freepik.service";
import { uploadVideo, uploadImage } from "./cloudinary.service";

export interface AdVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  productImageUrl: string | null;
  modelImageUrl: string | null;
}

// ─── Orchestrates the full ad-video generation pipeline ──────
export class AIService {
  async generateAdVideo(
    prompt: string,
    duration: number,
    style: string,
    brandName: string = "",
    aspectRatio: string = "16:9",
    productImageBuffer?: Buffer,
    modelImageBuffer?: Buffer
  ): Promise<AdVideoResult> {
    let productImageUrl: string | null = null;
    let modelImageUrl: string | null = null;

    if (productImageBuffer) {
      const uploaded = await uploadImage(productImageBuffer, {
        folder: "adwork/product-images",
      });
      productImageUrl = uploaded.imageUrl;
    }

    if (modelImageBuffer) {
      const uploaded = await uploadImage(modelImageBuffer, {
        folder: "adwork/model-images",
      });
      modelImageUrl = uploaded.imageUrl;
    }

    const enhancedPrompt = await enhancePrompt(
      prompt,
      style,
      duration,
      brandName,
      productImageBuffer,
      modelImageBuffer
    );

    const mediaBuffer = await generateMedia(
      enhancedPrompt,
      aspectRatio,
      productImageBuffer
    );

    const uploaded = await uploadImage(mediaBuffer);

    return {
      videoUrl: uploaded.imageUrl, // Map it to videoUrl since frontend uses it
      thumbnailUrl: uploaded.imageUrl,
      cloudinaryPublicId: uploaded.publicId,
      productImageUrl,
      modelImageUrl,
    };
  }
}

export const aiService = new AIService();
