import { Router } from 'express';
import { login, profile, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, profile);

export default router;
