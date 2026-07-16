import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { smsService } from './sms.service';

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RequestPhoneOtpInput {
  phone: string;
}

export interface VerifyPhoneOtpInput {
  phone: string;
  code: string;
}

export interface RequestEmailVerificationInput {
  email: string;
}

export interface VerifyEmailOtpInput {
  email: string;
  code: string;
}

export interface AuthService {
  register: (input: RegisterInput) => Promise<unknown>;
  login: (input: LoginInput) => Promise<unknown>;
  requestPhoneOtp: (input: RequestPhoneOtpInput) => Promise<unknown>;
  verifyPhoneOtp: (input: VerifyPhoneOtpInput) => Promise<unknown>;
  requestEmailVerification: (input: RequestEmailVerificationInput) => Promise<unknown>;
  verifyEmailOtp: (input: VerifyEmailOtpInput) => Promise<unknown>;
  getProfile: (userId: string) => Promise<unknown>;
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function minutesFromNow(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export class AuthServiceImpl implements AuthService {
  public async register(input: RegisterInput): Promise<unknown> {
    const existingUserByEmail = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUserByEmail) {
      throw new Error('Email already registered.');
    }

    const existingUserByPhone = await prisma.user.findUnique({ where: { phone: input.phone } });

    if (existingUserByPhone) {
      throw new Error('Phone already registered.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        password: hashedPassword,
        role: 'farmer',
        language: 'en',
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      success: true,
      message: 'Registration successful',
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

  public async login(input: LoginInput): Promise<unknown> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      success: true,
      message: 'Login successful',
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

  public async requestPhoneOtp(input: RequestPhoneOtpInput): Promise<unknown> {
    const user = await prisma.user.findUnique({ where: { phone: input.phone } });

    if (!user) {
      throw new Error('No account found with this phone number. Please register first.');
    }

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
    const otp = await prisma.authOtp.findFirst({
      where: {
        identifier: input.phone,
        type: 'phone_login',
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

    const isValid = await bcrypt.compare(input.code, otp.codeHash);

    if (!isValid) {
      await prisma.authOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new Error('Invalid OTP.');
    }

    const user = await prisma.user.update({
      where: { phone: input.phone },
      data: {
        phoneVerified: true,
        lastLoginAt: new Date(),
      },
    });

    await prisma.authOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      success: true,
      message: 'Phone OTP login successful',
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

  public async requestEmailVerification(input: RequestEmailVerificationInput): Promise<unknown> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email is already verified.',
        expiresInMinutes: 0,
      };
    }

    const code = generateOtp();
    const codeHash = await bcrypt.hash(code, 12);

    await prisma.authOtp.create({
      data: {
        identifier: input.email,
        type: 'email_verification',
        codeHash,
        expiresAt: minutesFromNow(10),
      },
    });

    return {
      success: true,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Verification OTP sent to your email address.'
          : 'Email verification OTP generated. Development OTP is shown only in local mode.',
      expiresInMinutes: 10,
      devOtp: process.env.NODE_ENV === 'production' ? undefined : code,
    };
  }

  public async verifyEmailOtp(input: VerifyEmailOtpInput): Promise<unknown> {
    const otp = await prisma.authOtp.findFirst({
      where: {
        identifier: input.email,
        type: 'email_verification',
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
      throw new Error('Email OTP expired or not found. Please request a new OTP.');
    }

    if (otp.attempts >= 5) {
      throw new Error('Too many wrong attempts. Please request a new OTP.');
    }

    const isValid = await bcrypt.compare(input.code, otp.codeHash);

    if (!isValid) {
      await prisma.authOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new Error('Invalid email OTP.');
    }

    const user = await prisma.user.update({
      where: { email: input.email },
      data: {
        emailVerified: true,
      },
    });

    await prisma.authOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      success: true,
      message: 'Email verification successful',
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
