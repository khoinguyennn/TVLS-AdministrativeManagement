import { Service, Inject } from 'typedi';
import { Op } from 'sequelize';
import { DB } from '@database';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '@dtos/work-orders.dto';
import { WorkOrder } from '@interfaces/work-orders.interface';
import { HttpException } from '@exceptions/HttpException';
import { EmailService } from '@services/email.service';
import NotificationService from '@services/notifications.service';

@Service()
export class WorkOrderService {
  @Inject()
  private emailService: EmailService;
  private notificationService = new NotificationService();

  private async validateAssignee(assigneeId: number): Promise<void> {
    const assignee = await DB.Users.findByPk(assigneeId, { attributes: ['id', 'status'] });
    if (!assignee) {
      throw new HttpException(400, 'Người được giao công lệnh không tồn tại');
    }

    const profile = await DB.StaffProfiles.findOne({ where: { userId: assigneeId }, attributes: ['staffStatus'] });
    const staffStatus = profile?.get('staffStatus') as string | undefined;

    if (staffStatus === 'resigned') {
      throw new HttpException(400, 'Không thể tạo công lệnh cho nhân sự đã nghỉ việc');
    }
  }

  private canOperateAsAssignee(workOrder: WorkOrder, requesterId: number, requesterRole: string): boolean {
    if (['admin', 'manager'].includes(requesterRole)) return true;
    return workOrder.assignedTo === requesterId;
  }

  private normalizeDateInput(value?: string): Date | null {
    if (!value) return null;

    // Handle date-only payloads to avoid UTC parsing shift (e.g. 07:00 in +07 timezone).
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      return new Date(`${value}T${hh}:${mm}:${ss}`);
    }

    return new Date(value);
  }

  /**
   * Generate unique work order code: WO-YYYYMMDD-XXXX
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `WO-${datePart}-`;

    const latest = await DB.WorkOrders.findOne({
      where: {
        code: {
          [Op.like]: `${prefix}%`,
        },
      },
      attributes: ['code'],
      order: [['code', 'DESC']],
    });

    const latestCode = latest?.get('code') as string | undefined;
    const latestSeq = latestCode ? Number(latestCode.split('-').pop()) : 0;
    let nextSeq = Number.isFinite(latestSeq) ? latestSeq + 1 : 1;

    let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    while (await DB.WorkOrders.findOne({ where: { code: candidate }, attributes: ['id'] })) {
      nextSeq += 1;
      candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    }

    return candidate;
  }

  public async findAll(query: { status?: string; assignedTo?: number; createdBy?: number }): Promise<WorkOrder[]> {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.assignedTo) where.assignedTo = query.assignedTo;
    if (query.createdBy) where.createdBy = query.createdBy;

    const rows = await DB.WorkOrders.findAll({
      where,
      include: [
        { model: DB.Users, as: 'creator', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.Users, as: 'approver', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.Users, as: 'assignee', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.WorkOrderAttachments, as: 'attachments' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return rows.map(r => {
      const plain = r.get({ plain: true }) as any;
      return {
        ...plain,
        createdByUser: plain.creator,
        approvedByUser: plain.approver,
        assignedToUser: plain.assignee,
      } as WorkOrder;
    });
  }

  public async findById(id: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id, {
      include: [
        { model: DB.Users, as: 'creator', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.Users, as: 'approver', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.Users, as: 'assignee', attributes: ['id', 'fullName', 'email', 'role'] },
        { model: DB.WorkOrderAttachments, as: 'attachments' },
      ],
    });
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');
    const plain = row.get({ plain: true }) as any;
    return {
      ...plain,
      createdByUser: plain.creator,
      approvedByUser: plain.approver,
      assignedToUser: plain.assignee,
    } as WorkOrder;
  }

  public async create(data: CreateWorkOrderDto, createdBy: number): Promise<WorkOrder> {
    if (data.assignedTo) {
      await this.validateAssignee(data.assignedTo);
    }

    const code = await this.generateCode();
    const row = await DB.WorkOrders.create({
      code,
      title: data.title,
      content: data.content,
      location: data.location,
      startDate: this.normalizeDateInput(data.startDate),
      endDate: this.normalizeDateInput(data.endDate),
      note: data.note,
      createdBy,
      assignedTo: data.assignedTo || null,
      status: 'pending',
    });
    const created = await this.findById(row.get('id') as number);

    // Gửi email thông báo cho người nhận (không chặn response nếu lỗi mail)
    if (created.assignedTo) {
      try {
        const assignee = await DB.Users.findByPk(created.assignedTo, { attributes: ['email', 'fullName'] });
        const creator = await DB.Users.findByPk(createdBy, { attributes: ['fullName'] });
        if (assignee) {
          const plain = assignee.get({ plain: true }) as any;
          const creatorPlain = creator?.get({ plain: true }) as any;
          await this.emailService.sendWorkOrderEmail(
            plain.email,
            plain.fullName,
            {
              code: created.code,
              title: created.title,
              content: created.content,
              location: created.location,
              startDate: created.startDate,
              endDate: created.endDate,
              note: created.note,
              creatorName: creatorPlain?.fullName || 'Quản trị viên',
            },
          );
        }

        // In app notification
        await this.notificationService.createNotification({
          userId: created.assignedTo,
          title: 'Công lệnh mới được giao',
          message: `Bạn vừa được giao một công lệnh mới: ${created.title}`,
          type: 'work_order',
          referenceId: created.id,
        });

      } catch (emailError) {
        // Không throw lỗi mail ra ngoài
      }
    }

    return created;
  }

  public async update(id: number, data: UpdateWorkOrderDto, requesterId: number, requesterRole: string): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;

    // Only creator, admin, or manager can update
    if (plain.createdBy !== requesterId && !['admin', 'manager'].includes(requesterRole)) {
      throw new HttpException(403, 'Bạn không có quyền cập nhật công lệnh này');
    }

    const updateData: Partial<WorkOrder> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startDate !== undefined) updateData.startDate = this.normalizeDateInput(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = this.normalizeDateInput(data.endDate);
    if (data.note !== undefined) updateData.note = data.note;
    if (data.assignedTo !== undefined) {
      if (data.assignedTo) {
        await this.validateAssignee(data.assignedTo);
        if (plain.assignedTo !== data.assignedTo) {
          // Notify new assignee
          await this.notificationService.createNotification({
            userId: data.assignedTo,
            title: 'Chuyển giao công lệnh',
            message: `Bạn vừa được giao xử lý công lệnh: ${plain.title}`,
            type: 'work_order',
            referenceId: plain.id,
          });
        }
      }
      updateData.assignedTo = data.assignedTo;
    }
    if (data.status !== undefined) {
      const nextStatus = data.status as WorkOrder['status'];
      if (['approved', 'rejected'].includes(nextStatus) && !['admin', 'manager'].includes(requesterRole)) {
        throw new HttpException(403, 'Chỉ quản trị viên hoặc quản lý mới có quyền duyệt công lệnh');
      }
      updateData.status = nextStatus;
    }

    await DB.WorkOrders.update(updateData, { where: { id } });
    return this.findById(id);
  }

  public async approve(id: number, approverId: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (plain.status !== 'pending') {
      throw new HttpException(400, 'Chỉ có thể duyệt công lệnh đang chờ duyệt');
    }

    await DB.WorkOrders.update({ status: 'approved', approvedBy: approverId }, { where: { id } });
    return this.findById(id);
  }

  public async reject(id: number, approverId: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (plain.status !== 'pending') {
      throw new HttpException(400, 'Chỉ có thể từ chối công lệnh đang chờ duyệt');
    }

    await DB.WorkOrders.update({ status: 'rejected', approvedBy: approverId }, { where: { id } });
    return this.findById(id);
  }

  public async uploadEvidence(id: number, requesterId: number, requesterRole: string, fileUrl: string): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (!this.canOperateAsAssignee(plain, requesterId, requesterRole)) {
      throw new HttpException(403, 'Bạn không có quyền upload minh chứng cho công lệnh này');
    }

    if (!['approved', 'in_progress'].includes(plain.status)) {
      throw new HttpException(400, 'Chỉ upload minh chứng khi công lệnh đang thực hiện hoặc chờ xác nhận');
    }

    await DB.WorkOrderAttachments.create({
      workOrderId: id,
      fileUrl,
      uploadedBy: requesterId,
    });

    return this.findById(id);
  }

  public async submitCompletion(id: number, requesterId: number, requesterRole: string): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (!this.canOperateAsAssignee(plain, requesterId, requesterRole)) {
      throw new HttpException(403, 'Bạn không có quyền hoàn thành công lệnh này');
    }

    if (plain.status !== 'approved' && plain.status !== 'rework_requested') {
      throw new HttpException(400, 'Chỉ có thể gửi hoàn thành khi công lệnh đã duyệt hoặc yêu cầu thực hiện lại');
    }

    const evidenceCount = await DB.WorkOrderAttachments.count({
      where: { workOrderId: id, uploadedBy: requesterId },
    });

    if (!evidenceCount) {
      throw new HttpException(400, 'Vui lòng upload ít nhất 1 ảnh minh chứng trước khi hoàn thành');
    }

    // All submissions go to submitted_for_review status for manager review
    const updateData: Partial<WorkOrder> = {
      status: 'submitted_for_review',
      // Record the actual completion action time instead of keeping planned end time.
      endDate: new Date(),
    };

    await DB.WorkOrders.update(updateData, { where: { id } });
    return this.findById(id);
  }

  public async confirmCompletion(id: number, approverId: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (plain.status !== 'submitted_for_review') {
      throw new HttpException(400, 'Công lệnh chưa ở trạng thái chờ xét duyệt hoàn thành');
    }

    await DB.WorkOrders.update(
      {
        status: 'completed',
        approvedBy: approverId,
        // Use server current time for completion timestamp.
        endDate: new Date(),
      },
      { where: { id } },
    );
    return this.findById(id);
  }

  public async requestRework(id: number, approverId: number, reason?: string): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (plain.status !== 'submitted_for_review') {
      throw new HttpException(400, 'Chỉ yêu cầu làm lại khi công lệnh ở trạng thái chờ xét duyệt');
    }

    let note = plain.note ?? '';
    if (reason) {
      const prefix = note ? '\n' : '';
      note = `${note}${prefix}[YEU CAU LAM LAI] ${reason}`;
    }

    await DB.WorkOrders.update({ status: 'rework_requested', approvedBy: approverId, note }, { where: { id } });
    return this.findById(id);
  }

  public async resubmitForRework(id: number, requesterId: number, requesterRole: string): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (!this.canOperateAsAssignee(plain, requesterId, requesterRole)) {
      throw new HttpException(403, 'Bạn không có quyền thực hiện lại công lệnh này');
    }

    if (plain.status !== 'rework_requested') {
      throw new HttpException(400, 'Chỉ có thể tái gửi khi công lệnh ở trạng thái "Yêu cầu thực hiện lại"');
    }

    // Resubmit goes back to submitted_for_review for manager to review again
    await DB.WorkOrders.update(
      {
        status: 'submitted_for_review',
        endDate: new Date(),
      },
      { where: { id } },
    );
    return this.findById(id);
  }

  public async delete(id: number, requesterId: number, requesterRole: string): Promise<void> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    const plain = row.get({ plain: true }) as WorkOrder;
    if (plain.createdBy !== requesterId && !['admin', 'manager'].includes(requesterRole)) {
      throw new HttpException(403, 'Bạn không có quyền xóa công lệnh này');
    }

    await DB.WorkOrders.destroy({ where: { id } });
  }
}
