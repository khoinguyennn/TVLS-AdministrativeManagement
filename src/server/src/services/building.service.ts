import { Service } from 'typedi';
import { DB } from '@database';
import { CreateBuildingDto, UpdateBuildingDto } from '@dtos/building.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Building } from '@interfaces/facility.interface';

@Service()
export class BuildingService {
  public async findAllBuildings(): Promise<Building[]> {
    const buildings = await DB.Buildings.findAll({
      order: [['createdAt', 'DESC']],
    });
    return buildings.map(b => b.get({ plain: true })) as Building[];
  }

  public async findBuildingById(buildingId: number): Promise<Building> {
    const building = await DB.Buildings.findByPk(buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    return building.get({ plain: true }) as Building;
  }

  public async createBuilding(buildingData: CreateBuildingDto): Promise<Building> {
    const existingBuilding = await DB.Buildings.findOne({ where: { code: buildingData.code } });
    if (existingBuilding) throw new HttpException(409, `Mã toà nhà ${buildingData.code} đã tồn tại`);

    const newBuilding = await DB.Buildings.create({
      name: buildingData.name,
      code: buildingData.code,
      address: buildingData.address,
      floors: buildingData.floors,
      description: buildingData.description,
      status: (buildingData.status as Building['status']) || 'active',
    });

    return newBuilding.get({ plain: true }) as Building;
  }

  public async updateBuilding(buildingId: number, buildingData: UpdateBuildingDto): Promise<Building> {
    const building = await DB.Buildings.findByPk(buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    if (buildingData.code && buildingData.code !== building.code) {
      const existingBuilding = await DB.Buildings.findOne({ where: { code: buildingData.code } });
      if (existingBuilding) throw new HttpException(409, `Mã toà nhà ${buildingData.code} đã tồn tại`);
    }

    const updateData: Partial<Building> = {};
    if (buildingData.name !== undefined) updateData.name = buildingData.name;
    if (buildingData.code !== undefined) updateData.code = buildingData.code;
    if (buildingData.address !== undefined) updateData.address = buildingData.address;
    if (buildingData.floors !== undefined) updateData.floors = buildingData.floors;
    if (buildingData.description !== undefined) updateData.description = buildingData.description;
    if (buildingData.status !== undefined) updateData.status = buildingData.status as Building['status'];

    if (Object.keys(updateData).length === 0) {
      throw new HttpException(400, 'Không có thông tin nào để cập nhật');
    }

    await DB.Buildings.update(updateData, { where: { id: buildingId } });

    const updatedBuilding = await DB.Buildings.findByPk(buildingId);
    return updatedBuilding.get({ plain: true }) as Building;
  }

  public async deleteBuilding(buildingId: number): Promise<Building> {
    const building = await DB.Buildings.findByPk(buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    // Check if building has rooms
    const roomCount = await DB.Rooms.count({ where: { buildingId } });
    if (roomCount > 0) {
      throw new HttpException(400, 'Không thể xoá toà nhà đang có phòng');
    }

    await DB.Buildings.destroy({ where: { id: buildingId } });
    return building.get({ plain: true }) as Building;
  }
}
