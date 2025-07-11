import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = file.fieldname === 'cv' ? 'employee-cvs' : 'employee-images';
    return {
      folder,
      resource_type: file.fieldname === 'cv' ? 'raw' : 'image',
      public_id: Date.now() + '-' + file.originalname,
    };
  },
});

export { cloudinary, storage };
