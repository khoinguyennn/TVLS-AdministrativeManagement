import { compare, hash } from 'bcrypt';
import { Service } from 'typedi';
import { DB } from '@database';
import { CreateUserDto, UpdateProfileDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';

@Service()
export class UserService {
  public async findAllUser(): Promise<User[]> {
    const allUser = await DB.Users.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    return allUser.map(u => u.get({ plain: true })) as User[];
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser.get({ plain: true }) as User;
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

  public async updateUser(userId: number, userData: Partial<CreateUserDto & { status: string }>): Promise<User> {
    const findUser = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    const updateData: Partial<User> = {};

    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.fullName !== undefined) updateData.fullName = userData.fullName;
    if (userData.role !== undefined) updateData.role = userData.role as User['role'];
    if (userData.status !== undefined) updateData.status = userData.status as User['status'];
    if (userData.password) updateData.password = await hash(userData.password, 10);

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.Users.update(updateData, { where: { id: userId } });

    const updatedUser = await DB.Users.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });
    return updatedUser.get({ plain: true }) as User;
  }

  public async deleteUser(userId: number): Promise<User> {
    const findUser: User = await DB.Users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    // Check if user has any work orders assigned
    const assignedWorkOrders = await DB.WorkOrders.count({
      where: { assignedTo: userId }
    });

    if (assignedWorkOrders > 0) {
      throw new HttpException(409, `Không thể xóa người dùng vì vẫn còn ${assignedWorkOrders} công lệnh được giao. Vui lòng giao lại hoặc xóa những công lệnh này trước.`);
    }

    // Check if user has any work order assignees (many-to-many)
    const workOrderAssignees = await DB.WorkOrderAssignees.count({
      where: { assigned_to_user_id: userId }
    });

    if (workOrderAssignees > 0) {
      throw new HttpException(409, `Không thể xóa người dùng vì vẫn còn ${workOrderAssignees} công lệnh được giao trong danh sách người thực hiện. Vui lòng gỡ bỏ trước.`);
    }

    // Check if user has device reports assigned
    const assignedReports = await DB.DeviceReports.count({
      where: { assignedTo: userId }
    });

    if (assignedReports > 0) {
      throw new HttpException(409, `Không thể xóa người dùng vì vẫn còn ${assignedReports} báo cáo thiết bị được giao. Vui lòng giao lại trước.`);
    }

    // Check if user has leave requests
    const leaveRequests = await DB.LeaveRequests.count({
      where: { userId }
    });

    if (leaveRequests > 0) {
      throw new HttpException(409, `Không thể xóa người dùng vì vẫn còn ${leaveRequests} đơn xin phép. Vui lòng xóa đơn này trước.`);
    }

    // Check if user is approver for any leave requests
    const approvedLeaves = await DB.LeaveRequests.count({
      where: { approvedBy: userId }
    });

    if (approvedLeaves > 0) {
      throw new HttpException(409, `Không thể xóa người dùng vì vẫn còn người khác được người dùng này phê duyệt. Vui lòng giao lại quyền phê duyệt trước.`);
    }

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
    const updatedUser = await DB.Users.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    return updatedUser.get({ plain: true }) as User;
  }
}
