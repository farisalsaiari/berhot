import * as crypto from 'crypto';

export interface ApiKeyInfo {
  tenantId: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: Date;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function generateApiKey(prefix = 'bht'): { key: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  const key = `${prefix}_${raw}`;
  const hash = hashApiKey(key);
  return { key, hash };
}

export function isValidApiKeyFormat(key: string): boolean {
  return /^bht_[A-Za-z0-9_-]{43}$/.test(key);
}
