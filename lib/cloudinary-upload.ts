import { uploadsApi, ApiRequestError } from "./api-client";

/**
 * Uploads a single image file directly to Cloudinary using a signature
 * obtained from our backend (POST /api/uploads/sign). The file goes
 * straight from the browser to Cloudinary — it never passes through our
 * Express server, and our API secret never leaves the backend.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const sign = await uploadsApi.sign();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new ApiRequestError(json.error?.message ?? "Image upload failed", res.status);
  }

  return json.secure_url as string;
}

/** Uploads multiple files in parallel, returning their secure URLs in the same order. */
export async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImageToCloudinary));
}