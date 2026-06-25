import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { env } from './env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

// Log configuration status (safely)
const mask = (str: string) => str ? `${str.substring(0, 3)}...${str.substring(str.length - 3)}` : 'MISSING';
console.log('--- Cloudinary Config ---');
console.log('Cloud Name:', env.CLOUDINARY_CLOUD_NAME || 'MISSING');
console.log('API Key:', mask(env.CLOUDINARY_API_KEY));
console.log('API Secret:', mask(env.CLOUDINARY_API_SECRET));
console.log('-------------------------');

if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.error('CRITICAL: Cloudinary environment variables are missing!');
}

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      const category = req.params?.category || 'misc';
      
      // Extract filename without extension
      const originalName = file.originalname || 'file';
      const fileNameWithoutExt = originalName.includes('.') 
        ? originalName.split('.').slice(0, -1).join('.') 
        : originalName;
      
      // Sanitize and limit length
      const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
      const publicId = `${Date.now()}-${sanitizedName}`;
      
      return {
        folder: `ibtwebsite/${category}`,
        resource_type: 'auto', // Important for allowing non-image files if needed
        public_id: publicId,
        transformation: [
          { width: 1920, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ],
      } as any;
    } catch (error) {
      console.error('Error in Cloudinary storage params:', error);
      return {
        folder: 'ibtwebsite/misc',
        resource_type: 'auto',
      } as any;
    }
  },
});

export default cloudinary;
