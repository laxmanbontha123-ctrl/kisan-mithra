import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  filename: string;
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadImageResult {
  success: boolean;
  imageUrl: string;
}

const storage = {
  destination: (_req: Request, _file: UploadedFile, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req: Request, file: UploadedFile, cb: (error: Error | null, filename: string) => void) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${extension}`;
    cb(null, uniqueName);
  },
};

export const createUploadHandler = () => {
  const upload = multer({
    storage: multer.diskStorage(storage),
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

export class ImageService {
  public async uploadImage(file: UploadedFile | undefined): Promise<UploadImageResult> {
    if (!file) {
      throw new Error('No image file uploaded.');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new Error('Only JPG, JPEG, and PNG files are allowed.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size cannot exceed 10 MB.');
    }

    const imageUrl = `/uploads/${file.filename}`;

    return {
      success: true,
      imageUrl,
    };
  }
}

export const imageService = new ImageService();
export default imageService;
