import { Service } from 'typedi';
import { DB } from '@database';
import { HttpException } from '@/exceptions/HttpException';
import { UpdateStaffProfileDto } from '@dtos/staff.dto';

@Service()
export class StaffProfileService {
  /**
   * Lấy thông tin cá nhân đầy đủ của user hiện tại
   */
  public async getMyProfile(userId: number): Promise<any> {
    const profile = await DB.StaffProfiles.findOne({
      where: { userId },
      include: [
        { model: DB.StaffAddresses, as: 'addresses' },
        { model: DB.StaffOrganizations, as: 'organizations' },
        { model: DB.StaffBankAccounts, as: 'bankAccounts' },
        { model: DB.StaffPositions, as: 'positions' },
        { model: DB.StaffQualifications, as: 'qualifications' },
        { model: DB.StaffSalaries, as: 'salaries' },
        { model: DB.StaffEvaluations, as: 'evaluations' }
      ],
    });

    if (!profile) {
      // Chưa có profile → trả về null, frontend sẽ hiển thị form trống
      return null;
    }

    const plain = profile.get({ plain: true }) as any;

    // Tách addresses thành contactAddress và hometownAddress
    const addresses = plain.addresses || [];
    const contactAddress = addresses.find((a: any) => a.addressType === 'contact') || null;
    const hometownAddress = addresses.find((a: any) => a.addressType === 'hometown') || null;

    return {
      ...plain,
      contactAddress,
      hometownAddress,
      addresses: undefined,
    };
  }

  /**
   * Tạo hoặc cập nhật thông tin cá nhân
   */
  public async upsertMyProfile(userId: number, data: UpdateStaffProfileDto): Promise<any> {
    let profile = await DB.StaffProfiles.findOne({ where: { userId } });

    const profileData: any = {};
    if (data.staffCode !== undefined) profileData.staffCode = data.staffCode;
    if (data.gender !== undefined) profileData.gender = data.gender;
    if (data.dateOfBirth !== undefined) profileData.dateOfBirth = data.dateOfBirth || null;
    if (data.cccdNumber !== undefined) profileData.cccdNumber = data.cccdNumber;
    if (data.cccdIssueDate !== undefined) profileData.cccdIssueDate = data.cccdIssueDate || null;
    if (data.cccdIssuePlace !== undefined) profileData.cccdIssuePlace = data.cccdIssuePlace;
    if (data.ethnicity !== undefined) profileData.ethnicity = data.ethnicity;
    if (data.religion !== undefined) profileData.religion = data.religion;
    if (data.staffStatus !== undefined) profileData.staffStatus = data.staffStatus;
    if (data.recruitmentDate !== undefined) profileData.recruitmentDate = data.recruitmentDate || null;

    if (profile) {
      // Update existing
      await DB.StaffProfiles.update(profileData, { where: { id: profile.id } });
      profile = await DB.StaffProfiles.findByPk(profile.id);
    } else {
      // Create new — staffCode is required
      if (!data.staffCode) {
        throw new HttpException(400, 'Mã định danh (staffCode) là bắt buộc khi tạo mới hồ sơ');
      }
      profile = await DB.StaffProfiles.create({
        userId,
        staffCode: data.staffCode,
        ...profileData,
      });
    }

    // Upsert contact address
    if (data.contactAddress) {
      await this.upsertAddress(profile.id, 'contact', data.contactAddress);
    }

    // Upsert hometown address
    if (data.hometownAddress) {
      await this.upsertAddress(profile.id, 'hometown', data.hometownAddress);
    }

    // Upsert organization
    if (data.organizations) {
      await this.upsertOrganization(profile.id, data.organizations);
    }

    if (data.bankAccounts !== undefined) {
      await this.upsertBankAccounts(profile.id, data.bankAccounts);
    }
    if (data.positions !== undefined) {
      await this.upsertPositions(profile.id, data.positions);
    }
    if (data.qualifications !== undefined) {
      await this.upsertQualifications(profile.id, data.qualifications);
    }
    if (data.salaries !== undefined) {
      await this.upsertSalaries(profile.id, data.salaries);
    }
    if (data.evaluations !== undefined) {
      await this.upsertEvaluations(profile.id, data.evaluations);
    }

    return this.getMyProfile(userId);
  }

  /**
   * Tạo hoặc cập nhật địa chỉ
   */
  private async upsertAddress(
    staffProfileId: number,
    addressType: 'contact' | 'hometown',
    data: { province?: string; ward?: string; hamlet?: string; detailAddress?: string; phone?: string },
  ): Promise<void> {
    const existing = await DB.StaffAddresses.findOne({
      where: { staffProfileId, addressType },
    });

    const addressData: any = {
      province: data.province || null,
      ward: data.ward || null,
      hamlet: data.hamlet || null,
      detailAddress: data.detailAddress || null,
    };

    // phone chỉ áp dụng cho contact address
    if (addressType === 'contact') {
      addressData.phone = data.phone || null;
    }

    if (existing) {
      await DB.StaffAddresses.update(addressData, { where: { id: existing.id } });
    } else {
      await DB.StaffAddresses.create({
        staffProfileId,
        addressType,
        ...addressData,
      });
    }
  }

  /**
   * Tạo hoặc cập nhật thông tin đoàn/đảng
   */
  private async upsertOrganization(
    staffProfileId: number,
    data: { isUnionMember?: boolean; unionJoinDate?: string; isPartyMember?: boolean; partyJoinDate?: string },
  ): Promise<void> {
    const existing = await DB.StaffOrganizations.findOne({
      where: { staffProfileId },
    });

    const orgData: any = {};
    if (data.isUnionMember !== undefined) orgData.isUnionMember = data.isUnionMember;
    if (data.unionJoinDate !== undefined) orgData.unionJoinDate = data.unionJoinDate || null;
    if (data.isPartyMember !== undefined) orgData.isPartyMember = data.isPartyMember;
    if (data.partyJoinDate !== undefined) orgData.partyJoinDate = data.partyJoinDate || null;

    if (existing) {
      await DB.StaffOrganizations.update(orgData, { where: { id: existing.id } });
    } else {
      await DB.StaffOrganizations.create({
        staffProfileId,
        ...orgData,
      });
    }
  }

  private async upsertBankAccounts(staffProfileId: number, data: any[]): Promise<void> {
    await DB.StaffBankAccounts.destroy({ where: { staffProfileId } });
    if (data.length > 0) {
      const records = data.map(item => ({ ...item, staffProfileId }));
      await DB.StaffBankAccounts.bulkCreate(records);
    }
  }

  private async upsertPositions(staffProfileId: number, data: any[]): Promise<void> {
    await DB.StaffPositions.destroy({ where: { staffProfileId } });
    if (data.length > 0) {
      const records = data.map(item => ({ ...item, staffProfileId }));
      await DB.StaffPositions.bulkCreate(records);
    }
  }

  private async upsertQualifications(staffProfileId: number, data: any[]): Promise<void> {
    await DB.StaffQualifications.destroy({ where: { staffProfileId } });
    if (data.length > 0) {
      const records = data.map(item => ({ ...item, staffProfileId }));
      await DB.StaffQualifications.bulkCreate(records);
    }
  }

  private async upsertSalaries(staffProfileId: number, data: any[]): Promise<void> {
    await DB.StaffSalaries.destroy({ where: { staffProfileId } });
    if (data.length > 0) {
      const records = data.map(item => ({ ...item, staffProfileId }));
      await DB.StaffSalaries.bulkCreate(records);
    }
  }

  private async upsertEvaluations(staffProfileId: number, data: any[]): Promise<void> {
    await DB.StaffEvaluations.destroy({ where: { staffProfileId } });
    if (data.length > 0) {
      const records = data.map(item => ({ ...item, staffProfileId }));
      await DB.StaffEvaluations.bulkCreate(records);
    }
  }
}
