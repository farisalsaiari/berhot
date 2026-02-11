import { Injectable, Logger, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

import type { SendEmailDto, SendVerificationDto, ConfirmVerificationDto, ChangeEmailDto, ResendVerificationDto } from './dto/send-email.dto';
import { TemplateService } from './template.service';

/* ──────────────────────────────────────────────────────────────────
   Email Service — handles all email operations
   - Send transactional emails via SMTP / MailHog
   - Email verification flow (send token, confirm token)
   - Email change flow (validate, send verification, update)
   ────────────────────────────────────────────────────────────────── */

interface VerificationRecord {
  token: string;
  email: string;
  userId: string;
  tenantId?: string;
  type: 'verification' | 'email_change';
  oldEmail?: string; // for email changes
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private fromName: string;
  private fromEmail: string;
  private verificationBaseUrl: string;
  private frontendUrl: string;
  private identityAccessUrl: string;
  private tokenExpiryHours: number;

  // In-memory store for dev — replace with DB table in production
  // TODO: Migrate to PostgreSQL table `email_verifications`
  private verifications: Map<string, VerificationRecord> = new Map();
  private emailIndex: Map<string, string> = new Map(); // userId:type → token
  // Track verified (registered) emails — in prod this would be a DB query
  private registeredEmails: Set<string> = new Set();

  constructor(
    private config: ConfigService,
    private templateService: TemplateService,
  ) {
    const smtpConfig = this.config.get('email.smtp');
    this.fromName = this.config.get('email.from.name', 'Berhot');
    this.fromEmail = this.config.get('email.from.email', 'noreply@berhot.dev');
    this.verificationBaseUrl = this.config.get('email.verification.baseUrl', 'http://localhost:3000');
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    this.identityAccessUrl = process.env.IDENTITY_ACCESS_URL || 'http://localhost:8080';
    this.tokenExpiryHours = this.config.get('email.verification.tokenExpiryHours', 24);

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      ...(smtpConfig.auth ? { auth: smtpConfig.auth } : {}),
    });

    this.logger.log(`SMTP transport configured → ${smtpConfig.host}:${smtpConfig.port}`);
  }

  /* ══════════════════════════════════════════════════════════════
     1. SEND EMAIL — generic transactional email sender
     ══════════════════════════════════════════════════════════════ */
  async send(dto: SendEmailDto): Promise<{ messageId: string }> {
    const html = this.templateService.render(dto.template, dto.data || {});

    const from = `"${this.fromName}" <${this.fromEmail}>`;
    this.logger.log(`📧 Sending email → to=${dto.to} | from=${from} | subject=${dto.subject} | template=${dto.template}`);

    try {
      const info = await this.transporter.sendMail({
        from,
        to: dto.to,
        subject: dto.subject,
        html,
      });

      this.logger.log(`✅ Email sent successfully → to=${dto.to} | msgId=${info.messageId} | response=${info.response}`);
      this.logger.log(`   Accepted: ${JSON.stringify(info.accepted)} | Rejected: ${JSON.stringify(info.rejected)}`);
      return { messageId: info.messageId };
    } catch (error) {
      this.logger.error(`❌ Email send FAILED → to=${dto.to} | error=${(error as Error).message}`);
      throw error;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     2. SEND VERIFICATION — create token + send verification email
     ══════════════════════════════════════════════════════════════ */
  async sendVerification(dto: SendVerificationDto): Promise<{ message: string }> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryHours * 60 * 60 * 1000);

    const record: VerificationRecord = {
      token,
      email: dto.email,
      userId: dto.userId,
      tenantId: dto.tenantId,
      type: 'verification',
      expiresAt,
      createdAt: new Date(),
    };

    // Store verification
    this.verifications.set(token, record);
    this.emailIndex.set(`${dto.userId}:verification`, token);

    // Send email
    const verifyUrl = `${this.verificationBaseUrl}/api/v1/email/verify-email?token=${token}&return_to=%2Fen%2Fdashboard%2Faccount`;
    const changePasswordUrl = `${this.verificationBaseUrl}/account/security`;
    await this.send({
      to: dto.email,
      subject: 'Verify your email address — Berhot',
      template: 'email-verification',
      data: { verifyUrl, email: dto.email, expiryHours: this.tokenExpiryHours, changePasswordUrl },
    });

    this.logger.log(`Verification email sent → ${dto.email} | userId=${dto.userId}`);
    return { message: 'Verification email sent' };
  }

  /* ══════════════════════════════════════════════════════════════
     3. CONFIRM VERIFICATION — validate token + mark email verified
     ══════════════════════════════════════════════════════════════ */
  async confirmVerification(dto: ConfirmVerificationDto): Promise<{ email: string; type: string }> {
    const record = this.verifications.get(dto.token);

    if (!record) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (record.expiresAt < new Date()) {
      this.verifications.delete(dto.token);
      throw new BadRequestException('Verification token has expired');
    }

    // Clean up
    this.verifications.delete(dto.token);
    this.emailIndex.delete(`${record.userId}:${record.type}`);

    // Track this email as registered/verified
    this.registeredEmails.add(record.email.toLowerCase());

    this.logger.log(`Email verified → ${record.email} | type=${record.type} | userId=${record.userId}`);

    // Update the user's email in identity-access DB
    if (record.type === 'email_change' || record.type === 'verification') {
      try {
        const res = await fetch(`${this.identityAccessUrl}/internal/users/${record.userId}/email`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: record.email }),
        });
        if (res.ok) {
          this.logger.log(`✅ Updated email in identity-access DB → userId=${record.userId} | email=${record.email}`);
        } else {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          this.logger.warn(`⚠️ Failed to update email in identity-access → status=${res.status} | error=${errData.error || 'unknown'}`);
        }
      } catch (error) {
        this.logger.warn(`⚠️ Could not reach identity-access service → ${(error as Error).message}`);
      }
    }

    return { email: record.email, type: record.type };
  }

  /* ══════════════════════════════════════════════════════════════
     4. CHANGE EMAIL — validate + send verification to new email
     ══════════════════════════════════════════════════════════════ */
  async changeEmail(dto: ChangeEmailDto): Promise<{ message: string }> {
    const normalizedEmail = dto.newEmail.toLowerCase();

    // Check against identity-access DB if email is already taken
    try {
      const checkRes = await fetch(
        `${this.identityAccessUrl}/internal/check-email?email=${encodeURIComponent(normalizedEmail)}&exclude_user_id=${encodeURIComponent(dto.userId)}`,
      );
      if (checkRes.ok) {
        const checkData = (await checkRes.json()) as { taken?: boolean };
        if (checkData.taken) {
          throw new ConflictException('This email is already associated with another account.');
        }
      }
    } catch (error) {
      // Re-throw ConflictException, only catch network errors
      if (error instanceof ConflictException) throw error;
      this.logger.warn(`⚠️ Could not reach identity-access for email check → ${(error as Error).message}`);
    }

    // Also check in-memory registered emails (fallback)
    if (this.registeredEmails.has(normalizedEmail)) {
      throw new ConflictException('This email is already associated with another account.');
    }

    // Check pending email change verifications for the same email
    for (const [, record] of this.verifications) {
      if (record.email.toLowerCase() === normalizedEmail && record.userId !== dto.userId) {
        throw new ConflictException('This email is already associated with another account.');
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryHours * 60 * 60 * 1000);

    // Invalidate any previous email change request for this user
    const prevToken = this.emailIndex.get(`${dto.userId}:email_change`);
    if (prevToken) {
      this.verifications.delete(prevToken);
    }

    const record: VerificationRecord = {
      token,
      email: dto.newEmail,
      userId: dto.userId,
      tenantId: dto.tenantId,
      type: 'email_change',
      expiresAt,
      createdAt: new Date(),
    };

    this.verifications.set(token, record);
    this.emailIndex.set(`${dto.userId}:email_change`, token);

    // Send verification to new email
    const verifyUrl = `${this.verificationBaseUrl}/api/v1/email/verify-email?token=${token}&return_to=%2Fen%2Fdashboard%2Faccount`;
    const changePasswordUrl = `${this.verificationBaseUrl}/account/security`;
    await this.send({
      to: dto.newEmail,
      subject: 'Confirm your new email address — Berhot',
      template: 'email-change',
      data: { verifyUrl, newEmail: dto.newEmail, expiryHours: this.tokenExpiryHours, changePasswordUrl },
    });

    this.logger.log(`Email change verification sent → ${dto.newEmail} | userId=${dto.userId}`);
    return { message: 'Verification email sent to new address' };
  }

  /* ══════════════════════════════════════════════════════════════
     5. RESEND VERIFICATION — re-send a pending verification email
     ══════════════════════════════════════════════════════════════ */
  async resendVerification(dto: ResendVerificationDto): Promise<{ message: string }> {
    // Find the latest pending verification for this user
    let existingRecord: VerificationRecord | undefined;
    let existingToken: string | undefined;

    for (const [token, record] of this.verifications) {
      if (record.userId === dto.userId && record.email === dto.email) {
        existingRecord = record;
        existingToken = token;
        break;
      }
    }

    if (!existingRecord || !existingToken) {
      throw new NotFoundException('No pending verification found for this email');
    }

    if (existingRecord.expiresAt < new Date()) {
      this.verifications.delete(existingToken);
      throw new BadRequestException('Verification has expired. Please request a new one.');
    }

    // Re-send the email
    const verifyUrl = `${this.verificationBaseUrl}/api/v1/email/verify-email?token=${existingToken}&return_to=%2Fen%2Fdashboard%2Faccount`;
    const changePasswordUrl = `${this.verificationBaseUrl}/account/security`;
    const template = existingRecord.type === 'email_change' ? 'email-change' : 'email-verification';

    await this.send({
      to: dto.email,
      subject: existingRecord.type === 'email_change'
        ? 'Confirm your new email address — Berhot'
        : 'Verify your email address — Berhot',
      template,
      data: { verifyUrl, email: dto.email, newEmail: dto.email, expiryHours: this.tokenExpiryHours, changePasswordUrl },
    });

    this.logger.log(`Verification re-sent → ${dto.email} | userId=${dto.userId}`);
    return { message: 'Verification email re-sent' };
  }

  /* ══════════════════════════════════════════════════════════════
     6. VERIFY EMAIL FROM LINK — browser landing page
     ══════════════════════════════════════════════════════════════ */
  async verifyEmailFromLink(token: string, returnTo: string | undefined, res: Response) {
    // Redirect to the frontend app (cafe-pos), not back to the email-service
    const continueUrl = returnTo
      ? `${this.frontendUrl}${returnTo}`
      : `${this.frontendUrl}/en/dashboard/account`;

    if (!token) {
      const html = this.templateService.render('verify-error', {
        title: 'Invalid link',
        message: 'The verification link is invalid or incomplete. Please check your email and try again.',
        continueUrl,
      });
      return res.status(400).type('html').send(html);
    }

    try {
      await this.confirmVerification({ token });
      const html = this.templateService.render('verify-success', { continueUrl });
      return res.status(200).type('html').send(html);
    } catch (error) {
      const isExpired = error instanceof BadRequestException;
      const html = this.templateService.render('verify-error', {
        title: isExpired ? 'Link expired' : 'Verification failed',
        message: isExpired
          ? 'This verification link has expired. Please request a new verification email.'
          : 'This verification link is invalid or has already been used.',
        continueUrl,
      });
      return res.status(isExpired ? 410 : 400).type('html').send(html);
    }
  }

  /* ══════════════════════════════════════════════════════════════
     7. CHECK VERIFICATION STATUS — poll from frontend
     ══════════════════════════════════════════════════════════════ */
  async checkVerificationStatus(email: string, userId: string): Promise<{ verified: boolean }> {
    // Check in-memory first (fastest)
    if (this.registeredEmails.has(email.toLowerCase())) {
      return { verified: true };
    }

    // Check identity-access DB for email_verified_at
    try {
      const res = await fetch(`${this.identityAccessUrl}/internal/users/${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = (await res.json()) as { email?: string; emailVerified?: boolean };
        // Only verified if email matches AND email_verified_at is set
        if (data.email?.toLowerCase() === email.toLowerCase() && data.emailVerified) {
          this.registeredEmails.add(email.toLowerCase());
          return { verified: true };
        }
      }
    } catch {
      // identity-access unreachable — fall through
    }

    return { verified: false };
  }

  /* ══════════════════════════════════════════════════════════════
     8. HEALTH CHECK
     ══════════════════════════════════════════════════════════════ */
  async checkHealth(): Promise<{ status: string; smtp: boolean }> {
    try {
      await this.transporter.verify();
      return { status: 'healthy', smtp: true };
    } catch {
      return { status: 'degraded', smtp: false };
    }
  }
}
