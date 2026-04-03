import { hash } from 'bcrypt';
import { Op } from 'sequelize';
import { Service, Inject } from 'typedi';
import { DB } from '@database';
import { ForgotPasswordDto, VerifyOTPDto, ResetPasswordDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { EmailService } from './email.service';

const OTP_EXPIRY_MINUTES = 5;

@Service()
export class PasswordResetService {
  @Inject()
  private emailService: EmailService;

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = data;

    // Find user by email
    const findUser: User = await DB.Users.findOne({ where: { email } });
    if (!findUser) {
      // For security, don't reveal if email exists or not
      return { message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã xác thực.' };
    }

    // Check account status
    if (findUser.status === 'locked') {
      throw new HttpException(403, 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // Invalidate any existing OTPs for this user
    await DB.OTPs.update(
      { isUsed: true },
      { where: { userId: findUser.id, isUsed: false } }
    );

    // Generate new OTP
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP to database
    await DB.OTPs.create({
      userId: findUser.id,
      email,
      otp,
      expiresAt,
      isUsed: false,
    });

    // Send OTP via email
    const emailSent = await this.emailService.sendOTPEmail(email, otp, findUser.fullName);

    if (!emailSent) {
      throw new HttpException(500, 'Không thể gửi email. Vui lòng thử lại sau.');
    }

    return { message: 'Mã xác thực đã được gửi đến email của bạn.' };
  }

  public async verifyOTP(data: VerifyOTPDto): Promise<{ message: string; valid: boolean }> {
    const { email, otp } = data;

    // Find valid OTP
    const findOTP = await DB.OTPs.findOne({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!findOTP) {
      throw new HttpException(400, 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    return { message: 'Mã xác thực hợp lệ.', valid: true };
  }

  public async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    const { email, otp, newPassword } = data;

    // Find valid OTP
    const findOTP = await DB.OTPs.findOne({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!findOTP) {
      throw new HttpException(400, 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    // Find user
    const findUser: User = await DB.Users.findOne({ where: { email } });
    if (!findUser) {
      throw new HttpException(404, 'Không tìm thấy người dùng.');
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await DB.Users.update(
      { password: hashedPassword },
      { where: { id: findUser.id } }
    );

    // Mark OTP as used
    await DB.OTPs.update(
      { isUsed: true },
      { where: { id: findOTP.id } }
    );

    return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.' };
  }
}
