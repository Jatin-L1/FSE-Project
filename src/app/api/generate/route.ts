import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY not configured in .env.local" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const brandName = formData.get("brandName") as string;
        const productDescription = formData.get("productDescription") as string || "";
        const productPhoto = formData.get("productPhoto") as File | null;
        const modelPhoto = formData.get("modelPhoto") as File | null;
        const adStyle = formData.get("adStyle") as string || "luxury";
        const aspectRatio = formData.get("aspectRatio") as string || "9:16";
        const generationType = formData.get("generationType") as string || "image";

        if (!brandName) {
            return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
        }
        if (!productPhoto) {
            return NextResponse.json({ error: "Product photo is required" }, { status: 400 });
        }

        // Read photos
        const productBuffer = Buffer.from(await productPhoto.arrayBuffer());
        const productBase64 = productBuffer.toString("base64");
        const productMimeType = productPhoto.type || "image/jpeg";

        let modelBase64: string | null = null;
        let modelMimeType: string | null = null;
        if (modelPhoto) {
            modelBase64 = Buffer.from(await modelPhoto.arrayBuffer()).toString("base64");
            modelMimeType = modelPhoto.type || "image/jpeg";
        }

        // ──────────────────────────────────────────────
        // Step 1: Generate Ad Copy with Gemini 2.5 Flash
        // ──────────────────────────────────────────────
        console.log("📝 Generating ad copy with Gemini 2.5 Flash...");

        const genAI = new GoogleGenerativeAI(apiKey);
        const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const imageParts: { inlineData: { data: string; mimeType: string } }[] = [
            { inlineData: { data: productBase64, mimeType: productMimeType } },
        ];
        if (modelBase64 && modelMimeType) {
            imageParts.push({ inlineData: { data: modelBase64, mimeType: modelMimeType } });
        }

        const adCopyPrompt = `You are a world-class advertising creative director.
Based on the product image provided, create a compelling advertisement for brand "${brandName}".
Product: ${productDescription}
Ad style: ${adStyle}
${modelPhoto ? "A model/person photo is also provided for reference." : ""}

Return ONLY this JSON (no markdown, no backticks):
{
  "headline": "Attention-grabbing headline about ${productDescription}, max 8 words",
  "subheadline": "Supporting context line, max 15 words",
  "cta": "Call-to-action, max 4 words",
  "bodyText": "Ad body about ${productDescription}, max 30 words",
  "colorScheme": "Two hex colors for the ad",
  "mood": "Three mood words",
  "targetAudience": "Target audience phrase",
  "imagePrompt": "Describe a SPECIFIC ad scene: an attractive model HOLDING, WEARING, or USING the ${productDescription}. Include the model's pose, outfit, expression, background, lighting, camera angle. Must look like a professional magazine ad. Max 80 words. NO text/words in the image.",
  "videoDescription": "Cinematic video ad for ${productDescription}: describe camera angles, product showcase, model interaction, lighting, mood, transitions. Max 80 words."
}`;

        let adCopy;
        try {
            const result = await textModel.generateContent([adCopyPrompt, ...imageParts]);
            const rawText = result.response.text();
            console.log("Raw response:", rawText.substring(0, 200));

            const cleanJson = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            adCopy = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
            console.log("✅ Ad copy generated!");
        } catch (copyErr) {
            console.error("Ad copy error:", copyErr instanceof Error ? copyErr.message.substring(0, 100) : "unknown");
            adCopy = {
                headline: `${brandName} — Redefine Excellence`,
                subheadline: "Where premium quality meets modern innovation",
                cta: "Shop Now",
                bodyText: `Discover the perfect ${productDescription}. Crafted for those who demand nothing but the best.`,
                colorScheme: "#7C3AED, #6366F1",
                mood: "Premium, Bold, Modern",
                targetAudience: "Style-conscious professionals",
                imagePrompt: `An attractive model confidently showcasing ${productDescription} by ${brandName}, professional studio lighting, ${adStyle} aesthetic, magazine ad`,
                videoDescription: `Cinematic close-up of ${productDescription} by ${brandName}, dramatic lighting, slow revealing shot, premium feel.`,
            };
        }

        // ──────────────────────────────────────────────
        // Step 2: Generate Image OR Video
        // ──────────────────────────────────────────────
        const ai = new GoogleGenAI({ apiKey });
        let generatedImage: { data: string; mimeType: string } | null = null;
        let generatedVideo: { data: string; mimeType: string } | null = null;

        if (generationType === "video") {
            // ──── VIDEO GENERATION (Veo 3.1) ────
            console.log("🎬 Generating video with Veo 3.1...");
            try {
                const videoPrompt = `Create a professional ${adStyle} video advertisement for "${brandName}".
Product: ${productDescription}.
${adCopy.videoDescription}
Style: ${adStyle}, cinematic, commercial quality, premium brand aesthetic.`;

                // Build reference images
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const referenceImages: any[] = [{
                    image: { imageBytes: productBase64, mimeType: productMimeType },
                    referenceType: "STYLE",
                }];
                if (modelBase64 && modelMimeType) {
                    referenceImages.push({
                        image: { imageBytes: modelBase64, mimeType: modelMimeType },
                        referenceType: "STYLE",
                    });
                }

                let operation = await ai.models.generateVideos({
                    model: "veo-3.1-generate-preview",
                    prompt: videoPrompt,
                    config: {
                        aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
                    },
                });

                console.log("📋 Video task started, polling...");
                let pollCount = 0;
                while (!operation.done && pollCount < 60) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    operation = await ai.operations.getVideosOperation({ operation });
                    pollCount++;
                    if (pollCount % 5 === 0) console.log(`Poll ${pollCount}: still generating...`);
                }

                if (operation.done && operation.response?.generatedVideos?.[0]?.video?.uri) {
                    const videoUri = operation.response.generatedVideos[0].video.uri;
                    console.log("⬇️ Downloading video...");
                    const videoResponse = await fetch(`${videoUri}&key=${apiKey}`);
                    if (videoResponse.ok) {
                        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
                        generatedVideo = { data: videoBuffer.toString("base64"), mimeType: "video/mp4" };
                        console.log(`✅ Video generated! ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);
                    }
                } else {
                    console.log("⏱️ Video timed out or no result");
                }
            } catch (videoErr) {
                console.error("Video error:", videoErr instanceof Error ? videoErr.message.substring(0, 150) : "unknown");
            }
        } else {

            console.log("🎨 Generating image with Gemini...");
            try {
                const imagePrompt = `Based on the product shown in the reference photo(s), create a professional ${adStyle} advertisement image. ${adCopy.imagePrompt || `An attractive model promoting ${productDescription}`}. The model is showcasing the exact product from ${brandName} shown in the reference image. Professional ${adStyle} advertisement photography, magazine ad campaign, commercial quality, sharp focus, professional lighting, 8k resolution. IMPORTANT: Do NOT include any text, words, or letters in the image.`;


                const imageContents: any[] = [
                    { text: imagePrompt },
                    { inlineData: { data: productBase64, mimeType: productMimeType } },
                ];
                if (modelBase64 && modelMimeType) {
                    imageContents.push({ inlineData: { data: modelBase64, mimeType: modelMimeType } });
                }

                const imageResult = await ai.models.generateContent({
                    model: "gemini-2.0-flash-exp-image-generation",
                    contents: imageContents,
                    config: {
                        responseModalities: ["TEXT", "IMAGE"],
                    },
                });

                const parts = imageResult.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                    if (part.inlineData) {
                        generatedImage = {
                            data: part.inlineData.data || "",
                            mimeType: part.inlineData.mimeType || "image/png",
                        };
                        console.log("✅ Image generated!");
                        break;
                    }
                }
            } catch (imgErr) {
                console.error("Image error:", imgErr instanceof Error ? imgErr.message.substring(0, 150) : "unknown");
            }
        }

        // ──────────────────────────────────────────────
        // Result
        // ──────────────────────────────────────────────
        console.log(`\n🎯 Result: text=✅ image=${!!generatedImage ? "✅" : "❌"} video=${!!generatedVideo ? "✅" : "❌"}\n`);

        return NextResponse.json({
            success: true,
            adCopy,
            generatedImage,
            generatedVideo,
        });
    } catch (error: unknown) {
        console.error("Ad generation error:", error);
        const errMsg = error instanceof Error ? error.message : "Ad generation failed";

        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
            return NextResponse.json(
                { error: "Rate limit hit. Please wait 30 seconds and try again." },
                { status: 429 }
            );
        }
        if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("permission")) {
            return NextResponse.json(
                { error: "API key is invalid or missing permissions." },
                { status: 401 }
            );
        }
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
