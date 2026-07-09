import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { imageService } from '../services/image.service';
import type { Express } from 'express';

interface UploadRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

export const uploadImage = async (req: UploadRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  const file = req.file;

  try {
    const result = await imageService.uploadImage(file);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed.';
    const statusCode = message === 'Only JPG, JPEG, and PNG files are allowed.' || message === 'File size cannot exceed 10 MB.' || message === 'No image file uploaded.' ? 400 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export default { uploadImage };
