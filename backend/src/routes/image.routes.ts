import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadImage } from '../controllers/image.controller';
import { createUploadHandler } from '../services/image.service';

const router = Router();
const upload = createUploadHandler();

router.post('/upload', authMiddleware, (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'File size cannot exceed 10 MB.' : error.message;
      res.status(400).json({ success: false, message });
      return;
    }

    next();
  });
}, uploadImage);

export default router;
