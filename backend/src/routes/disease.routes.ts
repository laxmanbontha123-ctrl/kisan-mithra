import { Router } from 'express';
import { deleteDiseaseHistoryRecord, detectDisease, getDiseaseHistory } from '../controllers/disease.controller';
import { createDiseaseUploadHandler } from '../services/disease.service';

const router = Router();
const upload = createDiseaseUploadHandler();

router.post('/detect', (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'File size cannot exceed 10 MB.' : error.message;
      res.status(400).json({ success: false, message });
      return;
    }

    next();
  });
}, detectDisease);

router.get('/history', getDiseaseHistory);
router.delete('/history/:id', deleteDiseaseHistoryRecord);

export default router;