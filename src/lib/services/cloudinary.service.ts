import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// ─── Config (lazy init so env vars are read at runtime) ──────

let configured = false;

function ensureConfigured(): void {
  if (configured) return;

  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    cloudinary.config({ secure: true });
    configured = true;
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_URL or " +
        "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

// ─── Types ───────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  videoUrl: string;
  thumbnailUrl: string;
  publicId: string;
  duration: number | null;
}

// ─── Public API ──────────────────────────────────────────────

export async function uploadVideo(
  videoBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  const folder = options.folder || "adwork/videos";

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder,
        public_id: options.publicId,
        format: "mp4",
        eager: [
          {
            format: "jpg",
            transformation: [
              { width: 1280, height: 720, crop: "fill", gravity: "auto" },
              { quality: "auto:good" },
            ],
          },
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`));
        else if (!result) reject(new Error("Cloudinary returned empty result"));
        else resolve(result);
      }
    );

    uploadStream.end(videoBuffer);
  });

  const thumbnailUrl =
    result.eager?.[0]?.secure_url || deriveThumbUrl(result.secure_url);

  return {
    videoUrl: result.secure_url,
    thumbnailUrl,
    publicId: result.public_id,
    duration: result.duration ?? null,
  };
}

export async function uploadThumbnail(
  imageBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<string> {
  ensureConfigured();

  const folder = options.folder || "adwork/thumbnails";

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: options.publicId,
        format: "jpg",
        transformation: [
          { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary thumbnail upload failed: ${error.message}`));
        else if (!result) reject(new Error("Cloudinary returned empty result"));
        else resolve(result);
      }
    );

    uploadStream.end(imageBuffer);
  });

  return result.secure_url;
}

export async function deleteMedia(
  publicId: string,
  resourceType: "video" | "image" = "video"
): Promise<void> {
  ensureConfigured();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}

export async function uploadImage(
  imageBuffer: Buffer,
  options: { folder?: string; publicId?: string } = {}
): Promise<{ imageUrl: string; publicId: string }> {
  ensureConfigured();

  const folder = options.folder || "adwork/images";

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: options.publicId,
        format: "jpg",
        transformation: [
          { width: 1280, height: 1280, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary image upload failed: ${error.message}`));
        else if (!result) reject(new Error("Cloudinary returned empty result"));
        else resolve(result);
      }
    );

    uploadStream.end(imageBuffer);
  });

  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
}

// ─── Internal ────────────────────────────────────────────────

function deriveThumbUrl(videoUrl: string): string {
  return videoUrl
    .replace("/video/upload/", "/video/upload/w_1280,h_720,c_fill,g_auto,q_auto/")
    .replace(/\.\w+$/, ".jpg");
}
