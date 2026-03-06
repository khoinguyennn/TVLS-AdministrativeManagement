export interface PersonnelRecord {
  id: number;
  code: string; // Mã định danh
  fullName: string; // Họ và tên
  gender: "Nam" | "Nữ"; // Giới tính
  dateOfBirth: string; // Ngày sinh (yyyy-MM-dd)
  idNumber: string; // Số CMT/CCCD
  email: string;
  phoneNumber: string; // Điện thoại
  address?: string; // Địa chỉ
  wardCommune?: string; // Tổ/Thôn/Xóm
  district?: string; // Huyện
  province?: string; // Tỉnh
  dateIssued?: string; // Ngày cấp CMT/CCCD
  placeIssued?: string; // Nơi cấp CMT/CCCD
  startDate?: string; // Ngày bắt đầu (yyyy-MM-dd)
  status?: "active" | "inactive"; // Trạng thái
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePersonnelPayload {
  code: string;
  fullName: string;
  gender: "Nam" | "Nữ";
  dateOfBirth: string;
  idNumber: string;
  email: string;
  phoneNumber: string;
  address?: string;
  wardCommune?: string;
  district?: string;
  province?: string;
  dateIssued?: string;
  placeIssued?: string;
  startDate?: string;
  status?: "active" | "inactive";
}

export interface UpdatePersonnelPayload
  extends Partial<CreatePersonnelPayload> {}

export interface PersonnelApiResponse {
  success: boolean;
  data: PersonnelRecord;
  message: string;
}

export interface PersonnelListApiResponse {
  success: boolean;
  data: PersonnelRecord[];
  message: string;
}

export interface PersonnelImportResponse {
  success: boolean;
  data: {
    importedCount: number;
    errors: Array<{ row: number; message: string }>;
  };
  message: string;
}
