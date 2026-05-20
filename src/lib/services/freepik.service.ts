import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const STYLE_PROMPTS: Record<string, string> = {
  cinematic: "cinematic lighting, film grain, dramatic shadows, professional color grading, 4k quality",
  minimal: "clean minimalist design, white space, elegant typography, modern aesthetic",
  bold: "vibrant colors, high contrast, dynamic composition, energetic motion, impactful visuals",
  corporate: "professional business look, clean structured layout, trustworthy blue tones, polished",
  playful: "colorful fun animation style, whimsical youthful energy, bright warm palette",
  luxury: "golden accents, rich textures, elegant premium feel, sophisticated dark background, refined",
};

function getApiKey(): string {
  const key = process.env.FREEPIK_API_KEY || "your_freepik_api_key_here";
  if (!key) {
    throw new Error("FREEPIK_API_KEY environment variable is not set.");
  }
  return key;
}

export async function enhancePrompt(
  prompt: string,
  style: string,
  duration: number, // kept for signature compatibility
  brandName?: string,
  productImageBuffer?: Buffer,
  modelImageBuffer?: Buffer
): Promise<string> {
  const styleModifier = STYLE_PROMPTS[style] || "";
  const brandLine = brandName ? `Brand: ${brandName}. ` : "";
  // Freepik doesn't have an LLM prompt enhancer natively that we can ping without another API,
  // so we just structure a highly descriptive prompt for the Text-to-Image API.
  return `${brandLine}${prompt}, ${styleModifier}, highly detailed, beautiful, commercial advertisement photography, 8k resolution`;
}

export async function generateMedia(
  prompt: string,
  aspectRatio: string = "16:9",
  productImageBuffer?: Buffer
): Promise<Buffer> {
  const apiKey = getApiKey();
  
  // Convert aspect ratio to freepik format if necessary. Usually it supports landscape, portrait, square.
  // We'll just append it to the prompt if they don't have explicit param, but Mystic has some params.
  // For text-to-image v1:
  let w = 1280;
  let h = 720;
  if (aspectRatio === "9:16") {
    w = 720;
    h = 1280;
  }
  // Wait, let's use the simplest payload and base64 parsing based on our test.
  
  const payload = {
    prompt,
    // Add additional fields if verified by Freepik, otherwise prompt is enough.
  };

  const response = await fetch("https://api.freepik.com/v1/ai/text-to-image", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Freepik generation failed: ${errText}`);
  }

  const data = await response.json();
  if (!data?.data?.[0]?.base64) {
    throw new Error("Freepik returned unexpected format: no base64 image data found.");
  }

  return Buffer.from(data.data[0].base64, "base64");
}
