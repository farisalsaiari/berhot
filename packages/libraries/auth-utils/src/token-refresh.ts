export interface RefreshTokenData {
  userId: string;
  sessionId: string;
  familyId: string;
  generation: number;
  expiresAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Implements refresh token rotation for security.
 * Each refresh token can only be used once; using an old token
 * invalidates the entire token family (detects theft).
 */
export function shouldInvalidateFamily(
  storedGeneration: number,
  presentedGeneration: number,
): boolean {
  return presentedGeneration < storedGeneration;
}
