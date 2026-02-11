import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';

/* ──────────────────────────────────────────────────────────────────
   Template Service — compiles Handlebars email templates
   Templates are stored as strings for simplicity; migrate to
   file-based templates or DB-stored templates when needed.
   ────────────────────────────────────────────────────────────────── */

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerTemplates();
  }

  /** Render a named template with data */
  render(templateName: string, data: Record<string, unknown>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      this.logger.warn(`Template "${templateName}" not found, using fallback`);
      return this.renderFallback(templateName, data);
    }
    return template(data);
  }

  /** Register all built-in templates */
  private registerTemplates() {
    // ── Email Verification ────────────────────────────────────
    this.register('email-verification', `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden">
        <!-- Dark Header with Icon + Title -->
        <tr><td style="background:#2d3436;padding:40px 40px 36px;text-align:center">
          <!-- Berhot Icon -->
          <div style="width:44px;height:44px;background:#ffffff;border-radius:8px;margin:0 auto 20px;line-height:44px;text-align:center">
            <span style="color:#2d3436;font-size:22px;font-weight:800">B</span>
          </div>
          <h1 style="font-size:24px;font-weight:400;color:#ffffff;margin:0;letter-spacing:-0.3px">Verify your email address</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 48px 36px">
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 8px">Hello,</p>
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 32px">
            Please confirm that you want to use <a href="mailto:{{email}}" style="color:#3366cc;text-decoration:none;font-weight:500">{{email}}</a> as your Berhot account email address.
          </p>
          <!-- Blue CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px">
            <tr><td align="center" style="background:#3366ff;border-radius:6px">
              <a href="{{verifyUrl}}" style="display:inline-block;padding:16px 48px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.2px">Verify email</a>
            </td></tr>
          </table>
          <!-- Fallback Link -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 8px">Or copy and paste this link into your browser:</p>
          <p style="font-size:13px;line-height:1.5;margin:0 0 28px;word-break:break-all">
            <a href="{{verifyUrl}}" style="color:#3366cc;text-decoration:none">{{verifyUrl}}</a>
          </p>
          <!-- Expiry Notice -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 24px">This unique link will expire in {{expiryHours}} hours.</p>
          <!-- Security Warning -->
          <p style="font-size:14px;color:#cc0000;line-height:1.5;margin:0;font-weight:600">
            If you didn't request these changes, take a moment to secure your account by <a href="{{changePasswordUrl}}" style="color:#cc0000;text-decoration:underline;font-weight:700">changing your password</a>.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 48px;border-top:1px solid #eeeeee">
          <p style="font-size:12px;color:#999999;margin:0;text-align:center">&copy; {{year}} Berhot. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);

    // ── Email Change Verification ─────────────────────────────
    this.register('email-change', `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden">
        <!-- Dark Header with Icon + Title -->
        <tr><td style="background:#2d3436;padding:40px 40px 36px;text-align:center">
          <div style="width:44px;height:44px;background:#ffffff;border-radius:8px;margin:0 auto 20px;line-height:44px;text-align:center">
            <span style="color:#2d3436;font-size:22px;font-weight:800">B</span>
          </div>
          <h1 style="font-size:24px;font-weight:400;color:#ffffff;margin:0;letter-spacing:-0.3px">Confirm your new email</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 48px 36px">
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 8px">Hello,</p>
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 32px">
            Please confirm that you want to use <a href="mailto:{{newEmail}}" style="color:#3366cc;text-decoration:none;font-weight:500">{{newEmail}}</a> as your new Berhot account email address.
          </p>
          <!-- Blue CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px">
            <tr><td align="center" style="background:#3366ff;border-radius:6px">
              <a href="{{verifyUrl}}" style="display:inline-block;padding:16px 48px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.2px">Confirm email change</a>
            </td></tr>
          </table>
          <!-- Fallback Link -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 8px">Or copy and paste this link into your browser:</p>
          <p style="font-size:13px;line-height:1.5;margin:0 0 28px;word-break:break-all">
            <a href="{{verifyUrl}}" style="color:#3366cc;text-decoration:none">{{verifyUrl}}</a>
          </p>
          <!-- Expiry Notice -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 24px">This unique link will expire in {{expiryHours}} hours.</p>
          <!-- Security Warning -->
          <p style="font-size:14px;color:#cc0000;line-height:1.5;margin:0;font-weight:600">
            If you didn't request these changes, take a moment to secure your account by <a href="{{changePasswordUrl}}" style="color:#cc0000;text-decoration:underline;font-weight:700">changing your password</a>.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 48px;border-top:1px solid #eeeeee">
          <p style="font-size:12px;color:#999999;margin:0;text-align:center">&copy; {{year}} Berhot. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);

    // ── Password Reset ────────────────────────────────────────
    this.register('password-reset', `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden">
        <!-- Dark Header with Icon + Title -->
        <tr><td style="background:#2d3436;padding:40px 40px 36px;text-align:center">
          <div style="width:44px;height:44px;background:#ffffff;border-radius:8px;margin:0 auto 20px;line-height:44px;text-align:center">
            <span style="color:#2d3436;font-size:22px;font-weight:800">B</span>
          </div>
          <h1 style="font-size:24px;font-weight:400;color:#ffffff;margin:0;letter-spacing:-0.3px">Reset your password</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 48px 36px">
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 8px">Hello,</p>
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 32px">
            We received a request to reset the password for your account. Click the button below to choose a new password.
          </p>
          <!-- Blue CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px">
            <tr><td align="center" style="background:#3366ff;border-radius:6px">
              <a href="{{resetUrl}}" style="display:inline-block;padding:16px 48px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.2px">Reset password</a>
            </td></tr>
          </table>
          <!-- Fallback Link -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 8px">Or copy and paste this link into your browser:</p>
          <p style="font-size:13px;line-height:1.5;margin:0 0 28px;word-break:break-all">
            <a href="{{resetUrl}}" style="color:#3366cc;text-decoration:none">{{resetUrl}}</a>
          </p>
          <!-- Expiry Notice -->
          <p style="font-size:14px;color:#666666;line-height:1.5;margin:0 0 24px">This unique link will expire in {{expiryHours}} hours.</p>
          <!-- Security Warning -->
          <p style="font-size:14px;color:#cc0000;line-height:1.5;margin:0;font-weight:600">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 48px;border-top:1px solid #eeeeee">
          <p style="font-size:12px;color:#999999;margin:0;text-align:center">&copy; {{year}} Berhot. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);

    // ── Welcome Email ─────────────────────────────────────────
    this.register('welcome', `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#e8e8e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8e8e8;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden">
        <!-- Dark Header with Icon + Title -->
        <tr><td style="background:#2d3436;padding:40px 40px 36px;text-align:center">
          <div style="width:44px;height:44px;background:#ffffff;border-radius:8px;margin:0 auto 20px;line-height:44px;text-align:center">
            <span style="color:#2d3436;font-size:22px;font-weight:800">B</span>
          </div>
          <h1 style="font-size:24px;font-weight:400;color:#ffffff;margin:0;letter-spacing:-0.3px">Welcome to Berhot!</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 48px 36px">
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 8px">Hello {{firstName}},</p>
          <p style="font-size:16px;color:#333333;line-height:1.5;margin:0 0 32px">
            Your account has been created successfully. Get started by setting up your workspace and exploring our features.
          </p>
          <!-- Blue CTA Button -->
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px">
            <tr><td align="center" style="background:#3366ff;border-radius:6px">
              <a href="{{dashboardUrl}}" style="display:inline-block;padding:16px 48px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;letter-spacing:0.2px">Go to Dashboard</a>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 48px;border-top:1px solid #eeeeee">
          <p style="font-size:12px;color:#999999;margin:0;text-align:center">&copy; {{year}} Berhot. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`);

    // ── Verification Success Page (rendered in browser) ────────
    this.register('verify-success', `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Email Verified — Berhot</title>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { display: none; width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #ffffff; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 10px; }
    .btn-text { display: inline; }
    .btn.loading .spinner { display: inline-block; }
    .btn.loading .btn-text { display: none; }
    .btn { display: flex; align-items: center; justify-content: center; max-width: 480px; margin: 0 auto; padding: 18px 32px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 40px; font-size: 16px; font-weight: 600; letter-spacing: 0.2px; border: none; cursor: pointer; width: 100%; transition: opacity 0.15s; }
    .btn.loading { opacity: 0.85; cursor: wait; }
  </style>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;position:relative">
  <!-- Close (X) button — top right, closes the window/tab -->
  <button onclick="handleClose()" style="position:fixed;top:20px;right:20px;width:40px;height:40px;border-radius:50%;border:1.5px solid #e5e7eb;background:#ffffff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s,border-color 0.15s;z-index:10" onmouseover="this.style.background='#f3f4f6';this.style.borderColor='#d1d5db'" onmouseout="this.style.background='#ffffff';this.style.borderColor='#e5e7eb'">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  </button>
  <div style="text-align:center;padding:40px 24px;max-width:560px;width:100%">
    <h1 style="font-size:28px;font-weight:700;color:#1a1a1a;margin:0 0 40px;letter-spacing:-0.3px">Congrats! Your email is successfully verified.</h1>
    <button id="continueBtn" class="btn" onclick="handleContinue()">
      <div class="spinner"></div>
      <span class="btn-text">Continue to Berhot</span>
    </button>
  </div>
  <script>
    function handleClose() {
      window.close();
      // Fallback: if window.close() is blocked (not opened by script), redirect instead
      setTimeout(function() { window.location.href = '{{continueUrl}}'; }, 300);
    }
    function handleContinue() {
      var btn = document.getElementById('continueBtn');
      btn.classList.add('loading');
      setTimeout(function() {
        window.location.href = '{{continueUrl}}' + (('{{continueUrl}}').indexOf('?') > -1 ? '&' : '?') + 'verified=true';
      }, 600);
    }
  </script>
</body>
</html>`);

    // ── Verification Error Page (rendered in browser) ────────
    this.register('verify-error', `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verification Failed — Berhot</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;padding:40px 24px;max-width:560px;width:100%">
    <h1 style="font-size:28px;font-weight:700;color:#1a1a1a;margin:0 0 12px;letter-spacing:-0.3px">{{title}}</h1>
    <p style="font-size:16px;color:#666666;margin:0 0 40px;line-height:1.5">{{message}}</p>
    <a href="{{continueUrl}}" style="display:block;max-width:480px;margin:0 auto;padding:18px 32px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:40px;font-size:16px;font-weight:600;letter-spacing:0.2px">Go to Berhot</a>
  </div>
</body>
</html>`);

    this.logger.log(`Registered ${this.templates.size} email templates`);
  }

  /** Compile and register a template */
  private register(name: string, source: string) {
    // Register year helper for copyright
    Handlebars.registerHelper('year', () => new Date().getFullYear());
    this.templates.set(name, Handlebars.compile(source));
  }

  /** Fallback for unknown templates */
  private renderFallback(_name: string, data: Record<string, unknown>): string {
    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px;font-family:sans-serif;background:#f7f7f7">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <h1 style="color:#1a1a1a">Berhot</h1>
    <pre style="font-size:13px;color:#6b7280">${JSON.stringify(data, null, 2)}</pre>
  </div>
</body>
</html>`;
  }
}
