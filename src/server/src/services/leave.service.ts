import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import { DB } from '@database';
import { CreateLeaveRequestDto, CreateLeaveTypeDto, CreateLeaveBalanceDto } from '@dtos/leave.dto';
import { HttpException } from '@/exceptions/HttpException';
import { LeaveRequest } from '@interfaces/leave.interface';

// Chỉ loại "Nghỉ phép năm" mới trừ vào số ngày phép
const ANNUAL_LEAVE_TYPE_ID = 1;

@Service()
export class LeaveRequestService {
  private isAnnualLeave(leaveTypeId: number): boolean {
    return leaveTypeId === ANNUAL_LEAVE_TYPE_ID;
  }
  // ── Leave Requests ──
  public async findAll(userId?: number): Promise<any[]> {
    const where = userId ? { userId } : {};
    const requests = await DB.LeaveRequests.findAll({
      where,
      include: [
        { model: DB.Users, as: 'user', attributes: ['id', 'fullName', 'avatar', 'role'] },
        { model: DB.LeaveTypes, as: 'leaveType', attributes: ['id', 'name', 'maxDaysPerYear'] },
        { model: DB.Users, as: 'approver', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return requests.map(r => r.get({ plain: true }));
  }

  public async findById(id: number): Promise<any> {
    const request = await DB.LeaveRequests.findByPk(id, {
      include: [
        { model: DB.Users, as: 'user', attributes: ['id', 'fullName', 'avatar', 'role'] },
        { model: DB.LeaveTypes, as: 'leaveType', attributes: ['id', 'name', 'maxDaysPerYear'] },
        { model: DB.Users, as: 'approver', attributes: ['id', 'fullName'] },
      ],
    });
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    return request.get({ plain: true });
  }

  public async create(userId: number, data: CreateLeaveRequestDto): Promise<LeaveRequest> {
    // Verify leave type exists
    const leaveType = await DB.LeaveTypes.findByPk(data.leaveTypeId);
    if (!leaveType) throw new HttpException(404, 'Không tìm thấy loại nghỉ phép');

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      throw new HttpException(400, 'Ngày kết thúc không được trước ngày bắt đầu');
    }

    // Chỉ kiểm tra số ngày phép còn lại nếu là "Nghỉ phép năm"
    if (this.isAnnualLeave(data.leaveTypeId)) {
      const year = new Date(data.startDate).getFullYear();
      const balance = await DB.LeaveBalances.findOne({ where: { userId, year } });
      const usedDays = balance ? balance.usedDays : 0;
      const totalAllowed = balance ? balance.totalDays : 12;
      const remaining = totalAllowed - usedDays;

      if (data.totalDays > remaining) {
        throw new HttpException(400, `Số ngày phép còn lại không đủ. Bạn còn ${remaining} ngày (đã sử dụng ${usedDays}/${totalAllowed} ngày).`);
      }
    }

    const created = await DB.LeaveRequests.create({
      userId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      reason: data.reason,
    });

    return created.get({ plain: true }) as LeaveRequest;
  }

  public async approve(id: number, approvedBy: number, pin: string): Promise<any> {
    const request = await DB.LeaveRequests.findByPk(id, {
      include: [{ model: DB.LeaveTypes, as: 'leaveType' }],
    });
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.status !== 'pending') throw new HttpException(400, 'Yêu cầu này đã được xử lý');

    // Chỉ kiểm tra số ngày phép còn lại nếu là "Nghỉ phép năm"
    if (this.isAnnualLeave(request.leaveTypeId)) {
      const year = new Date(request.startDate).getFullYear();
      const balance = await DB.LeaveBalances.findOne({ where: { userId: request.userId, year } });
      const usedDays = balance ? balance.usedDays : 0;
      const totalAllowed = balance ? balance.totalDays : 12;
      const remaining = totalAllowed - usedDays;

      if (request.totalDays > remaining) {
        throw new HttpException(
          400,
          `Không thể duyệt: số ngày phép còn lại không đủ. Còn ${remaining} ngày (đã sử dụng ${usedDays}/${totalAllowed} ngày).`,
        );
      }
    }

    // Verify approver's PIN
    await this.verifySignaturePin(approvedBy, pin);

    await DB.LeaveRequests.update({ status: 'approved', approvedBy, approverSignedAt: new Date() }, { where: { id } });

    // Auto-deduct leave balance
    await this.deductLeaveBalance(request);

    return this.findById(id);
  }

  /**
   * Tự động trừ ngày phép khi duyệt đơn.
   * Chỉ trừ cho loại "Nghỉ phép năm", các loại khác không trừ.
   * Nếu chưa có bản ghi leave_balances → tự tạo mới (mặc định 12 ngày/năm).
   */
  private async deductLeaveBalance(request: any): Promise<void> {
    if (!this.isAnnualLeave(request.leaveTypeId)) return;

    const year = new Date(request.startDate).getFullYear();
    let balance = await DB.LeaveBalances.findOne({ where: { userId: request.userId, year } });

    if (!balance) {
      balance = await DB.LeaveBalances.create({
        userId: request.userId,
        year,
        totalDays: 12,
        usedDays: 0,
      });
    }

    const newUsedDays = balance.usedDays + request.totalDays;
    await DB.LeaveBalances.update({ usedDays: newUsedDays }, { where: { id: balance.id } });
  }

  /**
   * Hoàn lại ngày phép khi từ chối đơn đã duyệt hoặc xóa đơn đã duyệt.
   * Chỉ hoàn cho loại "Nghỉ phép năm".
   */
  private async refundLeaveBalance(request: any): Promise<void> {
    if (!this.isAnnualLeave(request.leaveTypeId)) return;

    const year = new Date(request.startDate).getFullYear();
    const balance = await DB.LeaveBalances.findOne({ where: { userId: request.userId, year } });
    if (balance) {
      const newUsedDays = Math.max(0, balance.usedDays - request.totalDays);
      await DB.LeaveBalances.update({ usedDays: newUsedDays }, { where: { id: balance.id } });
    }
  }

  public async reject(id: number, approvedBy: number, pin: string, rejectedReason?: string): Promise<any> {
    const request = await DB.LeaveRequests.findByPk(id);
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.status === 'rejected') throw new HttpException(400, 'Yêu cầu này đã bị từ chối');

    const wasApproved = request.status === 'approved';

    // Verify approver's PIN
    await this.verifySignaturePin(approvedBy, pin);

    await DB.LeaveRequests.update(
      { status: 'rejected', approvedBy, rejectedReason: rejectedReason || null, approverSignedAt: new Date() },
      { where: { id } },
    );

    // Hoàn lại ngày phép nếu đơn trước đó đã được duyệt
    if (wasApproved) {
      await this.refundLeaveBalance(request);
    }

    return this.findById(id);
  }

  public async delete(id: number): Promise<LeaveRequest> {
    const request = await DB.LeaveRequests.findByPk(id);
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.status !== 'pending') throw new HttpException(400, 'Chỉ có thể xóa yêu cầu đang chờ duyệt');

    const plain = request.get({ plain: true }) as LeaveRequest;
    await DB.LeaveRequests.destroy({ where: { id } });
    return plain;
  }

  public async getStats(userId?: number): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const where = userId ? { userId } : {};
    const total = await DB.LeaveRequests.count({ where });
    const pending = await DB.LeaveRequests.count({ where: { ...where, status: 'pending' } });
    const approved = await DB.LeaveRequests.count({ where: { ...where, status: 'approved' } });
    const rejected = await DB.LeaveRequests.count({ where: { ...where, status: 'rejected' } });
    return { total, pending, approved, rejected };
  }

  // ── Verify Signature PIN helper ──
  private async verifySignaturePin(userId: number, pin: string): Promise<void> {
    if (!pin) throw new HttpException(400, 'Vui lòng nhập mã PIN chữ ký');
    const sigConfig = await DB.SignatureConfigs.findOne({ where: { userId } });
    if (!sigConfig || !sigConfig.pinHash) throw new HttpException(400, 'Bạn chưa thiết lập mã PIN chữ ký');
    if (!sigConfig.signatureImage) throw new HttpException(400, 'Bạn chưa thiết lập hình ảnh chữ ký');
    const pinValid = await bcrypt.compare(pin, sigConfig.pinHash);
    if (!pinValid) throw new HttpException(400, 'Mã PIN không chính xác');
  }

  // ── Sign Request (user signs their own leave request with PIN) ──
  public async signRequest(requestId: number, userId: number, pin: string): Promise<any> {
    const request = await DB.LeaveRequests.findByPk(requestId);
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.userId !== userId) throw new HttpException(403, 'Bạn chỉ có thể ký đơn của chính mình');
    if (request.signedAt) throw new HttpException(400, 'Đơn này đã được ký');

    await this.verifySignaturePin(userId, pin);

    await DB.LeaveRequests.update({ signedAt: new Date() }, { where: { id: requestId } });

    return this.findById(requestId);
  }

  // ── Leave Types ──
  public async findAllTypes(): Promise<any[]> {
    const types = await DB.LeaveTypes.findAll({ order: [['id', 'ASC']] });
    return types.map(t => t.get({ plain: true }));
  }

  public async createType(data: CreateLeaveTypeDto): Promise<any> {
    const created = await DB.LeaveTypes.create(data);
    return created.get({ plain: true });
  }

  // ── Leave Balances ──
  public async getBalance(userId: number, year: number): Promise<any> {
    let balance = await DB.LeaveBalances.findOne({ where: { userId, year } });
    if (!balance) {
      // Tự động tạo bản ghi leave_balances mặc định 12 ngày/năm
      balance = await DB.LeaveBalances.create({
        userId,
        year,
        totalDays: 12,
        usedDays: 0,
      });
    }
    const plain = balance.get({ plain: true });
    return { ...plain, remainingDays: plain.totalDays - plain.usedDays };
  }

  public async createOrUpdateBalance(data: CreateLeaveBalanceDto): Promise<any> {
    const existing = await DB.LeaveBalances.findOne({ where: { userId: data.userId, year: data.year } });
    if (existing) {
      await DB.LeaveBalances.update({ totalDays: data.totalDays }, { where: { id: existing.id } });
      return this.getBalance(data.userId, data.year);
    }
    const created = await DB.LeaveBalances.create(data);
    const plain = created.get({ plain: true });
    return { ...plain, remainingDays: plain.totalDays - plain.usedDays };
  }
}
