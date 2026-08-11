import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

dotenv.config();

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadDir = path.join(__dirname, '..', 'public', 'products');

async function saveLocalImage(file) {
  await fs.mkdir(localUploadDir, { recursive: true });
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  const filePath = path.join(localUploadDir, filename);
  await fs.writeFile(filePath, file.buffer);
  return { url: `/products/${filename}`, alt: '', ordre: 0 };
}

/**
 * Uploads one image and returns `{ url, alt, ordre }`, ready to push into a
 * product's images array.
 *
 * Cloudinary is optional. The client can run entirely on files dropped into
 * `client/public/products/`, so an unconfigured deployment fails loudly here
 * rather than silently storing empty image URLs.
 */
export async function uploadToCloudinary(file) {
  if (!file) return null;

  if (configured) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'evora-home',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
          transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto:good' }],
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded))
      );
      stream.end(file.buffer);
    });

    return { url: result.secure_url, alt: '', ordre: 0 };
  }

  return await saveLocalImage(file);
}

export async function deleteFromCloudinary(publicId) {
  if (!configured || !publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export const isCloudinaryConfigured = () => configured;
