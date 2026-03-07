# Hồ sơ Nhân sự - Tài liệu Phát triển

## Tổng Quan

Mô-đun hồ sơ nhân sự cung cấp giao diện quản lý toàn diện để xử lý thông tin nhân sự, bao gồm:
- **Danh sách nhân sự**: Xem tất cả nhân sự với tìm kiếm và lọc
- **Thêm nhân sự**: Tạo mới hồ sơ nhân sự
- **Sửa/Xem chi tiết**: Cập nhật và xem thông tin chi tiết
- **Nhập/Xuất Excel**: Quản lý dữ liệu hàng loạt

## Cấu Trúc Thư Mục

```
src/
├── app/[locale]/(dashboard)/dashboard/
│   └── records/
│       ├── page.tsx                 # Danh sách nhân sự
│       ├── add/
│       │   └── page.tsx             # Trang thêm nhân sự
│       └── [id]/
│           ├── page.tsx             # Xem chi tiết nhân sự
│           └── edit/
│               └── page.tsx         # Trang sửa nhân sự
│
├── components/personnel/
│   ├── index.ts                     # Barrel export
│   ├── personnel-table.tsx          # Component bảng danh sách
│   ├── personnel-form.tsx           # Component form thêm/sửa
│   └── excel-import-export-dialog.tsx # Dialog nhập/xuất Excel
│
├── services/
│   └── personnel.service.ts         # API service
│
└── types/
    └── personnel.types.ts           # Type definitions
```

## Các Component Chính

### 1. PersonnelTable
Bảng hiển thị danh sách nhân sự với các tính năng:
- Hiển thị 10 cột: #, Mã, Tên, Giới tính, Ngày sinh, CCCD, Email, Điện thoại, Trạng thái, Hành động
- Nút hành động: Xem chi tiết, Sửa, Xóa
- Xử lý loading state

**Props:**
- `data: PersonnelRecord[]` - Dữ liệu nhân sự
- `onEdit?: (id: number) => void` - Callback khi sửa
- `onDelete?: (id: number) => void` - Callback khi xóa
- `isLoading?: boolean` - Trạng thái loading

### 2. PersonnelForm
Form để tạo mới hoặc chỉnh sửa nhân sự với validation sử dụng React Hook Form + Zod.

**Các trường form:**
- Mã định danh (bắt buộc)
- Họ và tên (bắt buộc)
- Giới tính (bắt buộc)
- Ngày sinh (bắt buộc)
- Số CMT/CCCD (bắt buộc)
- Ngày cấp CMT/CCCD
- Nơi cấp CMT/CCCD
- Địa chỉ
- Tổ/Thôn/Xóm
- Huyện
- Tỉnh
- Email (bắt buộc, validate email)
- Điện thoại (bắt buộc)
- Ngày bắt đầu
- Trạng thái (hoạt động/không hoạt động)

**Props:**
- `initialData?: PersonnelRecord` - Dữ liệu ban đầu (cho edit)
- `onSubmit: (data: CreatePersonnelPayload) => Promise<void>` - Callback submit
- `isLoading?: boolean` - Trạng thái loading

### 3. ExcelImportExportDialog
Dialog để nhập/xuất dữ liệu Excel với giao diện trực quan.

**Tính năng:**
- Upload file Excel (.xlsx, .xls)
- Xác thực loại file
- Xuất toàn bộ dữ liệu ra CSV
- Hiển thị lỗi/thành công rõ ràng

**Props:**
- `onImport?: (file: File) => Promise<void>` - Callback nhập
- `onExport?: () => Promise<void>` - Callback xuất

## Pages

### 1. /dashboard/records
**Danh sách nhân sự chính**
- Hiển thị bảng toàn bộ nhân sự
- Tìm kiếm theo: tên, mã, email, điện thoại
- Thống kê: tổng số, đang hoạt động, kết quả tìm kiếm
- Nút thêm nhân sự & nhập/xuất Excel

### 2. /dashboard/records/add
**Trang thêm nhân sự mới**
- Form đầy đủ với các trường
- Nút Lưu & Hủy
- Chuyển hướng về danh sách sau khi thêm thành công

### 3. /dashboard/records/[id]
**Xem chi tiết nhân sự**
- Hiển thị thông tin đầy đủ
- Chia các phần: Thông tin cơ bản, Liên hệ, CMT/CCCD, Công việc
- Nút Sửa để chỉnh sửa
- Hiển thị trạng thái

### 4. /dashboard/records/[id]/edit
**Trang sửa nhân sự**
- Form điền sẵn với dữ liệu hiện tại
- Nút Lưu & Hủy
- Chuyển hướng về danh sách sau khi cập nhật

## API Service

**File:** `src/services/personnel.service.ts`

```typescript
personnelService.getAll()          // Lấy toàn bộ nhân sự
personnelService.getById(id)       // Lấy chi tiết nhân sự
personnelService.create(data)      // Tạo nhân sự mới
personnelService.update(id, data)  // Cập nhật nhân sự
personnelService.delete(id)        // Xóa nhân sự
personnelService.importExcel(file) // Nhập từ Excel
personnelService.exportExcel()     // Xuất ra Excel
```

## Types

**File:** `src/types/personnel.types.ts`

```typescript
interface PersonnelRecord {
  id: number
  code: string
  fullName: string
  gender: "Nam" | "Nữ"
  dateOfBirth: string
  idNumber: string
  email: string
  phoneNumber: string
  address?: string
  wardCommune?: string
  district?: string
  province?: string
  dateIssued?: string
  placeIssued?: string
  startDate?: string
  status?: "active" | "inactive"
  createdAt?: string
  updatedAt?: string
}
```

## Dependencies

Các dependencies cần thiết đã có trong `package.json`:
- `react-hook-form` - Quản lý form
- `@hookform/resolvers` - Adapter cho validators
- `zod` - Schema validation
- `shadcn/ui` - UI components
- `lucide-react` - Icons
- `sonner` - Toast notifications

## Hướng Dẫn Sử Dụng

### Kết nối với Backend

1. Uncomment các lệnh API trong `personnel.service.ts`
2. Đảm bảo backend API có các endpoint:
   - `GET /personnel` - Lấy tất cả
   - `GET /personnel/:id` - Lấy theo ID
   - `POST /personnel` - Tạo mới
   - `PUT /personnel/:id` - Cập nhật
   - `DELETE /personnel/:id` - Xóa
   - `POST /personnel/import` - Nhập Excel
   - `GET /personnel/export` - Xuất Excel

### Nâng cấp Validation

Edit `src/components/personnel/personnel-form.tsx` - Schema `personnelFormSchema`:
```typescript
const personnelFormSchema = z.object({
  // Thêm validation rules mới
  code: z.string().min(1, "...").max(50, "..."),
  // ...
});
```

### Tuỳ chỉnh Giao diện

- **Colors**: Sử dụng Tailwind classes
- **Layout**: Thay đổi grid/flex trong JSX
- **Fields**: Thêm/xóa fields trong form

### Quản lý State

Component sử dụng:
- `useState` - Quản lý state cục bộ
- `useEffect` - Load dữ liệu
- `useRouter` - Навigação
- React Query có sẵn (có thể replace useState với queries)

## Mock Data

Hiện tại sử dụng mock data. Để sử dụng data thực:

1. Uncomment lệnh API service
2. Remove mock data từ `page.tsx`
3. Đảm bảo backend sẵn sàng

## Styling

Tất cả components sử dụng:
- Tailwind CSS 4
- shadcn/ui components
- Responsive design (mobile-first)
- Dark mode support được hỗ trợ bởi shadcn/ui

## Lỗi Thường Gặp

### Import không tìm thấy

- Kiểm tra đường dẫn import đúng
- Kiểm tra `@` alias trong `tsconfig.json`

### Form không validate

- Kiểm tra Zod schema
- Kiểm tra FormControl binding

### API call không work

- Kiểm tra endpoint backend
- Kiểm tra CORS settings
- Uncomment API call trong service

## Tối ưu Hóa

- Thêm pagination cho danh sách lớn
- Cache dữ liệu với React Query
- Lazy load components
- Thêm loading skeleton
- Debounce search input

## Future Enhancements

- [ ] Thêm filter nâng cao
- [ ] Bulk actions (xóa nhiều, thay đổi trạng thái)
- [ ] Export PDF
- [ ] Upload avatar
- [ ] Lịch sử thay đổi
- [ ] Ghi chú/comments
- [ ] Audit log
