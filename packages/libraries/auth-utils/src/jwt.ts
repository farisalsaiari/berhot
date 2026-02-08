import jwt from 'jsonwebtoken';
import { type JwtPayload } from '@berhot/backend-common';

export interface JwtConfig {
  secret: string;
  accessTokenTtl: number;  // seconds
  refreshTokenTtl: number; // seconds
  issuer?: string;
}

export function signAccessToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  config: JwtConfig,
): string {
  return jwt.sign(payload, config.secret, {
    expiresIn: config.accessTokenTtl,
    issuer: config.issuer || 'berhot-platform',
    subject: payload.sub,
  });
}

export function signRefreshToken(userId: string, sessionId: string, config: JwtConfig): string {
  return jwt.sign(
    { sub: userId, sessionId, type: 'refresh' },
    config.secret,
    { expiresIn: config.refreshTokenTtl, issuer: config.issuer || 'berhot-platform' },
  );
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  return decoded as JwtPayload | null;
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
}
