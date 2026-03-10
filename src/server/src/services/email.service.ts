import nodemailer from 'nodemailer';
import { Service } from 'typedi';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '@config';
import { logger } from '@utils/logger';

@Service()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  public async sendOTPEmail(to: string, otp: string, fullName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: SMTP_FROM,
        to,
        subject: '🔐 Mã xác thực đặt lại mật khẩu - THSP Admin',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2060df 0%, #1a4fc9 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Trường Thực hành Sư phạm</h1>
                  <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 14px;">Hệ thống Quản lý Hành chính</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Xin chào ${fullName},</h2>
                  <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
                    Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                    Vui lòng sử dụng mã xác thực bên dưới để tiếp tục:
                  </p>

                  <!-- OTP Code -->
                  <div style="background-color: #f8f9fa; border: 2px dashed #2060df; border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
                    <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Mã xác thực của bạn:</p>
                    <h1 style="color: #2060df; margin: 0; font-size: 40px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
                  </div>

                  <!-- Warning -->
                  <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                      ⏰ <strong>Lưu ý:</strong> Mã xác thực này có hiệu lực trong <strong>5 phút</strong>.
                    </p>
                  </div>

                  <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ bộ phận IT để được hỗ trợ.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999; margin: 0; font-size: 12px;">
                    © 2026 Trường Thực hành Sư phạm. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                    Email này được gửi tự động, vui lòng không trả lời.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send OTP email to ${to}: ${error}`);
      return false;
    }
  }

  /**
   * Gửi email thông báo liên quan đến phiếu báo hỏng thiết bị.
   */
  public async sendDeviceReportEmail(to: string | string[], subject: string, bodyContent: string, attachments?: nodemailer.SendMailOptions['attachments']): Promise<boolean> {
    try {
      const recipients = Array.isArray(to) ? to.join(', ') : to;
      const mailOptions: nodemailer.SendMailOptions = {
        from: SMTP_FROM,
        to: recipients,
        subject: `📋 ${subject} - THSP Admin`,
        attachments,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2060df 0%, #1a4fc9 100%); padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Trường Thực hành Sư phạm</h1>
                  <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 14px;">Hệ thống Quản lý Hành chính</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${bodyContent}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999; margin: 0; font-size: 12px;">
                    © 2026 Trường Thực hành Sư phạm. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
                    Email này được gửi tự động, vui lòng không trả lời.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Device report email sent to ${recipients}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send device report email: ${error}`);
      return false;
    }
  }
}
