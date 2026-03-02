import { z } from "zod/v4";

// ─── Schemas ─────────────────────────────────────────────────

export const generateAdSchema = z.object({
  prompt: z
    .string({ error: "Product description is required" })
    .min(3, "Description too short")
    .max(500, "Description must be 500 characters or less"),

  brandName: z
    .string()
    .max(100, "Brand name too long")
    .optional()
    .default(""),

  duration: z
    .number({ error: "Duration is required" })
    .min(4, "Duration must be between 4 and 12 seconds")
    .max(12, "Duration must be between 4 and 12 seconds"),

  style: z.enum(
    ["cinematic", "minimal", "bold", "corporate", "playful", "luxury"],
    { error: "Invalid style. Must be one of: cinematic, minimal, bold, corporate, playful, luxury" }
  ),

  aspectRatio: z.enum(
    ["9:16", "16:9"],
    { error: "Invalid format. Must be 9:16 or 16:9" }
  ).default("16:9"),
});

export type GenerateAdInput = z.infer<typeof generateAdSchema>;

export function extractZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message || "Validation failed";
}
