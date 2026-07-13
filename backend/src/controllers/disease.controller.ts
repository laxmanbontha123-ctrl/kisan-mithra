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

export const getDiseaseHistory = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const scans = await diseaseService.getDiseaseHistory();
    res.status(200).json({
      success: true,
      scans,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch disease scan history.';
    res.status(500).json({ success: false, message });
  }
};

export const deleteDiseaseHistoryRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      res.status(400).json({ success: false, message: 'Disease scan id is required.' });
      return;
    }

    const result = await diseaseService.deleteDiseaseHistoryRecord(id);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete disease scan history record.';
    const statusCode = message === 'Disease scan record not found.' ? 404 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export default { detectDisease, getDiseaseHistory, deleteDiseaseHistoryRecord };