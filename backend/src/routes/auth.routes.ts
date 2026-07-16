import { Router } from 'express';
import { login, profile, register, requestPhoneOtp, verifyPhoneOtp } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/phone/request-otp', requestPhoneOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.get('/profile', authMiddleware, profile);

export default router;
