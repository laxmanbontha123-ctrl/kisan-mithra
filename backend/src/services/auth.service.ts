import bcrypt from 'bcrypt';
import { signToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export interface RegisterInput {
  fullName: string;
  email: string;
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
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        password: hashedPassword,
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return {
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
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
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
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
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}

export const authService = new AuthServiceImpl();
export default authService;
