import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import { DB } from '@database';
import { CreateLeaveRequestDto, CreateLeaveTypeDto, CreateLeaveBalanceDto } from '@dtos/leave.dto';
import { HttpException } from '@/exceptions/HttpException';
import { LeaveRequest } from '@interfaces/leave.interface';

@Service()
export class LeaveRequestService {
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
    const request = await DB.LeaveRequests.findByPk(id);
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.status !== 'pending') throw new HttpException(400, 'Yêu cầu này đã được xử lý');

    // Verify approver's PIN
    await this.verifySignaturePin(approvedBy, pin);

    await DB.LeaveRequests.update({ status: 'approved', approvedBy, approverSignedAt: new Date() }, { where: { id } });

    // Update leave balance: increase used days
    const year = new Date(request.startDate).getFullYear();
    const balance = await DB.LeaveBalances.findOne({ where: { userId: request.userId, year } });
    if (balance) {
      await DB.LeaveBalances.update({ usedDays: balance.usedDays + request.totalDays }, { where: { id: balance.id } });
    }

    return this.findById(id);
  }

  public async reject(id: number, approvedBy: number, pin: string, rejectedReason?: string): Promise<any> {
    const request = await DB.LeaveRequests.findByPk(id);
    if (!request) throw new HttpException(404, 'Không tìm thấy yêu cầu nghỉ phép');
    if (request.status !== 'pending') throw new HttpException(400, 'Yêu cầu này đã được xử lý');

    // Verify approver's PIN
    await this.verifySignaturePin(approvedBy, pin);

    await DB.LeaveRequests.update(
      { status: 'rejected', approvedBy, rejectedReason: rejectedReason || null, approverSignedAt: new Date() },
      { where: { id } },
    );

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
    const balance = await DB.LeaveBalances.findOne({ where: { userId, year } });
    if (!balance) return { userId, year, totalDays: 0, usedDays: 0, remainingDays: 0 };
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
