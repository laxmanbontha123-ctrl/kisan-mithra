"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthServiceImpl = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
class AuthServiceImpl {
    async register(input) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(input.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                fullName: input.fullName,
                email: input.email,
                password: hashedPassword,
            },
        });
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
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
    async login(input) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isPasswordValid = await bcrypt_1.default.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
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
    async getProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
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
exports.AuthServiceImpl = AuthServiceImpl;
exports.authService = new AuthServiceImpl();
exports.default = exports.authService;
//# sourceMappingURL=auth.service.js.map