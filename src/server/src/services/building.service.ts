import { Service } from 'typedi';
import { DB } from '@database';
import { CreateBuildingDto, UpdateBuildingDto } from '@dtos/building.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Building } from '@interfaces/facility.interface';

@Service()
export class BuildingService {
  public async findAllBuildings(): Promise<Building[]> {
    const buildings = await DB.Buildings.findAll({
      order: [['id', 'DESC']],
    });
    return buildings.map(b => b.get({ plain: true })) as Building[];
  }

  public async findBuildingById(buildingId: number): Promise<Building> {
    const building = await DB.Buildings.findByPk(buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    return building.get({ plain: true }) as Building;
  }

  public async createBuilding(buildingData: CreateBuildingDto): Promise<Building> {
    const newBuilding = await DB.Buildings.create({
      name: buildingData.name,
      description: buildingData.description,
    });

    return newBuilding.get({ plain: true }) as Building;
  }

  public async updateBuilding(buildingId: number, buildingData: UpdateBuildingDto): Promise<Building> {
    const building = await DB.Buildings.findByPk(buildingId);
    if (!building) throw new HttpException(404, 'Không tìm thấy toà nhà');

    const updateData: Partial<Building> = {};
    if (buildingData.name !== undefined) updateData.name = buildingData.name;
    if (buildingData.description !== undefined) updateData.description = buildingData.description;

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
