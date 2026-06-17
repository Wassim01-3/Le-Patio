const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload a File to Cloudinary using an unsigned upload preset.
 * No API secret required — safe to call directly from the browser.
 *
 * Setup steps:
 * 1. Go to https://cloudinary.com and create a free account.
 * 2. In Settings → Upload → Upload presets, create a new preset.
 * 3. Set "Signing mode" to "Unsigned".
 * 4. Name it "le_patio_unsigned" (or whatever you set in VITE_CLOUDINARY_UPLOAD_PRESET).
 * 5. Optionally set a folder (e.g. "le-patio/") so uploads are organized.
 */
export async function uploadToCloudinary(
  file: File,
  folder: "gallery" | "menu" | "events" = "gallery"
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || CLOUD_NAME === "your_cloud_name") {
    throw new Error(
      "Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `le-patio/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Cloudinary upload failed");
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}

/**
 * Delete an image from Cloudinary.
 * NOTE: Deletion requires signing (server-side API secret).
 * On the Spark plan equivalent for Cloudinary free tier, we simply
 * remove the Firestore document and leave the image (it won't be
 * served anymore). To enable actual deletion, a Cloud Function
 * or a small backend would be required.
 */
export function getCloudinaryUrl(publicId: string, width = 800): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
}
