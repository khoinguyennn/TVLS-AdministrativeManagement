import { Service } from 'typedi';
import { DB } from '@database';
import { CreateDeviceDto, UpdateDeviceDto } from '@dtos/device.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Device } from '@interfaces/facility.interface';

@Service()
export class DeviceService {
  public async findAllDevices(): Promise<Device[]> {
    const devices = await DB.Devices.findAll({
      order: [['id', 'DESC']],
    });
    return devices.map(d => d.get({ plain: true })) as Device[];
  }

  public async findDeviceById(deviceId: number): Promise<Device> {
    const device = await DB.Devices.findByPk(deviceId);
    if (!device) throw new HttpException(404, 'Không tìm thấy thiết bị');

    return device.get({ plain: true }) as Device;
  }

  public async findDevicesByRoom(roomId: number): Promise<Device[]> {
    const devices = await DB.Devices.findAll({
      where: { roomId },
      order: [['name', 'ASC']],
    });
    return devices.map(d => d.get({ plain: true })) as Device[];
  }

  public async createDevice(deviceData: CreateDeviceDto): Promise<Device> {
    // Check if room exists
    if (deviceData.roomId) {
      const room = await DB.Rooms.findByPk(deviceData.roomId);
      if (!room) throw new HttpException(404, 'Không tìm thấy phòng');
    }

    const newDevice = await DB.Devices.create({
      name: deviceData.name,
      roomId: deviceData.roomId || null,
      status: (deviceData.status as Device['status']) || 'active',
    });

    return newDevice.get({ plain: true }) as Device;
  }

  public async updateDevice(deviceId: number, deviceData: UpdateDeviceDto): Promise<Device> {
    const device = await DB.Devices.findByPk(deviceId);
    if (!device) throw new HttpException(404, 'Không tìm thấy thiết bị');

    // Check if room exists when updating roomId
    if (deviceData.roomId) {
      const room = await DB.Rooms.findByPk(deviceData.roomId);
      if (!room) throw new HttpException(404, 'Không tìm thấy phòng');
    }

    const updateData: Partial<Device> = {};
    if (deviceData.name !== undefined) updateData.name = deviceData.name;
    if (deviceData.roomId !== undefined) updateData.roomId = deviceData.roomId;
    if (deviceData.status !== undefined) updateData.status = deviceData.status as Device['status'];

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.Devices.update(updateData, { where: { id: deviceId } });

    const updatedDevice = await DB.Devices.findByPk(deviceId);
    return updatedDevice.get({ plain: true }) as Device;
  }

  public async deleteDevice(deviceId: number): Promise<Device> {
    const device = await DB.Devices.findByPk(deviceId);
    if (!device) throw new HttpException(404, 'Không tìm thấy thiết bị');

    await DB.Devices.destroy({ where: { id: deviceId } });
    return device.get({ plain: true }) as Device;
  }
}
