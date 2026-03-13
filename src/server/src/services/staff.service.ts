import { Service } from 'typedi';

import * as XLSX from 'xlsx';
import { hash } from 'bcrypt';
import { DB } from '@database';
import { CreateStaffProfileDto, UpdateStaffProfileDto } from '@dtos/staff.dto';
import { HttpException } from '@exceptions/HttpException';

@Service()
export class StaffService {
  // ─── helpers ────────────────────────────────────────────────────────────────

  private includeAll() {
    return [
      { model: DB.Users, as: 'user', attributes: ['id', 'fullName', 'email', 'role', 'status', 'avatar'] },
      { model: DB.StaffPositions, as: 'position' },
      { model: DB.StaffQualifications, as: 'qualification' },
      { model: DB.StaffAddresses, as: 'addresses' },
      { model: DB.StaffBankAccounts, as: 'bankAccount' },
      { model: DB.StaffEvaluations, as: 'evaluation' },
      { model: DB.StaffOrganizations, as: 'organization' },
      { model: DB.StaffSalaries, as: 'salary' },
    ];
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  public async findAll() {
    const rows = await DB.StaffProfiles.findAll({
      include: this.includeAll(),
      order: [['createdAt', 'DESC']],
    });
    return rows.map(r => r.get({ plain: true }));
  }

  public async findById(id: number) {
    const row = await DB.StaffProfiles.findByPk(id, { include: this.includeAll() });
    if (!row) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');
    return row.get({ plain: true });
  }

  public async findByUserId(userId: number) {
    const row = await DB.StaffProfiles.findOne({ where: { userId }, include: this.includeAll() });
    if (!row) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');
    return row.get({ plain: true });
  }

  public async create(data: CreateStaffProfileDto) {
    // Check duplicate staffCode
    const existing = await DB.StaffProfiles.findOne({ where: { staffCode: data.staffCode } });
    if (existing) throw new HttpException(409, `Mã nhân viên ${data.staffCode} đã tồn tại`);

    // Resolve userId: use provided userId, or find/create user by email
    let resolvedUserId: number = data.userId as number;
    if (!resolvedUserId) {
      if (!data.email) throw new HttpException(400, 'userId hoặc email là bắt buộc');
      const existingUser = await DB.Users.findOne({ where: { email: data.email } });
      if (existingUser) {
        resolvedUserId = existingUser.get('id') as number;
      } else {
        const defaultPassword = await hash('Abc@123456', 10);
        const newUser = await DB.Users.create({
          email: data.email,
          password: defaultPassword,
          fullName: data.fullName || data.email.split('@')[0],
          role: (data.role as 'admin' | 'manager' | 'teacher' | 'technician') || 'teacher',
          status: (data.status as 'active' | 'inactive' | 'locked') || 'active',
        } as any);
        resolvedUserId = newUser.get('id') as number;
      }
    } else {
      // Check user exists
      const user = await DB.Users.findByPk(resolvedUserId);
      if (!user) throw new HttpException(404, 'Người dùng không tồn tại');
    }

    // Check user already has profile
    const existingProfile = await DB.StaffProfiles.findOne({ where: { userId: resolvedUserId } });
    if (existingProfile) throw new HttpException(409, 'Người dùng đã có hồ sơ nhân sự');

    const profile = await DB.StaffProfiles.create({
      userId: resolvedUserId,
      staffCode: data.staffCode,
      gender: data.gender as 'male' | 'female' | 'other',
      dateOfBirth: data.dateOfBirth,
      cccdNumber: data.cccdNumber,
      cccdIssueDate: data.cccdIssueDate,
      cccdIssuePlace: data.cccdIssuePlace,
      ethnicity: data.ethnicity,
      religion: data.religion,
      staffStatus: (data.staffStatus as 'working' | 'probation' | 'maternity_leave' | 'retired' | 'resigned') || 'working',
      recruitmentDate: data.recruitmentDate,
    });

    const profileId = profile.get('id') as number;

    if (data.position) await DB.StaffPositions.create({ staffProfileId: profileId, ...data.position });
    if (data.qualification) await DB.StaffQualifications.create({ staffProfileId: profileId, ...data.qualification });
    if (data.addresses?.length) {
      for (const addr of data.addresses) {
        await DB.StaffAddresses.create({
          staffProfileId: profileId,
          addressType: addr.addressType as 'contact' | 'hometown',
          province: addr.province,
          ward: addr.ward,
          hamlet: addr.hamlet,
          detailAddress: addr.detailAddress,
          phone: addr.phone,
        });
      }
    }
    if (data.bankAccount) await DB.StaffBankAccounts.create({ staffProfileId: profileId, ...data.bankAccount });
    if (data.evaluation) await DB.StaffEvaluations.create({ staffProfileId: profileId, ...data.evaluation });
    if (data.organization) await DB.StaffOrganizations.create({ staffProfileId: profileId, ...data.organization });
    if (data.salary) await DB.StaffSalaries.create({ staffProfileId: profileId, ...data.salary });

    return this.findById(profileId);
  }

  public async update(id: number, data: UpdateStaffProfileDto) {
    const profile = await DB.StaffProfiles.findByPk(id);
    if (!profile) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');

    // Check duplicate staffCode
    if (data.staffCode) {
      const existing = await DB.StaffProfiles.findOne({ where: { staffCode: data.staffCode } });
      if (existing && (existing.get('id') as number) !== id) {
        throw new HttpException(409, `Mã nhân viên ${data.staffCode} đã tồn tại`);
      }
    }

    await DB.StaffProfiles.update(
      {
        staffCode: data.staffCode,
        gender: data.gender as 'male' | 'female' | 'other',
        dateOfBirth: data.dateOfBirth,
        cccdNumber: data.cccdNumber,
        cccdIssueDate: data.cccdIssueDate,
        cccdIssuePlace: data.cccdIssuePlace,
        ethnicity: data.ethnicity,
        religion: data.religion,
        staffStatus: data.staffStatus as 'working' | 'probation' | 'maternity_leave' | 'retired' | 'resigned',
        recruitmentDate: data.recruitmentDate,
      },
      { where: { id } },
    );

    if (data.position) {
      await DB.StaffPositions.upsert({ staffProfileId: id, ...data.position });
    }
    if (data.qualification) {
      await DB.StaffQualifications.upsert({ staffProfileId: id, ...data.qualification });
    }
    if (data.addresses) {
      await DB.StaffAddresses.destroy({ where: { staffProfileId: id } });
      for (const addr of data.addresses) {
        await DB.StaffAddresses.create({
          staffProfileId: id,
          addressType: addr.addressType as 'contact' | 'hometown',
          province: addr.province,
          ward: addr.ward,
          hamlet: addr.hamlet,
          detailAddress: addr.detailAddress,
          phone: addr.phone,
        });
      }
    }
    if (data.bankAccount) {
      await DB.StaffBankAccounts.upsert({ staffProfileId: id, ...data.bankAccount });
    }
    if (data.evaluation) {
      await DB.StaffEvaluations.upsert({ staffProfileId: id, ...data.evaluation });
    }
    if (data.organization) {
      await DB.StaffOrganizations.upsert({ staffProfileId: id, ...data.organization });
    }
    if (data.salary) {
      await DB.StaffSalaries.upsert({ staffProfileId: id, ...data.salary });
    }

    return this.findById(id);
  }

  public async delete(id: number) {
    const profile = await DB.StaffProfiles.findByPk(id);
    if (!profile) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');
    await DB.StaffProfiles.destroy({ where: { id } });
  }

  // ─── Excel Export ─────────────────────────────────────────────────────────────

  public async exportExcel(): Promise<Buffer> {
    const profiles = await this.findAll() as any[];

    const rows = profiles.map(p => ({
      'Mã nhân viên': p.staffCode || '',
      'Họ và tên': p.user?.fullName || '',
      'Email': p.user?.email || '',
      'Vai trò': p.user?.role || '',
      'Giới tính': p.gender === 'male' ? 'Nam' : p.gender === 'female' ? 'Nữ' : 'Khác',
      'Ngày sinh': p.dateOfBirth || '',
      'Số CCCD': p.cccdNumber || '',
      'Ngày cấp CCCD': p.cccdIssueDate || '',
      'Nơi cấp CCCD': p.cccdIssuePlace || '',
      'Dân tộc': p.ethnicity || '',
      'Tôn giáo': p.religion || '',
      'Trạng thái': p.staffStatus || '',
      'Ngày tuyển dụng': p.recruitmentDate || '',
      // Position
      'Chức vụ': p.position?.jobPosition || '',
      'Nhóm chức vụ': p.position?.positionGroup || '',
      'Loại hợp đồng': p.position?.contractType || '',
      'Hệ số lương': p.position?.rankLevel || '',
      // Qualification
      'Trình độ chuyên môn': p.qualification?.professionalLevel || '',
      'Ngành đào tạo': p.qualification?.major || '',
      'Nơi đào tạo': p.qualification?.trainingPlace || '',
      'Năm tốt nghiệp': p.qualification?.graduationYear || '',
      'Trình độ CNTT': p.qualification?.itLevel || '',
      'Ngoại ngữ': p.qualification?.foreignLanguageLevel || '',
      // Salary
      'Hệ số lương (lương)': p.salary?.salaryCoefficient || '',
      'Bậc lương': p.salary?.salaryLevel || '',
      'Lương cơ bản': p.salary?.baseSalary || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Hồ sơ nhân sự');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  // ─── Excel Import ─────────────────────────────────────────────────────────────

  public async importExcel(fileBuffer: Buffer): Promise<{ success: number; errors: string[] }> {
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1-indexed header + 1)

      try {
        const staffCode = String(row['Mã nhân viên'] || '').trim();
        const email = String(row['Email'] || '').trim();

        if (!staffCode) {
          errors.push(`Hàng ${rowNum}: Thiếu mã nhân viên`);
          continue;
        }
        if (!email) {
          errors.push(`Hàng ${rowNum}: Thiếu email`);
          continue;
        }

        // Find user by email
        const user = await DB.Users.findOne({ where: { email } });
        if (!user) {
          errors.push(`Hàng ${rowNum}: Không tìm thấy người dùng với email ${email}`);
          continue;
        }

        const userId = user.get('id') as number;

        // Check if profile already exists
        const existingProfile = await DB.StaffProfiles.findOne({ where: { userId } });
        if (existingProfile) {
          // Update existing
          const pid = existingProfile.get('id') as number;
          await this.update(pid, this.rowToDto(row, userId, staffCode));
        } else {
          await this.create(this.rowToDto(row, userId, staffCode));
        }

        successCount++;
      } catch (err: any) {
        errors.push(`Hàng ${rowNum}: ${err.message}`);
      }
    }

    return { success: successCount, errors };
  }

  private rowToDto(row: Record<string, unknown>, userId: number, staffCode: string): CreateStaffProfileDto {
    const genderRaw = String(row['Giới tính'] || '').toLowerCase();
    const gender = genderRaw === 'nam' ? 'male' : genderRaw === 'nữ' ? 'female' : 'other';

    const statusRaw = String(row['Trạng thái'] || 'working').trim();
    const allowedStatuses = ['working', 'probation', 'maternity_leave', 'retired', 'resigned'];
    const staffStatus = allowedStatuses.includes(statusRaw) ? statusRaw : 'working';

    const toDateStr = (v: unknown): string | undefined => {
      if (!v) return undefined;
      const s = String(v).trim();
      if (!s) return undefined;
      // Handle Excel serial dates
      if (!isNaN(Number(s))) {
        const d = XLSX.SSF.parse_date_code(Number(s));
        if (d) {
          return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        }
      }
      return s;
    };

    const dto: CreateStaffProfileDto = {
      userId,
      staffCode,
      gender: gender as 'male' | 'female' | 'other',
      dateOfBirth: toDateStr(row['Ngày sinh']),
      cccdNumber: String(row['Số CCCD'] || '').trim() || undefined,
      cccdIssueDate: toDateStr(row['Ngày cấp CCCD']),
      cccdIssuePlace: String(row['Nơi cấp CCCD'] || '').trim() || undefined,
      ethnicity: String(row['Dân tộc'] || '').trim() || undefined,
      religion: String(row['Tôn giáo'] || '').trim() || undefined,
      staffStatus,
      recruitmentDate: toDateStr(row['Ngày tuyển dụng']),
    };

    // Position
    if (row['Chức vụ'] || row['Loại hợp đồng']) {
      dto.position = {
        jobPosition: String(row['Chức vụ'] || '').trim() || undefined,
        positionGroup: String(row['Nhóm chức vụ'] || '').trim() || undefined,
        contractType: String(row['Loại hợp đồng'] || '').trim() || undefined,
        rankLevel: String(row['Hệ số lương'] || '').trim() || undefined,
      };
    }

    // Qualification
    if (row['Trình độ chuyên môn'] || row['Ngành đào tạo']) {
      dto.qualification = {
        professionalLevel: String(row['Trình độ chuyên môn'] || '').trim() || undefined,
        major: String(row['Ngành đào tạo'] || '').trim() || undefined,
        trainingPlace: String(row['Nơi đào tạo'] || '').trim() || undefined,
        graduationYear: row['Năm tốt nghiệp'] ? Number(row['Năm tốt nghiệp']) : undefined,
        itLevel: String(row['Trình độ CNTT'] || '').trim() || undefined,
        foreignLanguageLevel: String(row['Ngoại ngữ'] || '').trim() || undefined,
      };
    }

    // Salary
    if (row['Lương cơ bản'] || row['Hệ số lương (lương)']) {
      dto.salary = {
        salaryCoefficient: row['Hệ số lương (lương)'] ? Number(row['Hệ số lương (lương)']) : undefined,
        salaryLevel: row['Bậc lương'] ? Number(row['Bậc lương']) : undefined,
        baseSalary: row['Lương cơ bản'] ? Number(row['Lương cơ bản']) : undefined,
      };
    }

    return dto;
  }

  // ─── Excel Template ────────────────────────────────────────────────────────────

  public generateImportTemplate(): Buffer {
    const headers = [
      'Mã nhân viên',
      'Email',
      'Giới tính',
      'Ngày sinh',
      'Số CCCD',
      'Ngày cấp CCCD',
      'Nơi cấp CCCD',
      'Dân tộc',
      'Tôn giáo',
      'Trạng thái',
      'Ngày tuyển dụng',
      'Chức vụ',
      'Nhóm chức vụ',
      'Loại hợp đồng',
      'Hệ số lương',
      'Trình độ chuyên môn',
      'Ngành đào tạo',
      'Nơi đào tạo',
      'Năm tốt nghiệp',
      'Trình độ CNTT',
      'Ngoại ngữ',
      'Hệ số lương (lương)',
      'Bậc lương',
      'Lương cơ bản',
    ];

    const example = {
      'Mã nhân viên': 'NV001',
      'Email': 'staff@example.com',
      'Giới tính': 'Nam',
      'Ngày sinh': '1990-01-15',
      'Số CCCD': '012345678901',
      'Ngày cấp CCCD': '2020-01-01',
      'Nơi cấp CCCD': 'Cục cảnh sát QLHC về TTXH',
      'Dân tộc': 'Kinh',
      'Tôn giáo': 'Không',
      'Trạng thái': 'working',
      'Ngày tuyển dụng': '2020-09-01',
      'Chức vụ': 'Giáo viên',
      'Nhóm chức vụ': 'Giáo viên',
      'Loại hợp đồng': 'Viên chức',
      'Hệ số lương': '2.34',
      'Trình độ chuyên môn': 'Đại học',
      'Ngành đào tạo': 'Sư phạm Toán',
      'Nơi đào tạo': 'Đại học Cần Thơ',
      'Năm tốt nghiệp': 2015,
      'Trình độ CNTT': 'Cơ bản',
      'Ngoại ngữ': 'Tiếng Anh B1',
      'Hệ số lương (lương)': 2.34,
      'Bậc lương': 2,
      'Lương cơ bản': 2340000,
    };

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([example], { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu nhập liệu');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;  }
}
