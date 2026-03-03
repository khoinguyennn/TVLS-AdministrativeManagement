import { hash } from 'bcrypt';
import { DB } from '@database';
import { logger } from '@utils/logger';

export async function seedAdminUser() {
  try {
    const adminEmail = 'admin@thsp.edu.vn';
    const existingAdmin = await DB.Users.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const hashedPassword = await hash('admin@123', 10);
      await DB.Users.create({
        email: adminEmail,
        password: hashedPassword,
        fullName: 'Quản trị viên',
        role: 'admin',
        status: 'active',
      });
      logger.info('✅ Admin user seeded successfully');
    } else {
      logger.info('ℹ️ Admin user already exists, skipping seed');
    }
  } catch (error) {
    logger.error('❌ Failed to seed admin user:', error);
  }
}
