import { Router } from 'express';
import { createCrop, deleteCrop, getCrop, listCrops, updateCrop } from '../controllers/crop.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createCrop);
router.get('/', listCrops);
router.get('/:id', getCrop);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

export default router;
