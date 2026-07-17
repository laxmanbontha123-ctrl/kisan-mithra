import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token required.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired token.' });
      return;
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export default authMiddleware;
