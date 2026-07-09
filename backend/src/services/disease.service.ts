import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

export interface DiseaseDetectionResult {
  success: true;
  message: string;
  aiResponse: unknown;
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

type UploadedFile = Express.Multer.File;

const storage = multer.diskStorage({
  destination: (_req: Request, _file: UploadedFile, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: UploadedFile, cb: (error: Error | null, filename: string) => void) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${extension}`);
  },
});

export const createDiseaseUploadHandler = () => {
  const upload = multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (_req: Request, file: UploadedFile, cb: FileFilterCallback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new Error('Only JPG, JPEG, and PNG files are allowed.'));
        return;
      }

      cb(null, true);
    },
  });

  return upload.single('image');
};

export class DiseaseService {
  public async detectDisease(file: UploadedFile | undefined): Promise<DiseaseDetectionResult> {
    if (!file) {
      throw new Error('No image file uploaded.');
    }

    const aiServerUrl = (process.env.AI_SERVER_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
    const uploadedFilePath = file.path;

    try {
      const fileBuffer = await fsPromises.readFile(uploadedFilePath);
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.mimetype });

      formData.append('file', blob, file.originalname);

      const response = await fetch(`${aiServerUrl}/predict/plant-disease`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI server request failed: ${response.status} ${errorText}`);
      }

      const aiResponse = await response.json();

      return {
        success: true,
        message: 'Disease prediction completed',
        aiResponse,
      };
    } finally {
      await fsPromises.unlink(uploadedFilePath).catch(() => undefined);
    }
  }
}

export const diseaseService = new DiseaseService();
export default diseaseService;