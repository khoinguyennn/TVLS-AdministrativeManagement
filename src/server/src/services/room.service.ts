import { Service } from 'typedi';
import { DB } from '@database';
import { CreateRoomDto, UpdateRoomDto } from '@dtos/room.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Room } from '@interfaces/facility.interface';

@Service()
export class RoomService {
  public async findAllRooms(): Promise<Room[]> {
    const rooms = await DB.Rooms.findAll({
      order: [['id', 'DESC']],
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
      order: [['name', 'ASC']],
    });
    return rooms.map(r => r.get({ plain: true })) as Room[];
  }

  public async createRoom(roomData: CreateRoomDto): Promise<Room> {
    // Check if building exists
    const building = await DB.Buildings.findByPk(roomData.buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    const newRoom = await DB.Rooms.create({
      buildingId: roomData.buildingId,
      name: roomData.name,
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

    const updateData: Partial<Room> = {};
    if (roomData.buildingId !== undefined) updateData.buildingId = roomData.buildingId;
    if (roomData.name !== undefined) updateData.name = roomData.name;

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

    // Check if room has devices
    const deviceCount = await DB.Devices.count({ where: { roomId } });
    if (deviceCount > 0) {
      throw new HttpException(400, 'Không thể xoá phòng đang có thiết bị');
    }

    await DB.Rooms.destroy({ where: { id: roomId } });
    return room.get({ plain: true }) as Room;
  }
}
