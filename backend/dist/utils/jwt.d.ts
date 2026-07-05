export interface JwtUserPayload {
    id: string;
    email: string;
    role: string;
}
export declare const signToken: (payload: JwtUserPayload, secret?: string) => string;
export declare const verifyToken: (token: string, secret?: string) => JwtUserPayload;
declare const _default: {
    signToken: (payload: JwtUserPayload, secret?: string) => string;
    verifyToken: (token: string, secret?: string) => JwtUserPayload;
};
export default _default;
//# sourceMappingURL=jwt.d.ts.map