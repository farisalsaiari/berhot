import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => ({
  // ── SMTP Transport ────────────────────────────────────────────
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  },

  // ── Sender defaults ──────────────────────────────────────────
  from: {
    name: process.env.SMTP_FROM_NAME || 'Berhot',
    email: process.env.SMTP_FROM_EMAIL || 'noreply@berhot.dev',
  },

  // ── Rate limiting ────────────────────────────────────────────
  rateLimit: {
    perMinute: parseInt(process.env.EMAIL_RATE_LIMIT_PER_MINUTE || '10', 10),
    perHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR || '100', 10),
  },

  // ── Verification ─────────────────────────────────────────────
  verification: {
    tokenExpiryHours: parseInt(process.env.VERIFICATION_TOKEN_EXPIRY_HOURS || '24', 10),
    baseUrl: process.env.VERIFICATION_BASE_URL || 'http://localhost:3000',
  },
}));
