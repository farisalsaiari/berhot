import { IsEmail, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

/* ──────────────────────────────────────────────────────────────────
   DTOs for the Email Service endpoints
   ────────────────────────────────────────────────────────────────── */

/**
 * POST /api/v1/email/send
 * Send a transactional email (verification, password reset, etc.)
 */
export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  template!: string; // template name (e.g. 'email-verification', 'password-reset')

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>; // template variables
}

/**
 * POST /api/v1/email/verify/send
 * Request email verification for a user
 */
export class SendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

/**
 * POST /api/v1/email/verify/confirm
 * Confirm email verification token
 */
export class ConfirmVerificationDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

/**
 * POST /api/v1/email/change
 * Request email address change
 */
export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  newEmail!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  tenantId?: string;
}

/**
 * POST /api/v1/email/resend
 * Resend a pending verification email
 */
export class ResendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;
}
