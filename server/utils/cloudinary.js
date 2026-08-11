import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

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

  if (!configured) {
    throw new Error(
      "L'upload d'images n'est pas configuré. Renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET, ou déposez les photos dans client/public/products/."
    );
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'evora-home',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
        // Photos come straight off a phone at 4000px. Cap the stored size and
        // let Cloudinary pick the format, which is the single biggest win for
        // customers on mobile data.
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto:good' }],
      },
      (error, uploaded) => (error ? reject(error) : resolve(uploaded))
    );
    stream.end(file.buffer);
  });

  return { url: result.secure_url, alt: '', ordre: 0 };
}

export async function deleteFromCloudinary(publicId) {
  if (!configured || !publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

export const isCloudinaryConfigured = () => configured;
