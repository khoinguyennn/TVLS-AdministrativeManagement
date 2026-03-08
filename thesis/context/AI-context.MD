# AI Context — Hệ thống Quản lý Hành chính Trường Thực hành Sư phạm

> Tài liệu này mô tả toàn bộ ngữ cảnh dự án để AI assistant có thể hiểu nhanh và hỗ trợ chính xác.

---

## 1. Tổng quan dự án

- **Tên**: Hệ thống Quản lý Hành chính — Trường Thực hành Sư phạm (THSP)
- **Mục đích**: Quản lý hồ sơ hành chính, nhân sự, cơ sở vật chất, đơn nghỉ phép, chữ ký số cho trường THSP tại Vĩnh Long
- **Tác giả**: Trầm Khôi Nguyên, Thạch Thị Huệ Trinh, Trần Thị Yến Nhi
- **Repository**: `khoinguyennn/TVLS-AdministrativeManagement` (branch `main`)
- **Primary color**: `#2060df`
- **Default locale**: Vietnamese (`vi`), hỗ trợ English (`en`)

---

## 2. Kiến trúc tổng thể

```
TVLS-AdministrativeManagement/
├── src/
│   ├── client/          ← Next.js 16 Frontend (port 3000)
│   ├── server/          ← Express.js Backend API (port 5000)
│   └── database/        ← DB scripts (nếu có)
└── thesis/              ← Tài liệu luận văn
```

### 2.1. Backend — Express.js + TypeScript

| Thành phần | Công nghệ |
|---|---|
| Framework | Express.js 4 + TypeScript 4.7 |
| ORM | Sequelize 6 + MySQL (mysql2) |
| Auth | JWT (jsonwebtoken) — Access Token (1h) + Refresh Token (7d) |
| DI Container | typedi |
| Validation | class-validator + class-transformer |
| File Upload | multer 2 |
| PDF Generation | pdfkit 0.17 (Times New Roman fonts) |
| Password Hashing | bcrypt |
| Email | nodemailer |
| Google OAuth | google-auth-library |
| API Docs | swagger-jsdoc + swagger-ui-express |
| Logger | winston + winston-daily-rotate-file |
| Dev tools | nodemon, ts-node, swc, sequelize-cli |

**Cấu trúc thư mục backend** (`src/server/src/`):
```
app.ts              ← Express app setup (middlewares, routes, swagger)
server.ts           ← Entry point, khởi tạo routes & listen
config/             ← Env variables (PORT, DB, SECRET_KEY, SMTP, GOOGLE_CLIENT_ID)
controllers/        ← Request handlers
database/
  index.ts          ← Sequelize instance, model init, associations
  migrations/       ← Sequelize CLI migrations
  seeders/          ← Admin seeder
dtos/               ← Data Transfer Objects (class-validator)
exceptions/         ← HttpException
interfaces/         ← TypeScript interfaces
middlewares/
  auth.middleware.ts     ← JWT verification → req.user
  role.middleware.ts     ← RoleMiddleware('admin', 'manager', ...)
  upload.middleware.ts   ← Multer config
  validation.middleware.ts
  error.middleware.ts
models/             ← Sequelize model definitions
routes/             ← Express Router definitions
services/           ← Business logic
assets/fonts/       ← Times New Roman .ttf (cho PDF)
utils/              ← Logger, env validation
```

### 2.2. Frontend — Next.js 16 + Tailwind CSS 4

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) + React 19 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| UI Components | shadcn/ui (Radix UI primitives) |
| HTTP Client | axios |
| State Management | zustand |
| Server State | @tanstack/react-query |
| Forms | react-hook-form + zod |
| i18n | next-intl (vi, en) |
| Theme | next-themes (light/dark) |
| Icons | lucide-react |
| Toasts | react-toastify |
| Auth Storage | js-cookie (accessToken, refreshToken) + localStorage (user) |
| Lint/Format | ESLint 9, Prettier 3, commitlint, husky, lint-staged |
| Package Manager | pnpm |

**Cấu trúc thư mục frontend** (`src/client/src/`):
```
app/
  [locale]/
    (auth)/           ← Login, forgot-password
    (dashboard)/
      dashboard/
        page.tsx              ← Dashboard home
        buildings/            ← Quản lý tòa nhà
        rooms/                ← Quản lý phòng
        devices/              ← Quản lý thiết bị
        equipment/            ← Quản lý trang thiết bị
        device-reports/       ← Báo cáo thiết bị hỏng
        leave-requests/       ← Quản lý nghỉ phép
        digital-signatures/   ← Chữ ký số
        users/                ← Quản lý người dùng
        settings/             ← Cài đặt tài khoản
        staff/                ← Hồ sơ nhân viên
        work-orders/          ← Phiếu công việc
        records/              ← Hồ sơ hành chính
    (main)/           ← Landing page
    layout.tsx
components/
  layout/             ← DashboardSidebar, DashboardHeader, AuthHeader/Footer
  ui/                 ← shadcn/ui components (button, dialog, table, input, ...)
  shared/             ← Shared components
config/               ← site.config.ts, seo.config.ts
constants/            ← i18n.constants.ts, date.constants.ts
env.ts                ← @t3-oss/env-nextjs (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, ...)
helpers/              ← Utility functions
hooks/                ← use-auth, custom hooks
i18n/                 ← next-intl routing, navigation, request
lib/
  api.ts              ← Axios instance + interceptors (auto token refresh)
  auth-storage.ts     ← Cookie/localStorage helpers
  utils.ts            ← cn() helper (clsx + tailwind-merge)
messages/
  vi.json             ← Vietnamese translations
  en.json             ← English translations
providers/            ← IntlProvider, QueryProvider, ThemeProvider
services/             ← API service modules
stores/               ← Zustand stores
styles/               ← tailwind.css (global styles)
types/                ← TypeScript type definitions
```

---

## 3. Database Schema — MySQL (Sequelize ORM)

### 3.1. Models & Relationships

#### `Users`
```typescript
{ id, email, password, fullName, avatar?, role, status, lastLoginAt?, createdAt, updatedAt }
role: 'admin' | 'manager' | 'teacher' | 'technician'
status: 'active' | 'inactive' | 'locked'
```

#### `OTPs` (Password reset)
```
{ id, userId (FK → Users), otp, expiresAt }
```

#### `Buildings`
```
{ id, name, description? }
→ hasMany Rooms
```

#### `Rooms`
```
{ id, buildingId (FK → Buildings), name }
→ hasMany Equipment, hasMany Devices
```

#### `Devices`
```
{ id, name, roomId? (FK → Rooms), status, createdAt, updatedAt }
status: 'active' | 'under_repair' | 'waiting_replacement' | 'broken'
→ hasMany DeviceReports
```

#### `Equipment`
```
{ id, roomId (FK → Rooms), name, code, category, brand?, model?, serialNumber?,
  purchaseDate?, warrantyExpiry?, price?, status, description? }
category: 'computer' | 'projector' | 'furniture' | 'lab-equipment' | 'other'
status: 'working' | 'broken' | 'maintenance' | 'disposed'
```

#### `DeviceReports`
```
{ id, reporterId (FK → Users), deviceId (FK → Devices), description,
  imageUrl?, assignedTo? (FK → Users), status, technicianNote?, confirmedAt? }
status: 'pending' | 'received' | 'repairing' | 'repaired' | 'waiting_replacement' |
        'unfixable' | 'recheck_required' | 'completed'
```

#### `LeaveTypes`
```
{ id, name, maxDaysPerYear? }
```

#### `LeaveRequests`
```
{ id, userId (FK → Users), leaveTypeId (FK → LeaveTypes), startDate, endDate,
  totalDays, reason?, status, approvedBy? (FK → Users), rejectedReason?,
  signedAt?, approverSignedAt?, createdAt, updatedAt }
status: 'pending' | 'approved' | 'rejected'
```
- `signedAt` — Thời điểm người tạo đơn ký số (PIN verification)
- `approverSignedAt` — Thời điểm lãnh đạo ký duyệt (PIN verification)

#### `LeaveBalances`
```
{ id, userId (FK → Users), year, totalDays, usedDays }
```

#### `DigitalSignatures`
```
{ id, entityType ('leave_request'), entityId, signedBy (FK → Users),
  certificateInfo?, documentHash?, signatureValue?, signedAt }
```

#### `SignatureConfigs`
```
{ id, userId (FK → Users), signatureImage?, pinHash? }
```
- `signatureImage` — Đường dẫn file ảnh chữ ký (draw hoặc upload)
- `pinHash` — bcrypt hash của PIN 6 chữ số

### 3.2. Key Associations
```
Users 1:N OTPs
Users 1:N LeaveRequests (as 'user')
Users 1:N LeaveRequests (as 'approver', via approvedBy)
Users 1:N LeaveBalances
Users 1:N DeviceReports (as 'reporter')
Users 1:N DeviceReports (as 'assignee', via assignedTo)
Users 1:1 SignatureConfigs
Users 1:N DigitalSignatures

Buildings 1:N Rooms
Rooms 1:N Equipment
Rooms 1:N Devices
Devices 1:N DeviceReports

LeaveTypes 1:N LeaveRequests
```

---

## 4. API Routes — Backend

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | — | Đăng nhập (email + password) |
| POST | `/auth/signup` | — | Đăng ký |
| POST | `/auth/google` | — | Google OAuth login |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | ✅ | Đăng xuất |

### Password Reset (`/api/password-reset`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/password-reset/request` | — | Gửi OTP qua email |
| POST | `/password-reset/verify` | — | Xác minh OTP |
| POST | `/password-reset/reset` | — | Đặt lại mật khẩu |

### Users (`/api/users`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | ✅ | Lấy danh sách users |
| GET | `/users/:id` | ✅ | Lấy user by ID |
| POST | `/users` | ✅ | Tạo user mới |
| PUT | `/users/:id` | ✅ | Cập nhật user |
| DELETE | `/users/:id` | ✅ | Xóa user |
| PUT | `/users/profile` | ✅ | Cập nhật profile (fullName, avatar) |
| PUT | `/users/password` | ✅ | Đổi mật khẩu |

### Facilities
| Method | Path | Auth | Description |
|---|---|---|---|
| CRUD | `/buildings` | ✅ | Quản lý tòa nhà |
| CRUD | `/rooms` | ✅ | Quản lý phòng |
| CRUD | `/devices` | ✅ | Quản lý thiết bị |
| CRUD | `/equipment` | ✅ | Quản lý trang thiết bị |

### Device Reports (`/api/device-reports`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/device-reports` | ✅ | Danh sách báo cáo |
| GET | `/device-reports/stats` | ✅ | Thống kê |
| POST | `/device-reports` | ✅ | Tạo báo cáo (có upload ảnh) |
| PUT | `/device-reports/:id` | ✅ | Cập nhật báo cáo |
| DELETE | `/device-reports/:id` | ✅ | Xóa báo cáo |

### Leave Requests (`/api/leave-requests`)
| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/leave-requests` | ✅ | all | Danh sách (admin/manager thấy tất cả, user thấy của mình) |
| GET | `/leave-requests/stats` | ✅ | all | Thống kê (filtered by role) |
| POST | `/leave-requests` | ✅ | all | Tạo đơn nghỉ phép |
| PUT | `/leave-requests/:id/approve` | ✅ | admin, manager | Phê duyệt (cần PIN chữ ký) |
| PUT | `/leave-requests/:id/reject` | ✅ | admin, manager | Từ chối (cần PIN chữ ký) |
| PUT | `/leave-requests/:id/sign` | ✅ | all | Người tạo ký đơn (cần PIN) |
| DELETE | `/leave-requests/:id` | ✅ | all | Xóa đơn (chỉ pending) |
| GET | `/leave-requests/:id/pdf` | ✅ | all | Xuất PDF |
| GET | `/leave-types` | ✅ | all | Danh sách loại nghỉ |
| GET | `/leave-balances/:userId/:year` | ✅ | all | Số ngày phép |

### Digital Signatures (`/api/digital-signatures`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/signature-config` | ✅ | Lấy config chữ ký của user |
| POST | `/signature-config/image` | ✅ | Upload/lưu ảnh chữ ký |
| DELETE | `/signature-config/image` | ✅ | Xóa ảnh chữ ký |
| POST | `/signature-config/pin` | ✅ | Thiết lập/đổi PIN |

---

## 5. Authentication Flow

1. **Login**: Client gửi `{ email, password }` → Server trả `{ accessToken, refreshToken, user }`
2. **Storage**: `accessToken` → Cookie (1h), `refreshToken` → Cookie (7d), `user` → localStorage
3. **Request**: Axios interceptor tự gắn `Authorization: Bearer <accessToken>`
4. **Expired**: Axios interceptor bắt 401 → gọi `/auth/refresh` với refreshToken → retry request
5. **Logout**: Xóa cookies + localStorage → redirect `/login`
6. **Google OAuth**: Client gửi Google credential → Server verify → trả JWT tokens

---

## 6. Digital Signature Flow (Chữ ký số)

### 6.1. Setup chữ ký
1. User vào trang `/dashboard/digital-signatures`
2. **Ảnh chữ ký**: Vẽ bằng canvas HOẶC upload file PNG/JPG (max 2MB)
3. **PIN**: Đặt mã PIN 6 chữ số → bcrypt hash → lưu vào `signature_configs.pin_hash`

### 6.2. Người tạo đơn ký
1. Tạo đơn nghỉ phép → status `pending`
2. Click nút "Ký đơn" (PenLine icon) → Dialog nhập PIN 6 số
3. Backend verify PIN via bcrypt → cập nhật `signed_at` → Chữ ký hiển thị trên PDF

### 6.3. Lãnh đạo ký duyệt/từ chối
1. Admin/Manager click "Phê duyệt" hoặc "Từ chối"
2. Dialog nhập PIN 6 số (từ chối thêm lý do)
3. Backend verify PIN → cập nhật `status` + `approver_signed_at`
4. Chữ ký lãnh đạo hiển thị trên PDF cột "PHÊ DUYỆT CỦA LÃNH ĐẠO"

---

## 7. PDF Generation (Đơn nghỉ phép)

- **Service**: `src/server/src/services/leave-pdf.service.ts`
- **Library**: pdfkit
- **Fonts**: Times New Roman (Regular, Bold, Italic) tại `src/server/src/assets/fonts/`
- **Cấu trúc PDF** (theo mẫu Word):
  1. Header: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (Bold, centered)
  2. Slogan: "Độc lập - Tự do - Hạnh phúc" (Bold, centered, underline)
  3. Title: "ĐƠN XIN NGHỈ PHÉP" (Bold, 18pt, centered)
  4. Kính gửi: Bold, centered
  5. Body: Tôi tên, Là, Thuộc tổ, nội dung xin phép, lý do
  6. Cam kết + "Trân trọng cảm ơn!" (Regular)
  7. Ngày tháng: "Vĩnh Long, ngày ... tháng ... năm ..."
  8. 2 cột chữ ký:
     - Trái: "PHÊ DUYỆT CỦA LÃNH ĐẠO" + ảnh chữ ký approver + tên
     - Phải: "Người viết đơn" + "(Ký và ghi rõ họ tên)" + ảnh chữ ký user + tên
  9. Footer: Dòng thông tin hệ thống + ngày in
- **Kích thước chữ ký**: `150×55` pixels (fit)

---

## 8. Role-Based Access Control

| Role | Code | Quyền |
|---|---|---|
| Quản trị viên | `admin` | Toàn quyền: CRUD users, phê duyệt/từ chối đơn, xem tất cả đơn |
| Quản lý | `manager` | Phê duyệt/từ chối đơn, xem tất cả đơn |
| Giáo viên | `teacher` | Tạo đơn, ký đơn, chỉ xem đơn của mình |
| Kỹ thuật viên | `technician` | Tạo đơn, ký đơn, chỉ xem đơn của mình, xử lý báo cáo thiết bị |

- **Middleware**: `RoleMiddleware('admin', 'manager')` trên routes approve/reject
- **Backend filter**: `findAll(userId?)` — admin/manager không truyền userId (xem tất cả), user thường truyền userId (chỉ xem của mình)

---

## 9. Frontend Service Pattern

### Pattern 1 — Wrapped response (device-report, leave, admin-user services):
```typescript
// Service trả về { success, data, message }
const response = await api.get<ApiResponse>("/endpoint");
return response.data; // → { success: true, data: [...], message: "..." }

// Page sử dụng:
const res = await service.getAll();
setState(res.data); // ← .data để lấy array
```

### Pattern 2 — Unwrapped (device, building, room, equipment services):
```typescript
// Service trả về data trực tiếp
const response = await api.get<{ success: boolean; data: Device[] }>("/endpoint");
return response.data.data; // → Device[]

// Page sử dụng:
const devices = await deviceService.getAll();
setState(devices); // ← đã là array, KHÔNG cần .data
```

> ⚠️ **Lưu ý quan trọng**: Khi sử dụng service, phải kiểm tra pattern nào đang dùng để tránh lỗi `Cannot read properties of undefined (reading 'map')`.

---

## 10. Internationalization (i18n)

- **Library**: next-intl
- **Locales**: `vi` (mặc định), `en`
- **Files**: `src/client/src/messages/vi.json`, `en.json`
- **Routing**: `/vi/dashboard/...`, `/en/dashboard/...` (localeDetection: false)
- **Namespaces**: `Auth`, `Dashboard`, `Sidebar`, `UserManagement`, `DeviceReport`, `LeaveRequest`, `DigitalSignature`, `Settings`, `Breadcrumb`, `Common`, ...

---

## 11. Theme & Styling

- **CSS Framework**: Tailwind CSS 4
- **Component Library**: shadcn/ui (Radix UI + Tailwind)
- **Theme**: Light/Dark mode via `next-themes`
- **Primary Color**: `#2060df` (CSS variable `--primary`)
- **Dark mode classes**: `dark:bg-*`, `dark:text-*`
- **UI Components** (shadcn): alert-dialog, avatar, badge, button, card, dialog, dropdown-menu, form, input, label, popover, select, separator, table, tabs, textarea, tooltip

---

## 12. Quy tắc phát triển

### Khi tạo file mới (`create_file`):
- Phải fix CRLF: `node -e "const fs=require('fs');let c=fs.readFileSync('<path>','utf8');c=c.replace(/\r\n/g,'\n');fs.writeFileSync('<path>',c,'utf8')"`

### Khi sửa file:
- Chạy prettier sau khi sửa:
  - Backend: `cd src/server && npx prettier --write "src/<path>"`
  - Frontend: `cd src/client && npx prettier --write "src/<path>"`

### Shell:
- OS: Windows, Shell: PowerShell 5.1
- Nối lệnh: dùng `;` (không phải `&&`)
- `curl` bị alias thành `Invoke-WebRequest` → dùng Node.js cho downloads

### Database migrations:
- Chạy tại `src/server/`: `npx sequelize-cli db:migrate`
- Config: `src/server/src/config/sequelize-cli.js`

### Backend Dev Server:
- `cd src/server && npm run dev` (nodemon, port 5000)

### Frontend Dev Server:
- `cd src/client && pnpm dev` (Turbopack, port 3000)

---

## 13. Ports & Environment

| Service | Port | Base URL |
|---|---|---|
| Backend API | 5000 | `http://localhost:5000/api` |
| Frontend | 3000 | `http://localhost:3000` |
| MySQL | 3306 | — |
| Swagger Docs | 5000 | `http://localhost:5000/api-docs` |

### Backend ENV vars (`.env.development.local`):
```
PORT=5000
SECRET_KEY=<jwt_secret>
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
GOOGLE_CLIENT_ID
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
```

### Frontend ENV vars (`.env.local`):
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google_client_id>
NEXT_PUBLIC_GITHUB_URL=https://github.com/khoinguyennn
```

---

## 14. Trạng thái các tính năng

| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Đăng nhập / Đăng ký | ✅ Hoàn thành | Email + Google OAuth |
| Quên mật khẩu (OTP) | ✅ Hoàn thành | Gửi OTP qua email |
| Dashboard | ✅ Hoàn thành | Trang tổng quan |
| Quản lý người dùng | ✅ Hoàn thành | CRUD + phân quyền |
| Cài đặt tài khoản | ✅ Hoàn thành | Profile, avatar, đổi mật khẩu |
| Quản lý tòa nhà | ✅ Hoàn thành | CRUD |
| Quản lý phòng | ✅ Hoàn thành | CRUD |
| Quản lý thiết bị | ✅ Hoàn thành | CRUD |
| Quản lý trang thiết bị | ✅ Hoàn thành | CRUD |
| Báo cáo thiết bị hỏng | ✅ Hoàn thành | CRUD + upload ảnh + gán kỹ thuật viên |
| Quản lý nghỉ phép | ✅ Hoàn thành | CRUD + phê duyệt/từ chối + role-based filter |
| Chữ ký số | ✅ Hoàn thành | Canvas draw / upload + PIN 6 số |
| Ký đơn nghỉ phép (user) | ✅ Hoàn thành | PIN verification → signedAt |
| Ký duyệt (admin/manager) | ✅ Hoàn thành | PIN verification → approverSignedAt |
| Xuất PDF nghỉ phép | ✅ Hoàn thành | pdfkit + Times New Roman + chữ ký |
| In đơn nghỉ phép | ✅ Hoàn thành | Mở PDF trong tab mới + window.print() |
| Dark mode | ✅ Hoàn thành | next-themes |
| Đa ngôn ngữ (vi/en) | ✅ Hoàn thành | next-intl |
| Hồ sơ nhân viên | 🔲 Chưa làm | Trang `/dashboard/staff` |
| Phiếu công việc | 🔲 Chưa làm | Trang `/dashboard/work-orders` |
| Hồ sơ hành chính | 🔲 Chưa làm | Trang `/dashboard/records` |
