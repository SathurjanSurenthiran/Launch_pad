import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (fileBuffer, folder) => {
  if (env.CLOUDINARY_API_KEY === "placeholder_cloudinary_api_key" || !env.CLOUDINARY_API_KEY) {
    // Development mockup: return image as a base64 Data URI
    let mimeType = "image/jpeg";
    const headerHex = fileBuffer.slice(0, 4).toString("hex");
    if (headerHex === "89504e47") {
      mimeType = "image/png";
    } else if (headerHex === "52494646") {
      mimeType = "image/webp";
    }
    const base64Str = fileBuffer.toString("base64");
    return Promise.resolve(`data:${mimeType};base64,${base64Str}`);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The Cloudinary public ID
 * @returns {Promise<Object>} The Cloudinary deletion result
 */
export const deleteImage = async (publicId) => {
  if (env.CLOUDINARY_API_KEY === "placeholder_cloudinary_api_key" || !env.CLOUDINARY_API_KEY) {
    return { result: "ok" };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
};

/**
 * Extracts the Cloudinary public ID from a secure URL.
 * @param {string} url - The Cloudinary image URL
 * @returns {string|null} The public ID or null
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  
  let path = parts[1];
  const firstSlashIndex = path.indexOf("/");
  if (firstSlashIndex !== -1) {
    const firstSegment = path.substring(0, firstSlashIndex);
    // Remove the version tag (e.g., v12345678) if it exists
    if (/^v\d+$/.test(firstSegment)) {
      path = path.substring(firstSlashIndex + 1);
    }
  }
  
  // Strip the file extension (e.g. .jpg, .png)
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex !== -1) {
    path = path.substring(0, dotIndex);
  }
  
  return path;
};

export default {
  uploadImage,
  deleteImage,
  extractPublicId,
};
