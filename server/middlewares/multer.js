import multer from 'multer';
import { storage } from './cloudinary.js'; // adjust path if needed

const upload = multer({ storage });

export default upload;
