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
export declare class AuthServiceImpl implements AuthService {
    register(input: RegisterInput): Promise<unknown>;
    login(input: LoginInput): Promise<unknown>;
    getProfile(userId: string): Promise<unknown>;
}
export declare const authService: AuthServiceImpl;
export default authService;
//# sourceMappingURL=auth.service.d.ts.map