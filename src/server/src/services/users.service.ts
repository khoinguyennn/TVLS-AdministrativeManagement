import { compare, hash } from 'bcrypt';
import { Service } from 'typedi';
import { DB } from '@database';
import { CreateUserDto, UpdateProfileDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await DB.Users.findAll();
    return allUser;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser: User = await DB.Users.findOne({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await DB.Users.create({
      email: userData.email,
      password: hashedPassword,
      fullName: userData.fullName,
      role: (userData.role as 'admin' | 'manager' | 'teacher' | 'technician') || 'teacher',
    });
    return createUserData;
  }

  public async updateUser(userId: number, userData: CreateUserDto): Promise<User> {
    const findUser: User = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const hashedPassword = await hash(userData.password, 10);
    await DB.Users.update(
      {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        role: (userData.role as 'admin' | 'manager' | 'teacher' | 'technician') || findUser.role,
      },
      { where: { id: userId } },
    );

    const updateUser: User = await DB.Users.findByPk(userId);
    return updateUser;
  }

  public async deleteUser(userId: number): Promise<User> {
    const findUser: User = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    await DB.Users.destroy({ where: { id: userId } });

    return findUser;
  }

  public async updateProfile(userId: number, data: UpdateProfileDto): Promise<User> {
    // Find user
    const findUser: User = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(404, 'Không tìm thấy người dùng');

    const updateData: Partial<User> = {};

    // Update email if provided
    if (data.email && data.email !== findUser.email) {
      // Check if email already exists
      const existingUser = await DB.Users.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new HttpException(409, 'Email đã được sử dụng bởi tài khoản khác');
      }
      updateData.email = data.email;
    }

    // Update password if provided
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new HttpException(400, 'Vui lòng nhập mật khẩu hiện tại');
      }

      // Verify current password
      const isPasswordMatching = await compare(data.currentPassword, findUser.password);
      if (!isPasswordMatching) {
        throw new HttpException(400, 'Mật khẩu hiện tại không chính xác');
      }

      updateData.password = await hash(data.newPassword, 10);
    }

    // Update fullName if provided
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    }

    // Update avatar if provided
    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar;
    }

    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    // Update user
    await DB.Users.update(updateData, { where: { id: userId } });

    // Return updated user (without password)
    const updatedUser: User = await DB.Users.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    return updatedUser;
  }
}
