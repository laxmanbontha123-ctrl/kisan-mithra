import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { diseaseService } from '../services/disease.service';
import type { Express } from 'express';

interface DetectDiseaseRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

export const detectDisease = async (req: DetectDiseaseRequest, res: Response): Promise<void> => {
  try {
    const result = await diseaseService.detectDisease(req.file);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Disease prediction failed.';
    const statusCode = message === 'No image file uploaded.' || message === 'Only JPG, JPEG, and PNG files are allowed.' || message === 'File size cannot exceed 10 MB.' ? 400 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export default { detectDisease };