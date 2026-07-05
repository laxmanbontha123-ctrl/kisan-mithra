import type { NextFunction, Request, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export default authMiddleware;
//# sourceMappingURL=auth.middleware.d.ts.map