import { enhancePrompt, generateVideo } from "./gemini.service";
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

    const videoBuffer = await generateVideo(
      enhancedPrompt,
      duration,
      aspectRatio,
      productImageBuffer
    );

    const uploaded = await uploadVideo(videoBuffer);

    return {
      videoUrl: uploaded.videoUrl,
      thumbnailUrl: uploaded.thumbnailUrl,
      cloudinaryPublicId: uploaded.publicId,
      productImageUrl,
      modelImageUrl,
    };
  }
}

export const aiService = new AIService();
