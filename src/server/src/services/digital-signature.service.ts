import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { DB } from '@database';
import { HttpException } from '@/exceptions/HttpException';

const SIGNATURE_DIR = path.join(__dirname, '../../uploads/signatures');

// Ensure upload directory exists
if (!fs.existsSync(SIGNATURE_DIR)) {
  fs.mkdirSync(SIGNATURE_DIR, { recursive: true });
}

@Service()
export class DigitalSignatureService {
  /**
   * Get user's signature config (image path + hasPin status)
   */
  public async getConfig(userId: number) {
    const record = await DB.SignatureConfigs.findOne({ where: { userId } });

    return {
      userId,
      signatureImage: record?.signatureImage || null,
      hasPin: !!record?.pinHash,
    };
  }

  /**
   * Upload signature image (file-based via multer)
   */
  public async uploadSignatureImage(userId: number, filePath: string) {
    const relativePath = `/uploads/signatures/${path.basename(filePath)}`;

    const record = await DB.SignatureConfigs.findOne({ where: { userId } });

    if (record) {
      // Delete old image file if exists
      if (record.signatureImage) {
        const oldPath = path.join(__dirname, '../..', record.signatureImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      await DB.SignatureConfigs.update({ signatureImage: relativePath }, { where: { id: record.id } });
    } else {
      await DB.SignatureConfigs.create({ userId, signatureImage: relativePath });
    }

    return { signatureImage: relativePath };
  }

  /**
   * Save drawn signature from base64 data URL
   */
  public async saveDrawnSignature(userId: number, dataUrl: string) {
    const matches = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) throw new HttpException(400, 'Dữ liệu chữ ký không hợp lệ');

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `signature-${userId}-${Date.now()}.${ext}`;
    const fullPath = path.join(SIGNATURE_DIR, filename);

    fs.writeFileSync(fullPath, buffer);

    return this.uploadSignatureImage(userId, fullPath);
  }

  /**
   * Delete signature image
   */
  public async deleteSignatureImage(userId: number) {
    const record = await DB.SignatureConfigs.findOne({ where: { userId } });

    if (record?.signatureImage) {
      const filePath = path.join(__dirname, '../..', record.signatureImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await DB.SignatureConfigs.update({ signatureImage: null }, { where: { id: record.id } });
    }

    return { message: 'Đã xóa chữ ký' };
  }

  /**
   * Set PIN (first time)
   */
  public async setPin(userId: number, pin: string) {
    const record = await DB.SignatureConfigs.findOne({ where: { userId } });
    const hashedPin = await bcrypt.hash(pin, 10);

    if (record) {
      if (record.pinHash) throw new HttpException(400, 'Mã PIN đã tồn tại. Vui lòng dùng chức năng đổi PIN.');
      await DB.SignatureConfigs.update({ pinHash: hashedPin }, { where: { id: record.id } });
    } else {
      await DB.SignatureConfigs.create({ userId, pinHash: hashedPin });
    }

    return { message: 'Đã thiết lập mã PIN' };
  }

  /**
   * Change PIN (requires current PIN)
   */
  public async changePin(userId: number, currentPin: string, newPin: string) {
    const record = await DB.SignatureConfigs.findOne({ where: { userId } });
    if (!record?.pinHash) throw new HttpException(400, 'Chưa thiết lập mã PIN');

    const isValid = await bcrypt.compare(currentPin, record.pinHash);
    if (!isValid) throw new HttpException(400, 'Mã PIN hiện tại không đúng');

    const hashedPin = await bcrypt.hash(newPin, 10);
    await DB.SignatureConfigs.update({ pinHash: hashedPin }, { where: { id: record.id } });

    return { message: 'Đã đổi mã PIN thành công' };
  }

  /**
   * Verify PIN
   */
  public async verifyPin(userId: number, pin: string) {
    const record = await DB.SignatureConfigs.findOne({ where: { userId } });
    if (!record?.pinHash) throw new HttpException(400, 'Chưa thiết lập mã PIN');

    const isValid = await bcrypt.compare(pin, record.pinHash);
    if (!isValid) throw new HttpException(400, 'Mã PIN không đúng');

    return { valid: true };
  }
}

