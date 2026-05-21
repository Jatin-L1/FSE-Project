/**
 * Image generation service using Pollinations.ai
 * Free, no API key required, simple and reliable
 */

const STYLE_PROMPTS: Record<string, string> = {
  cinematic: "cinematic lighting, film grain, dramatic shadows, professional color grading, 4k quality",
  minimal: "clean minimalist design, white space, elegant typography, modern aesthetic",
  bold: "vibrant colors, high contrast, dynamic composition, energetic motion, impactful visuals",
  corporate: "professional business look, clean structured layout, trustworthy blue tones, polished",
  playful: "colorful fun animation style, whimsical youthful energy, bright warm palette",
  luxury: "golden accents, rich textures, elegant premium feel, sophisticated dark background, refined",
};

export async function enhancePrompt(
  prompt: string,
  style: string,
  duration: number,
  brandName?: string,
  _productImageBuffer?: Buffer,
  _modelImageBuffer?: Buffer
): Promise<string> {
  const styleModifier = STYLE_PROMPTS[style] || "";
  const brandLine = brandName ? `Brand: ${brandName}. ` : "";
  return `${brandLine}${prompt}, ${styleModifier}, highly detailed, beautiful, commercial advertisement photography, 8k resolution`;
}

export async function generateMedia(
  prompt: string,
  aspectRatio: string = "16:9",
  _productImageBuffer?: Buffer
): Promise<Buffer> {
  // Map aspect ratio to width/height
  let width = 1024;
  let height = 576;
  
  if (aspectRatio === "9:16") {
    width = 576;
    height = 1024;
  } else if (aspectRatio === "1:1") {
    width = 1024;
    height = 1024;
  } else if (aspectRatio === "4:3") {
    width = 1024;
    height = 768;
  } else if (aspectRatio === "3:4") {
    width = 768;
    height = 1024;
  }

  // Pollinations.ai - completely free, no API key needed!
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&model=flux&enhance=true`;

  console.log("Generating image with Pollinations.ai:", pollinationsUrl);

  // Fetch the image directly
  const response = await fetch(pollinationsUrl);

  if (!response.ok) {
    throw new Error(`Pollinations.ai error: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
