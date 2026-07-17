import { Router } from 'express';
import { loginWithFirebasePhone, profile, requestEmailOtp, requestPhoneOtp, verifyEmailOtp, verifyPhoneOtp } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/email/request-otp', requestEmailOtp);
router.post('/email/request-verification', requestEmailOtp);
router.post('/email/verify-otp', verifyEmailOtp);
router.post('/phone/request-otp', requestPhoneOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.post('/firebase/phone-login', loginWithFirebasePhone);
router.get('/profile', authMiddleware, profile);

export default router;
