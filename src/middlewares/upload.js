import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinaryConfig.js';

// Configura el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'Ecommerce', // Nombre de la carpeta en Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'],
  },
});

// Configura multer con el almacenamiento en Cloudinary
const upload = multer({ storage });

export const uploadImages = upload.array('images', 10);

export default upload;
