import { Service } from 'typedi';

import * as XLSX from 'xlsx';
import { Op } from 'sequelize';
import { hash } from 'bcrypt';
import { DB } from '@database';
import { CreateStaffProfileDto, UpdateStaffProfileDto } from '@dtos/staff.dto';
import { HttpException } from '@exceptions/HttpException';

@Service()
export class StaffService {
  // ─── helpers ────────────────────────────────────────────────────────────────

  /** User include — safe JOIN (belongsTo, always 1 row per profile) */
  private includeUser() {
    return { model: DB.Users, as: 'user', attributes: ['id', 'fullName', 'email', 'role', 'status', 'avatar'] };
  }

  /**
   * Manually load all related data for an array of plain profile objects.
   * Uses individual SELECT … WHERE staff_profile_id IN (…) queries
   * instead of JOINs, completely avoiding the Cartesian product.
   * For hasOne tables that may have duplicate rows, only the latest is kept.
   */
  private async loadRelations(profiles: any[]): Promise<any[]> {
    if (!profiles.length) return profiles;
    const ids = profiles.map(p => p.id);

    const [positions, qualifications, addresses, bankAccounts, evaluations, organizations, salaries] = await Promise.all([
      DB.StaffPositions.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffQualifications.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffAddresses.findAll({ where: { staffProfileId: ids } }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffBankAccounts.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffEvaluations.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffOrganizations.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
      DB.StaffSalaries.findAll({ where: { staffProfileId: ids }, order: [['id', 'DESC']] }).then(r => r.map(x => x.get({ plain: true }))),
    ]);

    // Group by staffProfileId, keeping only the first (latest) for hasOne relations
    const first = <T extends { staffProfileId: number }>(arr: T[], pid: number): T | null =>
      arr.find(r => r.staffProfileId === pid) || null;
    const filter = <T extends { staffProfileId: number }>(arr: T[], pid: number): T[] =>
      arr.filter(r => r.staffProfileId === pid);

    for (const p of profiles) {
      p.position = first(positions as any[], p.id);
      p.qualification = first(qualifications as any[], p.id);
      p.addresses = filter(addresses as any[], p.id);
      p.bankAccount = first(bankAccounts as any[], p.id);
      p.evaluation = first(evaluations as any[], p.id);
      p.organization = first(organizations as any[], p.id);
      p.salary = first(salaries as any[], p.id);
    }
    return profiles;
  }

  // ─── Statistics ──────────────────────────────────────────────────────────────

  public async getStatistics(jobPositionFilter?: string) {
    const rows = await DB.StaffProfiles.findAll({
      include: [
        { model: DB.StaffPositions, as: 'position', attributes: ['subjectGroup', 'educationLevel', 'jobPosition', 'contractType'] },
      ],
      attributes: ['id', 'staffStatus', 'ethnicity', 'dateOfBirth', 'gender'],
      raw: false,
    });

    let profiles = rows.map(r => r.get({ plain: true })) as any[];

    // ── Filter by job position ──
    if (jobPositionFilter && jobPositionFilter !== 'all') {
      if (jobPositionFilter === 'all_no_gvhd') {
        // Toàn trường (không có GVHĐ)
        profiles = profiles.filter(p => p.position?.jobPosition !== 'Giáo viên HĐ');
      } else {
        profiles = profiles.filter(p => p.position?.jobPosition === jobPositionFilter);
      }
    }

    const total = profiles.length;

    // ── By gender ──
    const byGender: Record<string, number> = { male: 0, female: 0, other: 0 };
    for (const p of profiles) {
      const g = p.gender || 'other';
      byGender[g] = (byGender[g] || 0) + 1;
    }

    // ── By status ──
    const byStatus: Record<string, number> = {};
    for (const p of profiles) {
      const s = p.staffStatus || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    }

    // ── By job position ──
    const byJobPosition: Record<string, number> = {};
    for (const p of profiles) {
      const jp = p.position?.jobPosition || 'Chưa cập nhật';
      byJobPosition[jp] = (byJobPosition[jp] || 0) + 1;
    }

    // ── By contract type ──
    const byContractType: Record<string, number> = {};
    for (const p of profiles) {
      const ct = p.position?.contractType || 'Chưa cập nhật';
      byContractType[ct] = (byContractType[ct] || 0) + 1;
    }

    // ── By subject group ──
    const bySubjectGroup: Record<string, number> = {};
    for (const p of profiles) {
      const sg = p.position?.subjectGroup || 'Chưa phân tổ';
      bySubjectGroup[sg] = (bySubjectGroup[sg] || 0) + 1;
    }

    // ── By ethnicity ──
    const byEthnicity: Record<string, number> = {};
    for (const p of profiles) {
      const e = p.ethnicity || 'Chưa cập nhật';
      byEthnicity[e] = (byEthnicity[e] || 0) + 1;
    }

    // ── By education level ──
    const byEducationLevel: Record<string, number> = {};
    for (const p of profiles) {
      const el = p.position?.educationLevel || 'Chưa cập nhật';
      byEducationLevel[el] = (byEducationLevel[el] || 0) + 1;
    }

    // ── Age helpers ──
    const today = new Date();
    const getAge = (dob: string | null): number | null => {
      if (!dob) return null;
      const birth = new Date(dob);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    const ageGroups = ['20-29', '30-39', '40-49', '50-54', '55-59', '60+'];
    const getAgeGroup = (age: number | null): string => {
      if (age === null) return 'Chưa rõ';
      if (age < 20) return 'Chưa rõ';
      if (age <= 29) return '20-29';
      if (age <= 39) return '30-39';
      if (age <= 49) return '40-49';
      if (age <= 54) return '50-54';
      if (age <= 59) return '55-59';
      return '60+';
    };

    // ── By age group ──
    const byAgeGroup: Record<string, number> = {};
    for (const g of ageGroups) byAgeGroup[g] = 0;
    byAgeGroup['Chưa rõ'] = 0;
    for (const p of profiles) {
      const ag = getAgeGroup(getAge(p.dateOfBirth));
      byAgeGroup[ag] = (byAgeGroup[ag] || 0) + 1;
    }

    // ── Age × Education level cross-tab ──
    const educationLevels = ['Mầm non', 'Tiểu học', 'THCS', 'THPT'];
    const ageByEducation: Array<{ ageGroup: string; [key: string]: string | number }> = [];
    for (const ag of ageGroups) {
      const row: any = { ageGroup: ag };
      for (const el of educationLevels) row[el] = 0;
      ageByEducation.push(row);
    }
    for (const p of profiles) {
      const ag = getAgeGroup(getAge(p.dateOfBirth));
      const el = p.position?.educationLevel;
      if (el && educationLevels.includes(el)) {
        const row = ageByEducation.find(r => r.ageGroup === ag);
        if (row) (row[el] as number)++;
      }
    }

    return {
      total,
      byGender,
      byStatus,
      byJobPosition,
      byContractType,
      bySubjectGroup,
      byEthnicity,
      byEducationLevel,
      byAgeGroup,
      ageByEducation,
    };
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  public async findAll(params?: { page?: number; pageSize?: number; search?: string }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const search = params?.search?.trim();

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { staffCode: { [Op.like]: `%${search}%` } },
        { '$user.full_name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } },
      ];
    }

    // Count total matching profiles (with user JOIN for search)
    const count = await DB.StaffProfiles.count({
      where,
      include: [this.includeUser()],
      distinct: true,
    });

    // Fetch paginated profiles with user data only (no child JOINs)
    const rows = await DB.StaffProfiles.findAll({
      where,
      include: [this.includeUser()],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      subQuery: true,
    });

    // Convert to plain objects, then load relations separately
    let profiles = rows.map(r => r.get({ plain: true }));
    profiles = await this.loadRelations(profiles);

    return { data: profiles, total: count, page, pageSize };
  }

  private async findAllUnpaginated() {
    const rows = await DB.StaffProfiles.findAll({
      include: [this.includeUser()],
      order: [['createdAt', 'DESC']],
    });
    let profiles = rows.map(r => r.get({ plain: true }));
    profiles = await this.loadRelations(profiles);
    return profiles;
  }

  public async findById(id: number) {
    const row = await DB.StaffProfiles.findByPk(id, { include: [this.includeUser()] });
    if (!row) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');
    const profiles = await this.loadRelations([row.get({ plain: true })]);
    return profiles[0];
  }

  public async findByUserId(userId: number) {
    const row = await DB.StaffProfiles.findOne({ where: { userId }, include: [this.includeUser()] });
    if (!row) throw new HttpException(404, 'Hồ sơ nhân sự không tồn tại');
    const profiles = await this.loadRelations([row.get({ plain: true })]);
    return profiles[0];
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

  public async upsertMyProfile(userId: number, data: UpdateStaffProfileDto) {
    const profile = await DB.StaffProfiles.findOne({ where: { userId } });
    if (!profile) {
      if (!data.staffCode) throw new HttpException(400, 'Mã định danh là bắt buộc');
      return this.create({ ...data, userId, staffCode: data.staffCode } as CreateStaffProfileDto);
    } else {
      return this.update(profile.get('id') as number, data);
    }
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
      await DB.StaffPositions.destroy({ where: { staffProfileId: id } });
      await DB.StaffPositions.create({ staffProfileId: id, ...data.position });
    }
    if (data.qualification) {
      await DB.StaffQualifications.destroy({ where: { staffProfileId: id } });
      await DB.StaffQualifications.create({ staffProfileId: id, ...data.qualification });
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
      await DB.StaffBankAccounts.destroy({ where: { staffProfileId: id } });
      await DB.StaffBankAccounts.create({ staffProfileId: id, ...data.bankAccount });
    }
    if (data.evaluation) {
      await DB.StaffEvaluations.destroy({ where: { staffProfileId: id } });
      await DB.StaffEvaluations.create({ staffProfileId: id, ...data.evaluation });
    }
    if (data.organization) {
      await DB.StaffOrganizations.destroy({ where: { staffProfileId: id } });
      await DB.StaffOrganizations.create({ staffProfileId: id, ...data.organization });
    }
    if (data.salary) {
      await DB.StaffSalaries.destroy({ where: { staffProfileId: id } });
      await DB.StaffSalaries.create({ staffProfileId: id, ...data.salary });
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
    const profiles = await this.findAllUnpaginated() as any[];

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
