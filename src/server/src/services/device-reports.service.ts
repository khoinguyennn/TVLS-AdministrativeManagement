import { Service } from 'typedi';
import { DB } from '@database';
import { CreateDeviceReportDto, UpdateDeviceReportDto } from '@dtos/device-reports.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DeviceReport } from '@interfaces/device-reports.interface';

@Service()
export class DeviceReportService {
  public async findAll(): Promise<any[]> {
    const reports = await DB.DeviceReports.findAll({
      include: [
        {
          model: DB.Users,
          as: 'reporter',
          attributes: ['id', 'fullName', 'avatar'],
        },
        {
          model: DB.Devices,
          as: 'device',
          attributes: ['id', 'name', 'roomId', 'status'],
        },
        {
          model: DB.Users,
          as: 'assignee',
          attributes: ['id', 'fullName', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return reports.map(r => r.get({ plain: true }));
  }

  public async findById(id: number): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id, {
      include: [
        {
          model: DB.Users,
          as: 'reporter',
          attributes: ['id', 'fullName', 'avatar'],
        },
        {
          model: DB.Devices,
          as: 'device',
          attributes: ['id', 'name', 'roomId', 'status'],
        },
        {
          model: DB.Users,
          as: 'assignee',
          attributes: ['id', 'fullName', 'avatar'],
        },
      ],
    });
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');
    return report.get({ plain: true });
  }

  public async create(reporterId: number, data: CreateDeviceReportDto): Promise<DeviceReport> {
    // Verify device exists
    const device = await DB.Devices.findByPk(data.deviceId);
    if (!device) throw new HttpException(404, 'Không tìm thấy thiết bị');

    const created = await DB.DeviceReports.create({
      reporterId,
      deviceId: data.deviceId,
      description: data.description,
      imageUrl: data.imageUrl,
    });

    return created.get({ plain: true }) as DeviceReport;
  }

  public async update(id: number, data: UpdateDeviceReportDto): Promise<any> {
    const report = await DB.DeviceReports.findByPk(id);
    if (!report) throw new HttpException(404, 'Không tìm thấy phiếu báo hỏng');

    const updateData: Partial<DeviceReport> = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.status !== undefined) updateData.status = data.status as DeviceReport['status'];
    if (data.technicianNote !== undefined) updateData.technicianNote = data.technicianNote;

    // Auto-set confirmedAt when completed
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

  public async getStats(): Promise<{ total: number; pending: number; repairing: number; completed: number }> {
    const total = await DB.DeviceReports.count();
    const pending = await DB.DeviceReports.count({ where: { status: 'pending' } });
    const repairing = await DB.DeviceReports.count({ where: { status: 'repairing' } });
    const completed = await DB.DeviceReports.count({ where: { status: 'completed' } });
    return { total, pending, repairing, completed };
  }
}
