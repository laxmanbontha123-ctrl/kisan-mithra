"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Access token required.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid or expired token.' });
            return;
        }
        req.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
exports.authMiddleware = authMiddleware;
exports.default = exports.authMiddleware;
//# sourceMappingURL=auth.middleware.js.map