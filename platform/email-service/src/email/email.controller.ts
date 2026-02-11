import { Controller, Post, Get, Body, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import * as express from 'express';

import { EmailService } from './email.service';
import {
  SendEmailDto,
  SendVerificationDto,
  ConfirmVerificationDto,
  ChangeEmailDto,
  ResendVerificationDto,
} from './dto/send-email.dto';

/* ──────────────────────────────────────────────────────────────────
   Email Controller — REST API endpoints
   Base path: /api/v1/email (set in main.ts global prefix)
   ────────────────────────────────────────────────────────────────── */

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /* ── POST /send — Send a transactional email ────────────────── */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto) {
    return this.emailService.send(dto);
  }

  /* ── POST /verify/send — Send email verification ────────────── */
  @Post('verify/send')
  @HttpCode(HttpStatus.OK)
  async sendVerification(@Body() dto: SendVerificationDto) {
    return this.emailService.sendVerification(dto);
  }

  /* ── POST /verify/confirm — Confirm verification token ──────── */
  @Post('verify/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmVerification(@Body() dto: ConfirmVerificationDto) {
    return this.emailService.confirmVerification(dto);
  }

  /* ── POST /change — Request email change ────────────────────── */
  @Post('change')
  @HttpCode(HttpStatus.OK)
  async changeEmail(@Body() dto: ChangeEmailDto) {
    return this.emailService.changeEmail(dto);
  }

  /* ── POST /resend — Resend pending verification ─────────────── */
  @Post('resend')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.emailService.resendVerification(dto);
  }

  /* ── GET /verify/status — Poll verification status ─────────── */
  @Get('verify/status')
  async verifyStatus(
    @Query('email') email: string,
    @Query('userId') userId: string,
  ) {
    return this.emailService.checkVerificationStatus(email, userId);
  }

  /* ── GET /verify-email — Browser landing page when user clicks verify link ── */
  @Get('verify-email')
  async verifyEmailPage(
    @Query('token') token: string,
    @Query('return_to') returnTo: string,
    @Res() res: express.Response,
  ) {
    return this.emailService.verifyEmailFromLink(token, returnTo, res);
  }

  /* ── GET /health — Service health check ─────────────────────── */
  @Get('health')
  async health() {
    return this.emailService.checkHealth();
  }
}
