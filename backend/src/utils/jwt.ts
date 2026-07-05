import jwt, { type JwtPayload } from 'jsonwebtoken';

export interface JwtUserPayload {
  id: string;
  email: string;
  role: string;
}

const DEFAULT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export const signToken = (payload: JwtUserPayload, secret: string = DEFAULT_SECRET): string => {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string, secret: string = DEFAULT_SECRET): JwtUserPayload => {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token payload.');
  }

  const payload = decoded as JwtPayload & JwtUserPayload;

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
};

export default { signToken, verifyToken };
