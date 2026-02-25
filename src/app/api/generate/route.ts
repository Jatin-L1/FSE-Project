import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

// ────────────────────────────────────────────────────────
// Hugging Face Inference API (router.huggingface.co)
// ────────────────────────────────────────────────────────

async function hfTextGeneration(token: string, prompt: string): Promise<string> {
    // Use Qwen 2.5 72B via OpenAI-compatible chat endpoint
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "Qwen/Qwen2.5-72B-Instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a world-class advertising creative director. Always respond with ONLY valid JSON, no markdown code fences, no extra text."
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 600,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HF text error ${response.status}: ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

async function hfImageGeneration(token: string, prompt: string): Promise<Buffer> {
    // Use Stable Diffusion XL via HF inference
    const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    negative_prompt: "blurry, low quality, distorted text, watermark, ugly, deformed, amateur, clipart",
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                },
            }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HF image error ${response.status}: ${errText.substring(0, 200)}`);
    }

    // Returns raw image bytes
    return Buffer.from(await response.arrayBuffer());
}

// ────────────────────────────────────────────────────────
// Veo3 API (veo3api.com) — optional video generation
// ────────────────────────────────────────────────────────

async function veo3GenerateVideo(
    apiKey: string,
    prompt: string,
    aspectRatio: string
): Promise<{ data: string; mimeType: string } | null> {
    try {
        console.log("🎬 Starting Veo3 video generation...");

        const generateResponse = await fetch("https://veo3api.com/generate", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                model: "veo3-fast",
                aspect_ratio: aspectRatio === "9:16" ? "9:16" : "16:9",
            }),
        });

        if (!generateResponse.ok) {
            const errText = await generateResponse.text();
            console.log(`Veo3 generate error: ${generateResponse.status} - ${errText.substring(0, 100)}`);
            return null;
        }

        const generateData = await generateResponse.json();
        const taskId = generateData.task_id || generateData.id;
        if (!taskId) return null;

        console.log(`📋 Veo3 task: ${taskId}`);

        // Poll for completion (max 5 min)
        for (let i = 0; i < 60; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const feedResponse = await fetch(
                `https://veo3api.com/feed?task_id=${taskId}`,
                { headers: { "Authorization": `Bearer ${apiKey}` } }
            );
            if (!feedResponse.ok) continue;

            const feedData = await feedResponse.json();
            const status = (feedData.status || feedData.state || "").toLowerCase();
            console.log(`Poll ${i + 1}: ${status}`);

            if (status === "completed" || status === "success" || status === "done") {
                const videoUrl =
                    feedData.data?.response?.[0] ||
                    feedData.video_url ||
                    feedData.url ||
                    feedData.result?.url;

                if (videoUrl) {
                    console.log("⬇️ Downloading video...");
                    const videoResponse = await fetch(videoUrl);
                    if (videoResponse.ok) {
                        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
                        console.log(`✅ Video: ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);
                        return { data: videoBuffer.toString("base64"), mimeType: "video/mp4" };
                    }
                }
                break;
            }

            if (status === "failed" || status === "error") {
                console.log(`❌ Video failed: ${feedData.error || feedData.message || "unknown"}`);
                break;
            }
        }
    } catch (err) {
        console.log("Veo3 error:", err instanceof Error ? err.message.substring(0, 80) : "unknown");
    }
    return null;
}

// ────────────────────────────────────────────────────────
// Main POST handler
// ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        const hfToken = process.env.HF_API_TOKEN;
        const veo3Key = process.env.VEO3_API_KEY;

        if (!hfToken) {
            return NextResponse.json(
                { error: "Hugging Face API token not configured. Set HF_API_TOKEN in .env.local" },
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

        if (!brandName) {
            return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
        }
        if (!productPhoto) {
            return NextResponse.json({ error: "Product photo is required" }, { status: 400 });
        }

        // ──────────────────────────────────────────────
        // Step 1: Generate Ad Copy with Qwen 2.5 72B
        // ──────────────────────────────────────────────
        console.log("📝 Generating ad copy with Qwen 2.5 72B...");

        let adCopy;
        try {
            const adCopyPrompt = `Create a compelling advertisement for brand "${brandName}".
Ad style: ${adStyle}
Product: ${productDescription}
${modelPhoto ? "A model/person photo is also included." : ""}

Return this exact JSON structure:
{
  "headline": "Powerful headline related to the ${productDescription}, max 8 words",
  "subheadline": "Supporting context line, max 15 words",
  "cta": "Button text, max 4 words",
  "bodyText": "Ad body paragraph about the ${productDescription}, max 30 words",
  "colorScheme": "Two hex color codes for the ad",
  "mood": "Three mood words",
  "targetAudience": "Target audience phrase",
  "imagePrompt": "Describe a SPECIFIC AD SCENE for a ${productDescription}: an attractive model or person confidently HOLDING, WEARING, or USING the ${productDescription}. Describe the model's pose, outfit, expression, the setting/background, lighting, and camera angle. This must look like a professional magazine or Instagram ad featuring a real model with the ${productDescription}. Max 80 words. Do NOT include any text or words in the image.",
  "videoDescription": "Cinematic video ad description for ${productDescription}: camera movement, lighting, mood, transitions. Max 50 words."
}`;

            const rawText = await hfTextGeneration(hfToken, adCopyPrompt);
            console.log("Raw LLM response:", rawText.substring(0, 200));

            // Extract JSON from response
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                adCopy = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON in response");
            }
            console.log("✅ Ad copy generated!");
        } catch (copyError) {
            console.error("Ad copy fallback:", copyError instanceof Error ? copyError.message.substring(0, 100) : "unknown");
            adCopy = {
                headline: `${brandName} — Redefine Excellence`,
                subheadline: "Where premium quality meets modern innovation",
                cta: "Shop Now",
                bodyText: "Discover the perfect blend of elegance and innovation. Crafted for those who demand nothing but the best.",
                colorScheme: "#7C3AED, #6366F1",
                mood: "Premium, Bold, Modern",
                targetAudience: "Style-conscious professionals",
                productDescription: `${productDescription}`,
                imagePrompt: `An attractive model confidently holding and showcasing ${productDescription} by ${brandName}, professional studio lighting, ${adStyle} aesthetic, magazine ad campaign, elegant pose`,
                videoDescription: `Cinematic close-up of ${brandName} product rotating with dramatic lighting, slow motion, premium feel.`,
            };
        }

        // ──────────────────────────────────────────────
        // Step 2: Generate Ad Image with SDXL
        // ──────────────────────────────────────────────
        console.log("🎨 Generating ad image with Stable Diffusion XL...");

        let generatedImage: { data: string; mimeType: string } | null = null;
        try {
            const scenePrompt = adCopy.imagePrompt ||
                `An attractive model confidently showcasing ${productDescription}, professional studio lighting, ${adStyle} aesthetic`;

            const fullPrompt = `${scenePrompt}, the model is holding and promoting ${productDescription} by ${brandName}, professional advertisement photography, magazine ad campaign, ${adStyle} aesthetic, commercial quality, sharp focus, professional lighting, bokeh background, high fashion, 8k, no text, no words, no letters, no watermark`;

            const imageBuffer = await hfImageGeneration(hfToken, fullPrompt);
            generatedImage = {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            };
            console.log(`✅ Image generated! ${(imageBuffer.length / 1024).toFixed(0)}KB`);
        } catch (imgErr) {
            console.error("Image error:", imgErr instanceof Error ? imgErr.message.substring(0, 100) : "unknown");
        }

        // ──────────────────────────────────────────────
        // Step 3: Generate Video with Veo3 (optional)
        // ──────────────────────────────────────────────
        let generatedVideo: { data: string; mimeType: string } | null = null;

        if (veo3Key) {
            const videoPrompt = `Professional ${adStyle} video ad for "${brandName}". ${adCopy.videoDescription}. Cinematic quality, smooth transitions.`;
            generatedVideo = await veo3GenerateVideo(veo3Key, videoPrompt, aspectRatio);
        }

        // ──────────────────────────────────────────────
        // Return
        // ──────────────────────────────────────────────
        console.log(`\n🎯 Result: text=✅ image=${generatedImage ? "✅" : "❌"} video=${generatedVideo ? "✅" : "❌"}\n`);

        return NextResponse.json({
            success: true,
            adCopy,
            generatedImage,
            generatedVideo,
        });
    } catch (error: unknown) {
        console.error("Ad generation error:", error);
        const errMsg = error instanceof Error ? error.message : "Ad generation failed";

        if (errMsg.includes("429") || errMsg.includes("rate") || errMsg.includes("503")) {
            return NextResponse.json(
                { error: "AI models are warming up. Please wait 20 seconds and try again." },
                { status: 429 }
            );
        }
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
