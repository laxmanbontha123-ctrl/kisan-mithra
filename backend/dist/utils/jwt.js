"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DEFAULT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const signToken = (payload, secret = DEFAULT_SECRET) => {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
};
exports.signToken = signToken;
const verifyToken = (token, secret = DEFAULT_SECRET) => {
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
        throw new Error('Invalid token payload.');
    }
    const payload = decoded;
    return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
    };
};
exports.verifyToken = verifyToken;
exports.default = { signToken: exports.signToken, verifyToken: exports.verifyToken };
//# sourceMappingURL=jwt.js.map