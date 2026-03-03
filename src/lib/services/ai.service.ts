import { enhancePrompt, generateVideo, generateAdImage } from "./gemini.service";
import { uploadVideo, uploadImage } from "./cloudinary.service";

export interface AdVideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  productImageUrl: string | null;
  modelImageUrl: string | null;
  enhancedPrompt: string;
}

export interface AdImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  productImageUrl: string | null;
  enhancedPrompt: string;
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
    modelImageBuffer?: Buffer,
    overridePrompt?: string
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

    const enhancedPrompt = overridePrompt?.trim()
      ? overridePrompt.trim()
      : await enhancePrompt(
          prompt,
          style,
          duration,
          brandName,
          productImageBuffer,
          modelImageBuffer
        );

    // Pass the model image as the primary reference if provided (person-focused ads),
    // otherwise use the product image as the visual reference for Veo.
    const videoReferenceBuffer = modelImageBuffer ?? productImageBuffer;

    const videoBuffer = await generateVideo(
      enhancedPrompt,
      duration,
      aspectRatio,
      videoReferenceBuffer
    );

    const uploaded = await uploadVideo(videoBuffer);

    return {
      videoUrl: uploaded.videoUrl,
      thumbnailUrl: uploaded.thumbnailUrl,
      cloudinaryPublicId: uploaded.publicId,
      productImageUrl,
      modelImageUrl,
      enhancedPrompt,
    };
  }

  // ─── Image Ad Generation Pipeline ──────────────────────────
  async generateAdImageAd(
    prompt: string,
    style: string,
    brandName: string = "",
    aspectRatio: string = "16:9",
    productImageBuffer?: Buffer,
    modelImageBuffer?: Buffer,
    overridePrompt?: string
  ): Promise<AdImageResult> {
    let productImageUrl: string | null = null;

    if (productImageBuffer) {
      const uploaded = await uploadImage(productImageBuffer, {
        folder: "adwork/product-images",
      });
      productImageUrl = uploaded.imageUrl;
    }

    const enhancedPrompt = overridePrompt?.trim()
      ? overridePrompt.trim()
      : await enhancePrompt(
          prompt,
          style,
          0, // no duration for images
          brandName,
          productImageBuffer,
          modelImageBuffer
        );

    const imageBuffer = await generateAdImage(
      enhancedPrompt,
      style,
      brandName,
      aspectRatio,
      productImageBuffer,
      modelImageBuffer
    );

    const uploaded = await uploadImage(imageBuffer, {
      folder: "adwork/generated-images",
    });

    return {
      imageUrl: uploaded.imageUrl,
      thumbnailUrl: uploaded.imageUrl,
      cloudinaryPublicId: uploaded.publicId,
      productImageUrl,
      enhancedPrompt,
    };
  }
}

export const aiService = new AIService();
