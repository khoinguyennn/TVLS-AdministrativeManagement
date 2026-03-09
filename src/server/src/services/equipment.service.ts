import { Service } from 'typedi';
import { DB } from '@database';
import { CreateEquipmentDto, UpdateEquipmentDto } from '@dtos/equipment.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Equipment } from '@interfaces/facility.interface';

@Service()
export class EquipmentService {
  public async findAllEquipment(): Promise<Equipment[]> {
    const equipment = await DB.Equipment.findAll({
      order: [['createdAt', 'DESC']],
    });
    return equipment.map(e => e.get({ plain: true })) as Equipment[];
  }

  public async findEquipmentById(equipmentId: number): Promise<Equipment> {
    const equipment = await DB.Equipment.findByPk(equipmentId);
    if (!equipment) throw new HttpException(404, 'Không tìm thấy thiết bị');

    return equipment.get({ plain: true }) as Equipment;
  }

  public async findEquipmentByRoom(roomId: number): Promise<Equipment[]> {
    const equipment = await DB.Equipment.findAll({
      where: { roomId },
      order: [['name', 'ASC']],
    });
    return equipment.map(e => e.get({ plain: true })) as Equipment[];
  }

  public async createEquipment(equipmentData: CreateEquipmentDto): Promise<Equipment> {
    // Check if room exists
    const room = await DB.Rooms.findByPk(equipmentData.roomId);
    if (!room) throw new HttpException(404, 'Không tìm thấy phòng');

    // Check if equipment code already exists
    const existingEquipment = await DB.Equipment.findOne({ where: { code: equipmentData.code } });
    if (existingEquipment) throw new HttpException(409, `Mã thiết bị ${equipmentData.code} đã tồn tại`);

    const newEquipment = await DB.Equipment.create({
      roomId: equipmentData.roomId,
      name: equipmentData.name,
      code: equipmentData.code,
      category: equipmentData.category as Equipment['category'],
      brand: equipmentData.brand,
      model: equipmentData.model,
      serialNumber: equipmentData.serialNumber,
      purchaseDate: equipmentData.purchaseDate ? new Date(equipmentData.purchaseDate) : undefined,
      warrantyExpiry: equipmentData.warrantyExpiry ? new Date(equipmentData.warrantyExpiry) : undefined,
      price: equipmentData.price,
      status: (equipmentData.status as Equipment['status']) || 'working',
      description: equipmentData.description,
    });

    return newEquipment.get({ plain: true }) as Equipment;
  }

  public async updateEquipment(equipmentId: number, equipmentData: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await DB.Equipment.findByPk(equipmentId);
    if (!equipment) throw new HttpException(404, 'Không tìm thấy thiết bị');

    // Check if room exists when updating roomId
    if (equipmentData.roomId) {
      const room = await DB.Rooms.findByPk(equipmentData.roomId);
      if (!room) throw new HttpException(404, 'Không tìm thấy phòng');
    }

    // Check if equipment code already exists
    if (equipmentData.code && equipmentData.code !== equipment.code) {
      const existingEquipment = await DB.Equipment.findOne({ where: { code: equipmentData.code } });
      if (existingEquipment) throw new HttpException(409, `Mã thiết bị ${equipmentData.code} đã tồn tại`);
    }

    const updateData: Partial<Equipment> = {};
    if (equipmentData.roomId !== undefined) updateData.roomId = equipmentData.roomId;
    if (equipmentData.name !== undefined) updateData.name = equipmentData.name;
    if (equipmentData.code !== undefined) updateData.code = equipmentData.code;
    if (equipmentData.category !== undefined) updateData.category = equipmentData.category as Equipment['category'];
    if (equipmentData.brand !== undefined) updateData.brand = equipmentData.brand;
    if (equipmentData.model !== undefined) updateData.model = equipmentData.model;
    if (equipmentData.serialNumber !== undefined) updateData.serialNumber = equipmentData.serialNumber;
    if (equipmentData.purchaseDate !== undefined) updateData.purchaseDate = new Date(equipmentData.purchaseDate);
    if (equipmentData.warrantyExpiry !== undefined) updateData.warrantyExpiry = new Date(equipmentData.warrantyExpiry);
    if (equipmentData.price !== undefined) updateData.price = equipmentData.price;
    if (equipmentData.status !== undefined) updateData.status = equipmentData.status as Equipment['status'];
    if (equipmentData.description !== undefined) updateData.description = equipmentData.description;

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.Equipment.update(updateData, { where: { id: equipmentId } });

    const updatedEquipment = await DB.Equipment.findByPk(equipmentId);
    return updatedEquipment.get({ plain: true }) as Equipment;
  }

  public async deleteEquipment(equipmentId: number): Promise<Equipment> {
    const equipment = await DB.Equipment.findByPk(equipmentId);
    if (!equipment) throw new HttpException(404, 'Không tìm thấy thiết bị');

    await DB.Equipment.destroy({ where: { id: equipmentId } });
    return equipment.get({ plain: true }) as Equipment;
  }
}
