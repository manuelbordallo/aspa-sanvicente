import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import config from '../config';

class EmailService {
  private transporter: Transporter | null = null;

  /**
   * Initialize nodemailer transporter with SMTP settings from configuration
   */
  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });

    return this.transporter;
  }

  /**
   * Send password reset email with reset link
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string
  ): Promise<void> {
    const transporter = this.getTransporter();
    const resetLink = `${config.server.apiBaseUrl}/reset-password?token=${resetToken}`;

    // Email template
    const htmlContent = this.getPasswordResetTemplate(userName, resetLink);
    const textContent = this.getPasswordResetTextTemplate(userName, resetLink);

    try {
      await transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: email,
        subject: 'Password Reset Request - ASPA San Vicente',
        text: textContent,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * HTML template for password reset email
   */
  private getPasswordResetTemplate(userName: string, resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
    }
    .content {
      background-color: white;
      padding: 20px;
      border-radius: 6px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ASPA San Vicente</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
      <div class="warning">
        <strong>⚠️ Important:</strong> This link will expire in ${config.security.passwordResetExpiryHours} hour(s). If you didn't request a password reset, please ignore this email.
      </div>
    </div>
    <div class="footer">
      <p>This is an automated email from ASPA San Vicente. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Plain text template for password reset email
   */
  private getPasswordResetTextTemplate(userName: string, resetLink: string): string {
    return `
ASPA San Vicente - Password Reset Request

Hello ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

IMPORTANT: This link will expire in ${config.security.passwordResetExpiryHours} hour(s). If you didn't request a password reset, please ignore this email.

---
This is an automated email from ASPA San Vicente. Please do not reply to this email.
    `.trim();
  }
}

export default new EmailService();
