import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const POLL_INTERVAL_MS = 10_000;
const FILE_POLL_MS = 3_000;
const FILE_POLL_MAX = 10;

const STYLE_PROMPTS: Record<string, string> = {
  cinematic:
    "cinematic lighting, film grain, dramatic shadows, professional color grading, 4k quality",
  minimal:
    "clean minimalist design, white space, elegant typography, modern aesthetic",
  bold: "vibrant colors, high contrast, dynamic composition, energetic motion, impactful visuals",
  corporate:
    "professional business look, clean structured layout, trustworthy blue tones, polished",
  playful:
    "colorful fun animation style, whimsical youthful energy, bright warm palette",
  luxury:
    "golden accents, rich textures, elegant premium feel, sophisticated dark background, refined",
};

// ─── Singleton ───────────────────────────────────────────────

let ai: GoogleGenAI | null = null;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Get your free key at https://aistudio.google.com/apikey"
    );
  }
  return key;
}

function getAI(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return ai;
}

// ─── Helpers ─────────────────────────────────────────────────

async function uploadImageToGemini(
  buffer: Buffer,
  mimeType: string = "image/jpeg"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const genai = getAI();
  const ext = mimeType.split("/")[1] || "jpg";
  const tmpPath = path.join(os.tmpdir(), `adwork-upload-${Date.now()}.${ext}`);

  try {
    fs.writeFileSync(tmpPath, buffer);

    const file = await genai.files.upload({
      file: tmpPath,
      config: { mimeType },
    });

    let current = file;
    for (let i = 0; i < FILE_POLL_MAX; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((current as any).state === "ACTIVE" || !(current as any).state) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((current as any).state === "FAILED") {
        throw new Error("Gemini file upload processing failed");
      }
      await new Promise((r) => setTimeout(r, FILE_POLL_MS));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((current as any).name) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current = await genai.files.get({ name: (current as any).name });
      }
    }

    return current;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch { /* best effort */ }
  }
}

// ─── Public API ──────────────────────────────────────────────

export async function enhancePrompt(
  prompt: string,
  style: string,
  duration: number,
  brandName?: string,
  productImageBuffer?: Buffer,
  modelImageBuffer?: Buffer
): Promise<string> {
  const genai = getAI();
  const styleModifier = STYLE_PROMPTS[style] || "";

  const systemPrompt = `You are an expert UGC video ad creative director.
Given a brief (and optional product/model photos), generate a detailed video 
description optimized for AI video generation.

Rules:
- Output ONLY the video description, no explanations or formatting
- Describe specific visuals, camera movements, lighting, and transitions
- Include the product/brand prominently
- Keep the UGC (user-generated content) authentic feel
- Target duration: ${duration} seconds
- Style: ${style} (${styleModifier})
- Make it feel like a real person creating content, not overly polished
- Include specific visual details that AI video models can render well
- If a product photo is provided, describe its appearance faithfully
- If a model/person photo is provided, describe that person in the scene`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contents: any[] = [{ text: systemPrompt }];

  if (productImageBuffer) {
    contents.push({
      inlineData: {
        data: productImageBuffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    });
    contents.push({
      text: "Above: the product photo. Describe this product's exact visual appearance in the video.",
    });
  }

  if (modelImageBuffer) {
    contents.push({
      inlineData: {
        data: modelImageBuffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    });
    contents.push({
      text: "Above: the model/person to feature in the ad. Include their appearance in the video description.",
    });
  }

  const brandLine = brandName ? `Brand: ${brandName}. ` : "";
  contents.push({ text: `${brandLine}Ad brief: ${prompt}` });

  const response = await genai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
  });

  const enhanced = response.text?.trim() ?? "";

  if (!enhanced || enhanced.length < 10) {
    return `${brandLine}${prompt}, ${styleModifier}, UGC style advertisement, authentic feel, commercial quality`;
  }

  return enhanced;
}

export async function generateVideo(
  prompt: string,
  _duration: number,
  aspectRatio: string = "16:9",
  productImageBuffer?: Buffer
): Promise<Buffer> {
  const genai = getAI();
  const model = "veo-3.1-generate-preview";
  const ratio = aspectRatio === "9:16" ? "9:16" : "16:9";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateParams: any = {
    model,
    prompt,
    config: {
      aspectRatio: ratio,
      numberOfVideos: 1,
      personGeneration: "allow_adult",
    },
  };

  if (productImageBuffer) {
    generateParams.image = {
      imageBytes: productImageBuffer.toString("base64"),
      mimeType: "image/jpeg",
    };
  }

  let operation = await genai.models.generateVideos(generateParams);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    operation = await genai.operations.getVideosOperation({ operation });
  }

  if (!operation.response?.generatedVideos) {
    throw new Error(
      `Video generation failed: ${JSON.stringify(
        operation.response?.raiMediaFilteredReasons ?? "unknown error"
      )}`
    );
  }

  const generatedVideo = operation.response.generatedVideos[0];
  if (!generatedVideo?.video) {
    throw new Error("Veo returned no video data");
  }

  const tmpDir = path.join(os.tmpdir(), "adwork-videos");
  fs.mkdirSync(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, `${Date.now()}.mp4`);

  try {
    await genai.files.download({
      file: generatedVideo.video,
      downloadPath: filePath,
    });
    return fs.readFileSync(filePath);
  } finally {
    try { fs.unlinkSync(filePath); } catch { /* best effort */ }
  }
}

export async function generateThumbnail(prompt: string): Promise<Buffer> {
  const genai = getAI();

  const response = await genai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `Generate a high-quality thumbnail image for this video ad: ${prompt}. 
Make it eye-catching, professional studio lighting, ecommerce quality.`,
      },
    ],
    config: {
      responseModalities: ["image", "text"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64");
      }
    }
  }

  throw new Error("Image generation returned no image data");
}
