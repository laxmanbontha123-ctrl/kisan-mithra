import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

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

export interface AuthService {
  register: (input: RegisterInput) => Promise<unknown>;
  login: (input: LoginInput) => Promise<unknown>;
  getProfile: (userId: string) => Promise<unknown>;
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
      },
    };
  }
}

export const authService = new AuthServiceImpl();
export default authService;
