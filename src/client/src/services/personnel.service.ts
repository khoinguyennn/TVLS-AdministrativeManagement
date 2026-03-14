import { api } from "@/lib/api";
import type { PersonnelRecord, CreatePersonnelPayload } from "@/types/personnel.types";

const ENDPOINT = "/staff";

const GENDER_MAP: Record<string, "Nam" | "Nữ" | "Khác"> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transform(s: any): PersonnelRecord {
  const contactAddr = s.addresses?.find((a: any) => a.addressType === "contact");
  const hometownAddr = s.addresses?.find((a: any) => a.addressType === "hometown");
  return {
    id: s.id,
    userId: s.userId,
    code: s.staffCode ?? "",
    fullName: s.user?.fullName ?? "",
    email: s.user?.email ?? "",
    role: s.user?.role ?? "",
    status: s.user?.status ?? "active",
    avatar: s.user?.avatar,
    gender: GENDER_MAP[s.gender] ?? "Khác",
    dateOfBirth: s.dateOfBirth,
    cccdNumber: s.cccdNumber,
    cccdIssueDate: s.cccdIssueDate,
    cccdIssuePlace: s.cccdIssuePlace,
    ethnicity: s.ethnicity,
    religion: s.religion,
    staffStatus: s.staffStatus ?? "working",
    recruitmentDate: s.recruitmentDate,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    contactAddress: contactAddr
      ? {
          province: contactAddr.province,
          ward: contactAddr.ward,
          hamlet: contactAddr.hamlet,
          detailAddress: contactAddr.detailAddress,
          phone: contactAddr.phone,
        }
      : undefined,
    hometownAddress: hometownAddr
      ? {
          province: hometownAddr.province,
          ward: hometownAddr.ward,
          hamlet: hometownAddr.hamlet,
          detailAddress: hometownAddr.detailAddress,
        }
      : undefined,
    bankAccounts: s.bankAccount ? [s.bankAccount] : [],
    evaluations: s.evaluation ? [s.evaluation] : [],
    organizations: s.organization,
    positions: s.position ? [s.position] : [],
    qualifications: s.qualification ? [s.qualification] : [],
    salaries: s.salary ? [s.salary] : [],
  };
}

export const personnelService = {
  async getAll(params?: { page?: number; pageSize?: number; search?: string }): Promise<{ data: PersonnelRecord[]; total: number }> {
    const res = await api.get<{ success: boolean; data: any[]; total: number; message: string }>(ENDPOINT, { params });
    return {
      data: res.data.data.map(transform),
      total: res.data.total,
    };
  },

  async getById(id: number): Promise<PersonnelRecord> {
    const res = await api.get<{ success: boolean; data: any; message: string }>(`${ENDPOINT}/${id}`);
    return transform(res.data.data);
  },

  async create(payload: CreatePersonnelPayload): Promise<PersonnelRecord> {
    const GENDER_TO_API: Record<string, string> = { 'Nam': 'male', 'Nữ': 'female', 'Khác': 'other' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addresses: any[] = [];
    if (payload.contactAddress) addresses.push({ addressType: 'contact', ...payload.contactAddress });
    if (payload.hometownAddress) addresses.push({ addressType: 'hometown', ...payload.hometownAddress });
    const backendPayload = {
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      status: payload.status,
      staffCode: payload.staffCode,
      gender: GENDER_TO_API[payload.gender] ?? 'other',
      dateOfBirth: payload.dateOfBirth,
      cccdNumber: payload.cccdNumber,
      cccdIssueDate: payload.cccdIssueDate,
      cccdIssuePlace: payload.cccdIssuePlace,
      ethnicity: payload.ethnicity,
      religion: payload.religion,
      staffStatus: payload.staffStatus,
      recruitmentDate: payload.recruitmentDate,
      addresses: addresses.length ? addresses : undefined,
      position: payload.positions?.[0],
      qualification: payload.qualifications?.[0],
      bankAccount: payload.bankAccounts?.[0],
      organization: payload.organizations,
      salary: payload.salaries?.[0],
    };
    const res = await api.post<{ success: boolean; data: any; message: string }>(ENDPOINT, backendPayload);
    return transform(res.data.data);
  },

  async update(id: number, payload: CreatePersonnelPayload): Promise<PersonnelRecord> {
    const GENDER_TO_API: Record<string, string> = { 'Nam': 'male', 'Nữ': 'female', 'Khác': 'other' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addresses: any[] = [];
    if (payload.contactAddress) addresses.push({ addressType: 'contact', ...payload.contactAddress });
    if (payload.hometownAddress) addresses.push({ addressType: 'hometown', ...payload.hometownAddress });
    const backendPayload = {
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
      status: payload.status,
      staffCode: payload.staffCode,
      gender: GENDER_TO_API[payload.gender] ?? 'other',
      dateOfBirth: payload.dateOfBirth,
      cccdNumber: payload.cccdNumber,
      cccdIssueDate: payload.cccdIssueDate,
      cccdIssuePlace: payload.cccdIssuePlace,
      ethnicity: payload.ethnicity,
      religion: payload.religion,
      staffStatus: payload.staffStatus,
      recruitmentDate: payload.recruitmentDate,
      addresses: addresses.length ? addresses : undefined,
      position: payload.positions?.[0],
      qualification: payload.qualifications?.[0],
      bankAccount: payload.bankAccounts?.[0],
      organization: payload.organizations,
      salary: payload.salaries?.[0],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await api.put<{ success: boolean; data: any; message: string }>(`${ENDPOINT}/${id}`, backendPayload);
    return transform(res.data.data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`);
  },

  async importExcel(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ success: boolean; data: { success: number; errors: string[] }; message: string }>(
      `${ENDPOINT}/excel/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  async exportExcel(): Promise<Blob> {
    const res = await api.get(`${ENDPOINT}/excel/export`, { responseType: "blob" });
    return res.data;
  },

  async downloadTemplate(): Promise<Blob> {
    const res = await api.get(`${ENDPOINT}/excel/template`, { responseType: "blob" });
    return res.data;
  },
};
