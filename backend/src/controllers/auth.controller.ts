import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizePhone = (phone: string): string => phone.replace(/\D/g, '');

export const requestEmailOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body ?? {};

  if (!isNonEmptyString(email)) {
    res.status(400).json({ success: false, message: 'email is required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    return;
  }

  try {
    const result = await authService.requestEmailOtp({ email: normalizedEmail });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send email OTP.';
    res.status(500).json({ success: false, message });
  }
};

export const verifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, code } = req.body ?? {};

  if (!isNonEmptyString(email) || !isNonEmptyString(code)) {
    res.status(400).json({ success: false, message: 'email and code are required.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.replace(/\D/g, '');

  if (!isValidEmail(normalizedEmail) || normalizedCode.length !== 6) {
    res.status(400).json({ success: false, message: 'Valid email and 6-digit OTP are required.' });
    return;
  }

  try {
    const result = await authService.verifyEmailOtp({
      email: normalizedEmail,
      code: normalizedCode,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email OTP verification failed.';
    const statusCode = message.includes('Invalid') || message.includes('expired') || message.includes('Too many') ? 401 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};

export const requestPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body ?? {};

  if (!isNonEmptyString(phone)) {
    res.status(400).json({ success: false, message: 'phone is required.' });
    return;
  }

  const normalizedPhone = normalizePhone(phone);

  if (normalizedPhone.length < 10) {
    res.status(400).json({ success: false, message: 'Phone number must contain at least 10 digits.' });
    return;
  }

  try {
    const result = await authService.requestPhoneOtp({ phone: normalizedPhone });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send phone OTP.';
    res.status(500).json({ success: false, message });
  }
};

export const verifyPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  const { phone, code } = req.body ?? {};

  if (!isNonEmptyString(phone) || !isNonEmptyString(code)) {
    res.status(400).json({ success: false, message: 'phone and code are required.' });
    return;
  }

  const normalizedPhone = normalizePhone(phone);
  const normalizedCode = code.replace(/\D/g, '');

  if (normalizedPhone.length < 10 || normalizedCode.length !== 6) {
    res.status(400).json({ success: false, message: 'Valid phone and 6-digit OTP are required.' });
    return;
  }

  try {
    const result = await authService.verifyPhoneOtp({
      phone: normalizedPhone,
      code: normalizedCode,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OTP verification failed.';
    const statusCode = message.includes('Invalid') || message.includes('expired') || message.includes('Too many') ? 401 : 500;
    res.status(statusCode).json({ success: false, message });
  }
};


export const loginWithFirebasePhone = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body ?? {};

  if (!isNonEmptyString(idToken)) {
    res.status(400).json({ success: false, message: 'Firebase idToken is required.' });
    return;
  }

  try {
    const result = await authService.loginWithFirebasePhone(idToken);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Firebase phone login failed.';
    res.status(401).json({ success: false, message });
  }
};

export const profile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return;
  }

  try {
    const result = await authService.getProfile(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load profile.';
    res.status(404).json({ success: false, message });
  }
};

export default { requestEmailOtp, verifyEmailOtp, requestPhoneOtp, verifyPhoneOtp, loginWithFirebasePhone, profile };
