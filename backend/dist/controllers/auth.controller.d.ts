import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const profile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
declare const _default: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    profile: (req: AuthenticatedRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=auth.controller.d.ts.map