import { Service } from 'typedi';
import { DB } from '@database';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/room.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Room } from '@interfaces/facility.interface';

@Service()
export class RoomService {
  public async findAllRooms(): Promise<Room[]> {
    const rooms = await DB.Rooms.findAll({
      order: [['createdAt', 'DESC']],
    });
    return rooms.map(r => r.get({ plain: true })) as Room[];
  }

  public async findRoomById(roomId: number): Promise<Room> {
    const room = await DB.Rooms.findByPk(roomId);
    if (!room) throw new HttpException(404, 'Không tìm thấy phòng');

    return room.get({ plain: true }) as Room;
  }

  public async findRoomsByBuilding(buildingId: number): Promise<Room[]> {
    const rooms = await DB.Rooms.findAll({
      where: { buildingId },
      order: [['floor', 'ASC'], ['name', 'ASC']],
    });
    return rooms.map(r => r.get({ plain: true })) as Room[];
  }

  public async createRoom(roomData: CreateRoomDto): Promise<Room> {
    // Check if building exists
    const building = await DB.Buildings.findByPk(roomData.buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    // Check if room code already exists
    const existingRoom = await DB.Rooms.findOne({ where: { code: roomData.code } });
    if (existingRoom) throw new HttpException(409, `Mã phòng ${roomData.code} đã tồn tại`);

    const newRoom = await DB.Rooms.create({
      buildingId: roomData.buildingId,
      name: roomData.name,
      code: roomData.code,
      floor: roomData.floor,
      capacity: roomData.capacity,
      area: roomData.area,
      type: roomData.type as Room['type'],
      status: (roomData.status as Room['status']) || 'available',
      description: roomData.description,
    });

    return newRoom.get({ plain: true }) as Room;
  }

  public async updateRoom(roomId: number, roomData: UpdateRoomDto): Promise<Room> {
    const room = await DB.Rooms.findByPk(roomId);
    if (!room) throw new HttpException(404, 'Không tìm thấy phòng');

    // Check if building exists when updating buildingId
    if (roomData.buildingId) {
      const building = await DB.Buildings.findByPk(roomData.buildingId);
      if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');
    }

    // Check if room code already exists
    if (roomData.code && roomData.code !== room.code) {
      const existingRoom = await DB.Rooms.findOne({ where: { code: roomData.code } });
      if (existingRoom) throw new HttpException(409, `Mã phòng ${roomData.code} đã tồn tại`);
    }

    const updateData: Partial<Room> = {};
    if (roomData.buildingId !== undefined) updateData.buildingId = roomData.buildingId;
    if (roomData.name !== undefined) updateData.name = roomData.name;
    if (roomData.code !== undefined) updateData.code = roomData.code;
    if (roomData.floor !== undefined) updateData.floor = roomData.floor;
    if (roomData.capacity !== undefined) updateData.capacity = roomData.capacity;
    if (roomData.area !== undefined) updateData.area = roomData.area;
    if (roomData.type !== undefined) updateData.type = roomData.type as Room['type'];
    if (roomData.status !== undefined) updateData.status = roomData.status as Room['status'];
    if (roomData.description !== undefined) updateData.description = roomData.description;

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.Rooms.update(updateData, { where: { id: roomId } });

    const updatedRoom = await DB.Rooms.findByPk(roomId);
    return updatedRoom.get({ plain: true }) as Room;
  }

  public async deleteRoom(roomId: number): Promise<Room> {
    const room = await DB.Rooms.findByPk(roomId);
    if (!room) throw new HttpException(404, 'Không tìm thấy phòng');

    // Check if room has equipment
    const equipmentCount = await DB.Equipment.count({ where: { roomId } });
    if (equipmentCount > 0) {
      throw new HttpException(400, 'Không thể xoá phòng đang có thiết bị');
    }

    await DB.Rooms.destroy({ where: { id: roomId } });
    return room.get({ plain: true }) as Room;
  }
}
