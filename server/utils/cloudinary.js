import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, resourceType = 'image') => {
  try {
    if (!file) {
      return null;
    }
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'Mobumes-website',
          resource_type: resourceType,
          allowed_formats: resourceType === 'video' ? ['mp4'] : ['jpg', 'png', 'jpeg', 'gif', 'svg', 'webp'],
          public_id: `${resourceType}_${Date.now()}`,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload_stream error:', error);
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    return uploadResult.secure_url;
  } catch (error) {
    console.error(`Cloudinary ${resourceType} upload error:`, error);
    throw new Error(`Failed to upload ${resourceType} to Cloudinary: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error(`Cloudinary ${resourceType} delete error:`, error);
    throw new Error(`Failed to delete ${resourceType} from Cloudinary: ${error.message}`);
  }
};