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
    const isCV = file.fieldname === 'cv';
    
    return {
      folder,
      resource_type: isCV ? 'raw' : 'image',
      public_id: Date.now() + '-' + file.originalname,
      // Make CV files publicly accessible
      ...(isCV && {
        access_mode: 'public',
        type: 'upload'
      }),
    };
  },
});

export { cloudinary, storage };