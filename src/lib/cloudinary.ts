import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const api_key = process.env.CLOUDINARY_API_KEY?.trim();
  const api_secret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env",
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    api_timeout: 120000,
  });
  return cloudinary;
}

export function getCloudinary() {
  return configureCloudinary();
}

export async function uploadImage(buffer: Buffer, folder = "inventory") {
  const client = getCloudinary();

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId: string) {
  if (!publicId) return;
  const client = getCloudinary();
  await client.uploader.destroy(publicId);
}
