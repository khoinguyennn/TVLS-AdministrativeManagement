import { Service, Inject } from 'typedi';
import { DB } from '@database';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from '@dtos/work-orders.dto';
import { WorkOrder } from '@interfaces/work-orders.interface';
import { HttpException } from '@exceptions/HttpException';
import { EmailService } from '@services/email.service';

@Service()
export class WorkOrderService {
  @Inject()
  private emailService: EmailService;
  /**
   * Generate unique work order code: WO-YYYYMMDD-XXXX
   */
  private async generateCode(): Promise<string> {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await DB.WorkOrders.count();
    const seq = String(count + 1).padStart(4, '0');
    return `WO-${datePart}-${seq}`;
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
    const code = await this.generateCode();
    const row = await DB.WorkOrders.create({
      code,
      title: data.title,
      content: data.content,
      location: data.location,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
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
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.note !== undefined) updateData.note = data.note;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.status !== undefined) updateData.status = data.status as WorkOrder['status'];

    await DB.WorkOrders.update(updateData, { where: { id } });
    return this.findById(id);
  }

  public async approve(id: number, approverId: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    await DB.WorkOrders.update({ status: 'approved', approvedBy: approverId }, { where: { id } });
    return this.findById(id);
  }

  public async reject(id: number, approverId: number): Promise<WorkOrder> {
    const row = await DB.WorkOrders.findByPk(id);
    if (!row) throw new HttpException(404, 'Công lệnh không tồn tại');

    await DB.WorkOrders.update({ status: 'rejected', approvedBy: approverId }, { where: { id } });
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
