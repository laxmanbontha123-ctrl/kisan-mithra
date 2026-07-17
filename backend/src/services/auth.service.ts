import bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { signToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { smsService } from './sms.service';
import { emailService } from './email.service';
import { firebaseAdminAuth } from './firebase-admin.service';

export interface RequestPhoneOtpInput {
  phone: string;
}

export interface VerifyPhoneOtpInput {
  phone: string;
  code: string;
}

export interface RequestEmailOtpInput {
  email: string;
}

export interface VerifyEmailOtpInput {
  email: string;
  code: string;
}

export interface AuthService {
  requestPhoneOtp: (input: RequestPhoneOtpInput) => Promise<unknown>;
  verifyPhoneOtp: (input: VerifyPhoneOtpInput) => Promise<unknown>;
  requestEmailOtp: (input: RequestEmailOtpInput) => Promise<unknown>;
  verifyEmailOtp: (input: VerifyEmailOtpInput) => Promise<unknown>;
  loginWithFirebasePhone: (idToken: string) => Promise<unknown>;
  getProfile: (userId: string) => Promise<unknown>;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function buildAuthResponse(user: User, message: string) {
  const token = signToken({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });

  return {
    success: true,
    message,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      language: user.language,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
  };
}

async function assertValidOtp(identifier: string, type: string, code: string) {
  const otp = await prisma.authOtp.findFirst({
    where: {
      identifier,
      type,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otp) {
    throw new Error('OTP expired or not found. Please request a new OTP.');
  }

  if (otp.attempts >= 5) {
    throw new Error('Too many wrong attempts. Please request a new OTP.');
  }

  const isValid = await bcrypt.compare(code, otp.codeHash);

  if (!isValid) {
    await prisma.authOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    throw new Error('Invalid OTP.');
  }

  await prisma.authOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
}

export class AuthServiceImpl implements AuthService {
  public async requestPhoneOtp(input: RequestPhoneOtpInput): Promise<unknown> {
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 12);

    await prisma.authOtp.create({
      data: {
        identifier: input.phone,
        type: 'phone_login',
        codeHash,
        expiresAt: minutesFromNow(5),
      },
    });

    await smsService.sendOtp({
      phone: input.phone,
      otp: code,
    });

    const isSmsConfigured = Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID);

    return {
      success: true,
      message: isSmsConfigured
        ? 'OTP sent successfully to your mobile number.'
        : 'OTP generated successfully. SMS provider is not configured yet.',
      expiresInMinutes: 5,
      devOtp: process.env.NODE_ENV === 'production' ? undefined : code,
    };
  }

  public async verifyPhoneOtp(input: VerifyPhoneOtpInput): Promise<unknown> {
    await assertValidOtp(input.phone, 'phone_login', input.code);

    const existingUser = await prisma.user.findUnique({ where: { phone: input.phone } });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            phone: input.phone,
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        });

    return buildAuthResponse(user, existingUser ? 'Phone OTP login successful' : 'Account created and phone verified successfully');
  }

  public async requestEmailOtp(input: RequestEmailOtpInput): Promise<unknown> {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 12);

    await prisma.authOtp.create({
      data: {
        identifier: input.email,
        type: 'email_login',
        codeHash,
        expiresAt: minutesFromNow(10),
      },
    });

    await emailService.sendEmailVerificationOtp({
      to: input.email,
      otp: code,
      fullName: existingUser?.fullName,
    });

    const isEmailConfigured = emailService.isConfigured();

    return {
      success: true,
      message: isEmailConfigured
        ? 'OTP sent successfully to your email address.'
        : 'Email OTP generated. Email provider is not configured yet.',
      expiresInMinutes: 10,
      devOtp: process.env.NODE_ENV === 'production' ? undefined : code,
    };
  }

  public async verifyEmailOtp(input: VerifyEmailOtpInput): Promise<unknown> {
    await assertValidOtp(input.email, 'email_login', input.code);

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            email: input.email,
            emailVerified: true,
            lastLoginAt: new Date(),
          },
        });

    return buildAuthResponse(user, existingUser ? 'Email OTP login successful' : 'Account created and email verified successfully');
  }


  public async loginWithFirebasePhone(idToken: string): Promise<unknown> {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
    const firebasePhone = decodedToken.phone_number;

    if (!firebasePhone) {
      throw new Error('Firebase token does not contain a verified phone number.');
    }

    const digits = firebasePhone.replace(/\D/g, '');
    const phone = digits.length > 10 ? digits.slice(-10) : digits;

    if (phone.length < 10) {
      throw new Error('Invalid verified phone number received from Firebase.');
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        })
      : await prisma.user.create({
          data: {
            phone,
            phoneVerified: true,
            lastLoginAt: new Date(),
          },
        });

    return buildAuthResponse(user, existingUser ? 'Firebase phone login successful' : 'Account created with Firebase phone verification');
  }

  public async getProfile(userId: string): Promise<unknown> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found.');
    }

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.language,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLoginAt: user.lastLoginAt,
      },
    };
  }
}

export const authService = new AuthServiceImpl();
export default authService;
