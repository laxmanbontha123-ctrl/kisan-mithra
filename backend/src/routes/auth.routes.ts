import { Router } from 'express';
import { login, profile, register, requestEmailVerification, requestPhoneOtp, verifyEmailOtp, verifyPhoneOtp } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/email/request-verification', requestEmailVerification);
router.post('/email/verify-otp', verifyEmailOtp);
router.post('/phone/request-otp', requestPhoneOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.get('/profile', authMiddleware, profile);

export default router;
