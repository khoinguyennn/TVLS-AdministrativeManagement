import { Service } from 'typedi';
import { DB } from '@database';
import { CreateDeviceReportDto, UpdateDeviceReportDto } from '@dtos/device-reports.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DeviceReport } from '@interfaces/device-reports.interface';
import { EmailService } from '@services/email.service';
import { logger } from '@utils/logger';

@Service()
export class DeviceReportService {
  private emailService = new EmailService();

  // ── Queries ──

  public async findAll(reporterId?: number): Promise<any[]> {
    const where: any = {};
    if (reporterId) where.reporterId = reporterId;

    const reports = await DB.DeviceReports.findAll({
      where,
      include: [
        { model: DB.Users, as: 'reporter', attributes: ['id', 'fullName', 'avatar', 'email'] },
        {
          model: DB.Devices,
          as: 'device',
          attributes: ['id', 'name', 'roomId', 'status'],
          include: [
            {
              model: DB.Rooms,
              as: 'room',
              attributes: ['id', 'name', 'buildingId'],
              include: [{ model: DB.Buildings, as: 'building', attributes: ['id', 'name'] }],
            },
          ],
        },
        { model: DB.Users, as: 'assignee', attributes: ['id', 'fullName', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return reports.map(r => r.get({ plain: true }));
  }

  public async findById(id: number): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id, {
      include: [
        { model: DB.Users, as: 'reporter', attributes: ['id', 'fullName', 'avatar', 'email'] },
        {
          model: DB.Devices,
          as: 'device',
          attributes: ['id', 'name', 'roomId', 'status'],
          include: [
            {
              model: DB.Rooms,
              as: 'room',
              attributes: ['id', 'name', 'buildingId'],
              include: [{ model: DB.Buildings, as: 'building', attributes: ['id', 'name'] }],
            },
          ],
        },
        { model: DB.Users, as: 'assignee', attributes: ['id', 'fullName', 'avatar'] },
      ],
    });
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');
    return report.get({ plain: true });
  }

  public async getStats(reporterId?: number): Promise<{ total: number; pending: number; repairing: number; completed: number }> {
    const where: any = {};
    if (reporterId) where.reporterId = reporterId;

    const total = await DB.DeviceReports.count({ where });
    const pending = await DB.DeviceReports.count({ where: { ...where, status: 'pending' } });
    const repairing = await DB.DeviceReports.count({ where: { ...where, status: ['received', 'repairing', 'recheck_required'] } });
    const completed = await DB.DeviceReports.count({ where: { ...where, status: 'completed' } });
    return { total, pending, repairing, completed };
  }

  // ── Bước 1: Gửi phiếu báo hỏng ──

  public async create(reporterId: number, data: CreateDeviceReportDto): Promise<DeviceReport> {
    const device = await DB.Devices.findByPk(data.deviceId);
    if (!device) throw new HttpException(404, 'Không tìm thấy thiết bị');

    const created = await DB.DeviceReports.create({
      reporterId,
      deviceId: data.deviceId,
      description: data.description,
      imageUrl: data.imageUrl,
    });

    // Gửi email thông báo cho kỹ thuật viên
    const attachments = data.imageUrl
      ? [
          {
            filename: data.imageUrl.split('/').pop() || 'image.jpg',
            path: require('path').join(__dirname, '../../', data.imageUrl), // Resolves to /uploads/reports/...
          },
        ]
      : undefined;

    this.sendEmailToTechnicians(
      'Phiếu báo hỏng mới',
      `
        <h2 style="color: #333; margin: 0 0 20px 0;">Phiếu báo hỏng mới #${created.id}</h2>
        <p style="color: #666; line-height: 1.6;">Có một phiếu báo hỏng thiết bị mới cần được tiếp nhận.</p>
        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Thiết bị:</strong> ${device.name}</p>
          <p style="margin: 5px 0;"><strong>Mô tả:</strong> ${data.description}</p>
          ${data.imageUrl ? `<p style="margin: 5px 0;"><strong>Ảnh đính kèm:</strong> (xem tệp đính kèm bên dưới)</p>` : ''}
        </div>
        <p style="color: #666;">Vui lòng truy cập hệ thống để tiếp nhận và xử lý.</p>
      `,
      attachments
    );

    return created.get({ plain: true }) as DeviceReport;
  }

  // ── Bước 2: Tiếp nhận phiếu ──

  public async receive(id: number, userId: number): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id, {
      include: [
        { model: DB.Users, as: 'reporter', attributes: ['id', 'fullName', 'email'] },
        { model: DB.Devices, as: 'device', attributes: ['id', 'name'] },
      ],
    });
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');
    if (report.status !== 'pending') throw new HttpException(400, 'Phiếu này không ở trạng thái chờ tiếp nhận');

    // Tự động gán kỹ thuật viên là người nhấn tiếp nhận
    await DB.DeviceReports.update({ status: 'received', assignedTo: userId }, { where: { id } });

    // Cập nhật trạng thái thiết bị → đang sửa chữa
    await DB.Devices.update({ status: 'under_repair' }, { where: { id: report.deviceId } });

    // Gửi email cho người báo hỏng
    const reporterEmail = (report as any).reporter?.email;
    const reporterName = (report as any).reporter?.fullName || '';
    const deviceName = (report as any).device?.name || '';
    if (reporterEmail) {
      this.emailService.sendDeviceReportEmail(
        reporterEmail,
        `Phiếu #${id} đã được tiếp nhận`,
        `
          <h2 style="color: #333; margin: 0 0 20px 0;">Xin chào ${reporterName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Bộ phận kỹ thuật đã tiếp nhận thông tin báo hỏng thiết bị <strong>${deviceName}</strong> và đang tiến hành xử lý.
          </p>
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
            <p style="color: #2e7d32; margin: 0;">✅ Phiếu #${id} đã được tiếp nhận</p>
          </div>
          <p style="color: #666;">Chúng tôi sẽ thông báo lại khi có kết quả xử lý.</p>
        `,
      );
    }

    return this.findById(id);
  }

  // ── Bước 4: Cập nhật kết quả sửa chữa ──

  public async updateResult(id: number, status: string, technicianNote?: string): Promise<any> {
    const validStatuses = ['repaired', 'unfixable', 'waiting_replacement'];
    if (!validStatuses.includes(status)) {
      throw new HttpException(400, 'Trạng thái không hợp lệ. Chọn: repaired, unfixable, hoặc waiting_replacement');
    }

    const report = await DB.DeviceReports.findByPk(id, {
      include: [
        { model: DB.Users, as: 'reporter', attributes: ['id', 'fullName', 'email'] },
        { model: DB.Devices, as: 'device', attributes: ['id', 'name'] },
      ],
    });
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');

    const allowedFrom = ['received', 'repairing', 'recheck_required'];
    if (!allowedFrom.includes(report.status)) {
      throw new HttpException(400, 'Phiếu này không ở trạng thái có thể cập nhật kết quả');
    }

    const updateData: any = { status };
    if (technicianNote !== undefined) updateData.technicianNote = technicianNote;

    await DB.DeviceReports.update(updateData, { where: { id } });

    // Cập nhật trạng thái thiết bị
    const deviceStatusMap: Record<string, string> = {
      repaired: 'active',
      unfixable: 'broken',
      waiting_replacement: 'waiting_replacement',
    };
    if (deviceStatusMap[status]) {
      await DB.Devices.update(
        { status: deviceStatusMap[status] as 'active' | 'under_repair' | 'waiting_replacement' | 'broken' },
        { where: { id: report.deviceId } },
      );
    }

    const reporterEmail = (report as any).reporter?.email;
    const reporterName = (report as any).reporter?.fullName || '';
    const deviceName = (report as any).device?.name || '';

    if (status === 'repaired') {
      // Gửi email cho người báo hỏng
      if (reporterEmail) {
        this.emailService.sendDeviceReportEmail(
          reporterEmail,
          `Thiết bị đã được sửa chữa - Phiếu #${id}`,
          `
            <h2 style="color: #333; margin: 0 0 20px 0;">Xin chào ${reporterName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Thiết bị <strong>${deviceName}</strong> đã được sửa chữa.
            </p>
            ${
              technicianNote
                ? `<div style="background-color: #f8f9fa; border-radius: 10px; padding: 15px; margin: 15px 0;"><p style="margin: 0;"><strong>Ghi chú kỹ thuật:</strong> ${technicianNote}</p></div>`
                : ''
            }
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;">⚠️ Vui lòng kiểm tra và xác nhận tình trạng sử dụng thiết bị trên hệ thống.</p>
            </div>
          `,
        );
      }
    } else {
      // unfixable / waiting_replacement → gửi email cho người báo
      const statusLabel = status === 'unfixable' ? 'Không khắc phục được' : 'Chờ thay thế';
      if (reporterEmail) {
        this.emailService.sendDeviceReportEmail(
          reporterEmail,
          `Cập nhật phiếu #${id}: ${statusLabel}`,
          `
            <h2 style="color: #333; margin: 0 0 20px 0;">Xin chào ${reporterName},</h2>
            <p style="color: #666; line-height: 1.6;">
              Thiết bị <strong>${deviceName}</strong> hiện chưa thể khắc phục. Bộ phận kỹ thuật sẽ có phương án xử lý tiếp theo.
            </p>
            <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
              <p style="color: #c62828; margin: 0;">🔧 Trạng thái: <strong>${statusLabel}</strong></p>
            </div>
            ${
              technicianNote
                ? `<div style="background-color: #f8f9fa; border-radius: 10px; padding: 15px; margin: 15px 0;"><p style="margin: 0;"><strong>Ghi chú:</strong> ${technicianNote}</p></div>`
                : ''
            }
          `,
        );
      }
    }

    return this.findById(id);
  }

  // ── Bước 5: Người gửi xác nhận ──

  public async confirm(id: number, userId: number, isWorking: boolean, description?: string): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id, {
      include: [
        { model: DB.Users, as: 'reporter', attributes: ['id', 'fullName', 'email'] },
        { model: DB.Devices, as: 'device', attributes: ['id', 'name'] },
      ],
    });
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');
    if (report.status !== 'repaired') throw new HttpException(400, 'Phiếu này không ở trạng thái chờ xác nhận');
    if (report.reporterId !== userId) throw new HttpException(403, 'Chỉ người báo hỏng mới có thể xác nhận');

    if (isWorking) {
      await DB.DeviceReports.update({ status: 'completed', confirmedAt: new Date() }, { where: { id } });

      // Thiết bị hoạt động bình thường → active
      await DB.Devices.update({ status: 'active' }, { where: { id: report.deviceId } });
    } else {
      const updateData: any = { status: 'recheck_required' };
      if (description) updateData.technicianNote = `[Phản hồi] ${description}`;
      await DB.DeviceReports.update(updateData, { where: { id } });

      // Thiết bị cần sửa lại → under_repair
      await DB.Devices.update({ status: 'under_repair' }, { where: { id: report.deviceId } });

      const deviceName = (report as any).device?.name || '';
      // Gửi email cho kỹ thuật viên phụ trách
      this.sendEmailToAssignee(
        report.assignedTo,
        `Phiếu #${id}: Yêu cầu xử lý lại`,
        `
          <h2 style="color: #333; margin: 0 0 20px 0;">Phiếu #${id} cần xử lý lại</h2>
          <p style="color: #666; line-height: 1.6;">
            Người báo hỏng xác nhận thiết bị <strong>${deviceName}</strong> chưa sử dụng được sau khi sửa chữa.
          </p>
          ${
            description
              ? `<div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;"><p style="color: #856404; margin: 0;">📝 <strong>Mô tả lỗi:</strong> ${description}</p></div>`
              : ''
          }
          <p style="color: #666;">Vui lòng truy cập hệ thống để tiếp tục xử lý.</p>
        `,
      );
    }

    return this.findById(id);
  }

  // ── Generic update (giữ backward compat) ──

  public async update(id: number, data: UpdateDeviceReportDto): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id);
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');

    const updateData: Partial<DeviceReport> = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.status !== undefined) updateData.status = data.status as DeviceReport['status'];
    if (data.technicianNote !== undefined) updateData.technicianNote = data.technicianNote;

    if (data.status === 'completed' && report.status !== 'completed') {
      updateData.confirmedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.DeviceReports.update(updateData, { where: { id } });
    return this.findById(id);
  }

  public async delete(id: number): Promise<DeviceReport> {
    const report = await DB.DeviceReports.findByPk(id);
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');

    const plain = report.get({ plain: true }) as DeviceReport;
    await DB.DeviceReports.destroy({ where: { id } });
    return plain;
  }

  // ── Helpers ──

  /**
   * Lấy danh sách email của kỹ thuật viên để gửi thông báo.
   */
  private async getTechnicianEmails(): Promise<string[]> {
    const technicians = await DB.Users.findAll({
      where: { role: 'technician', status: 'active' },
      attributes: ['email'],
    });
    return technicians.map((u: any) => u.email).filter(Boolean);
  }

  /**
   * Gửi email cho tất cả kỹ thuật viên (fire-and-forget).
   */
  private async sendEmailToTechnicians(
    subject: string,
    bodyContent: string,
    attachments?: { filename: string; path: string }[]
  ): Promise<void> {
    try {
      const emails = await this.getTechnicianEmails();
      if (emails.length > 0) {
        await this.emailService.sendDeviceReportEmail(emails, subject, bodyContent, attachments);
      }
    } catch (error) {
      logger.error(`Failed to send email to technicians: ${error}`);
    }
  }

  /**
   * Gửi email cho kỹ thuật viên phụ trách (assignedTo).
   */
  private async sendEmailToAssignee(assignedTo: number | null, subject: string, bodyContent: string): Promise<void> {
    if (!assignedTo) return;
    try {
      const user = await DB.Users.findByPk(assignedTo, { attributes: ['email'] });
      const email = (user as any)?.email;
      if (email) {
        await this.emailService.sendDeviceReportEmail(email, subject, bodyContent);
      }
    } catch (error) {
      logger.error(`Failed to send email to assignee: ${error}`);
    }
  }
}
