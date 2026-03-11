# 🏫 Hệ Thống Quản Lý Hành Chính - Trường Thực Hành Sư Phạm

<div align="center">

<img src="./thesis/png/logothsp.png" alt="Logo Trường Thực Hành Sư Phạm" width="200"/>

<h3>HỆ THỐNG QUẢN LÝ HÀNH CHÍNH</h3>
<h4>TRƯỜNG THỰC HÀNH SƯ PHẠM - ĐẠI HỌC TRÀ VINH</h4>

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

**Hệ thống quản lý hành chính toàn diện cho Trường Thực Hành Sư Phạm**

[Tính năng](#-tính-năng) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cài đặt](#-cài-đặt) • [Hướng dẫn](#-hướng-dẫn-sử-dụng) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [API Documentation](#-api-documentation)
- [Bảo mật](#-bảo-mật)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

---

## 🎯 Giới thiệu

Hệ thống Quản lý Hành chính là một giải pháp phần mềm toàn diện được phát triển riêng cho Trường Thực Hành Sư Phạm, nhằm số hóa và tối ưu hóa các quy trình quản lý hành chính, nhân sự, cơ sở vật chất và tài liệu điện tử.

### 🎓 Về Trường Thực Hành Sư Phạm

Trường Thực Hành Sư Phạm là một đơn vị giáo dục trực thuộc Đại học Trà Vinh, chuyên đào tạo và thực hành sư phạm cho sinh viên ngành giáo dục. Hệ thống này được thiết kế để đáp ứng nhu cầu quản lý đặc thù của môi trường giáo dục thực hành.

### 🎯 Mục tiêu dự án

- ✅ Số hóa quy trình quản lý hành chính
- ✅ Tăng hiệu quả làm việc của cán bộ, giáo viên
- ✅ Quản lý hồ sơ nhân sự điện tử
- ✅ Theo dõi cơ sở vật chất, thiết bị
- ✅ Quản lý đơn nghỉ phép và chữ ký số
- ✅ Báo cáo và thống kê tự động

---

## ✨ Tính năng

### 👥 Quản lý Người dùng
- Quản lý tài khoản cán bộ, giáo viên, kỹ thuật viên
- Phân quyền theo vai trò (Admin, Manager, Teacher, Technician)
- Quản lý thông tin cá nhân và avatar
- Đổi mật khẩu và bảo mật tài khoản

### 📁 Quản lý Hồ sơ Nhân sự
- Lưu trữ hồ sơ điện tử đầy đủ
- Quản lý thông tin cá nhân, trình độ, chức vụ
- Theo dõi lương, phụ cấp, đánh giá
- Import/Export dữ liệu Excel

### 🏢 Quản lý Cơ sở Vật chất
- **Quản lý Toà nhà**: Danh sách các toà nhà trong trường
- **Quản lý Phòng học**: Phân bổ phòng theo toà nhà
- **Quản lý Thiết bị**: Theo dõi thiết bị trong từng phòng
- Trạng thái thiết bị (Hoạt động, Đang sửa, Chờ thay thế, Hỏng)

### 🔧 Quản lý Báo cáo Sự cố
- Báo cáo thiết bị hỏng hóc
- Phân công kỹ thuật viên xử lý
- Theo dõi tiến độ sửa chữa
- Xác nhận hoàn thành công việc
- Upload hình ảnh minh chứng

### 📝 Quản lý Đơn Nghỉ phép
- Tạo đơn nghỉ phép trực tuyến
- Phê duyệt/Từ chối đơn
- Chữ ký số điện tử
- Xuất PDF đơn nghỉ phép
- Theo dõi số ngày phép còn lại

### ✍️ Chữ ký Số
- Thiết lập chữ ký cá nhân
- Vẽ hoặc upload chữ ký
- Bảo mật bằng mã PIN
- Ký điện tử trên tài liệu

### 📊 Báo cáo & Thống kê
- Dashboard tổng quan
- Thống kê theo thời gian
- Báo cáo thiết bị, nhân sự
- Export dữ liệu

### 🌐 Đa ngôn ngữ
- Hỗ trợ Tiếng Việt và Tiếng Anh
- Chuyển đổi ngôn ngữ dễ dàng
- Giao diện thân thiện

### 🎨 Giao diện
- Responsive design (Desktop, Tablet, Mobile)
- Dark mode / Light mode
- UI/UX hiện đại với Shadcn/UI
- Animations mượt mà

---

## 🛠 Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Component Library**: Shadcn/UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **Internationalization**: next-intl
- **Icons**: Lucide React
- **Notifications**: Sonner

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **Logging**: Winston
- **API Documentation**: Swagger

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky
- **Commit Convention**: Commitlint
- **Containerization**: Docker (optional)
- **Process Manager**: PM2

---

## 🏗 Kiến trúc hệ thống

```
TVLS-AdministrativeManagement/
├── src/
│   ├── client/                 # Frontend (Next.js)
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── services/      # API services
│   │   │   ├── lib/           # Utilities
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── messages/      # i18n translations
│   │   │   └── styles/        # Global styles
│   │   └── public/            # Static assets
│   │
│   ├── server/                # Backend (Express)
│   │   ├── src/
│   │   │   ├── controllers/   # Request handlers
│   │   │   ├── services/      # Business logic
│   │   │   ├── models/        # Database models
│   │   │   ├── routes/        # API routes
│   │   │   ├── middlewares/   # Express middlewares
│   │   │   ├── database/      # DB config & migrations
│   │   │   ├── dtos/          # Data Transfer Objects
│   │   │   ├── interfaces/    # TypeScript interfaces
│   │   │   └── utils/         # Utilities
│   │   └── uploads/           # Uploaded files
│   │
│   └── database/              # SQL scripts
│
├── thesis/                    # Documentation
└── README.md
```

### Luồng dữ liệu

```
Client (Next.js) 
    ↓ HTTP/HTTPS
API Gateway (Express)
    ↓
Middleware (Auth, Validation)
    ↓
Controllers
    ↓
Services (Business Logic)
    ↓
Models (Sequelize ORM)
    ↓
Database (MySQL)
```

---

## 💻 Yêu cầu hệ thống

### Phần mềm cần thiết

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **MySQL**: >= 8.0
- **Git**: >= 2.0

### Khuyến nghị

- **RAM**: >= 4GB
- **Disk Space**: >= 2GB
- **OS**: Windows 10/11, macOS, Linux
- **Browser**: Chrome, Firefox, Edge (phiên bản mới nhất)

---

## 🚀 Cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/your-org/TVLS-AdministrativeManagement.git
cd TVLS-AdministrativeManagement
```

### 2. Cài đặt Backend

```bash
cd src/server
npm install
```

#### Tạo file `.env.development.local`

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=dev

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Upload
MAX_FILE_SIZE=5242880
```

#### Tạo Database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Chạy Migrations

```bash
npm run migrate
```

#### Seed dữ liệu mẫu (Optional)

```bash
npm run seed
```

#### Khởi động Backend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Backend sẽ chạy tại: `http://localhost:3001`

### 3. Cài đặt Frontend

```bash
cd src/client
npm install
```

#### Tạo file `.env`

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Khởi động Frontend

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

## ⚙️ Cấu hình

### Cấu hình Database

File: `src/server/src/config/index.ts`

```typescript
export const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_DATABASE = 'dev',
} = process.env;
```

### Cấu hình JWT

```typescript
export const {
  JWT_SECRET = 'your-secret-key',
  JWT_EXPIRES_IN = '7d',
} = process.env;
```

### Cấu hình Upload

```typescript
export const {
  MAX_FILE_SIZE = '5242880', // 5MB
} = process.env;
```

---

## 📖 Hướng dẫn sử dụng

### Đăng nhập hệ thống

1. Truy cập: `http://localhost:3000`
2. Đăng nhập với tài khoản mặc định:
   - **Admin**: `admin@thsp.edu.vn` / `admin123`
   - **Teacher**: `teacher@thsp.edu.vn` / `teacher123`

### Quản lý Người dùng

1. Vào menu **Quản lý người dùng**
2. Click **Thêm người dùng**
3. Điền thông tin và chọn vai trò
4. Click **Tạo mới**

### Quản lý Thiết bị

1. Vào menu **Cơ sở vật chất** > **Thiết bị**
2. Click **Thêm thiết bị**
3. Chọn phòng và nhập thông tin
4. Click **Tạo mới**

### Báo cáo Sự cố

1. Vào menu **Báo cáo thiết bị**
2. Click **Tạo báo cáo**
3. Chọn thiết bị, mô tả sự cố
4. Upload hình ảnh (nếu có)
5. Click **Gửi báo cáo**

### Tạo Đơn Nghỉ phép

1. Vào menu **Đơn nghỉ phép**
2. Click **Tạo đơn**
3. Chọn loại nghỉ, ngày bắt đầu/kết thúc
4. Nhập lý do
5. Click **Gửi đơn**
6. Ký điện tử (nếu đã thiết lập)

### Thiết lập Chữ ký số

1. Vào menu **Cài đặt** > **Chữ ký số**
2. Chọn tab **Vẽ** hoặc **Upload**
3. Tạo chữ ký
4. Thiết lập mã PIN (6 số)
5. Click **Lưu cấu hình**

---

## 📚 API Documentation

### Base URL

```
http://localhost:3001
```

### Authentication

Tất cả API (trừ login) yêu cầu JWT token trong header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints chính

#### Authentication

```http
POST /auth/login
POST /auth/logout
POST /password-reset/request
POST /password-reset/verify-otp
POST /password-reset/reset
```

#### Users

```http
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
```

#### Buildings

```http
GET    /buildings
GET    /buildings/:id
POST   /buildings
PUT    /buildings/:id
DELETE /buildings/:id
```

#### Rooms

```http
GET    /rooms
GET    /rooms/:id
POST   /rooms
PUT    /rooms/:id
DELETE /rooms/:id
```

#### Devices

```http
GET    /devices
GET    /devices/:id
POST   /devices
PUT    /devices/:id
DELETE /devices/:id
```

#### Device Reports

```http
GET    /device-reports
GET    /device-reports/:id
POST   /device-reports
PUT    /device-reports/:id
DELETE /device-reports/:id
```

#### Leave Requests

```http
GET    /leave-requests
GET    /leave-requests/:id
POST   /leave-requests
PUT    /leave-requests/:id
DELETE /leave-requests/:id
POST   /leave-requests/:id/sign
POST   /leave-requests/:id/approve
POST   /leave-requests/:id/reject
GET    /leave-requests/:id/pdf
```

#### Digital Signatures

```http
GET    /digital-signatures/config
POST   /digital-signatures/config
PUT    /digital-signatures/config
DELETE /digital-signatures/config
```

### Swagger Documentation

Truy cập: `http://localhost:3001/api-docs`

---

## 🔒 Bảo mật

### Các biện pháp bảo mật

- ✅ **JWT Authentication**: Xác thực người dùng
- ✅ **Password Hashing**: Mã hóa mật khẩu với bcrypt
- ✅ **Input Validation**: Kiểm tra dữ liệu đầu vào
- ✅ **SQL Injection Prevention**: Sử dụng ORM (Sequelize)
- ✅ **XSS Protection**: Sanitize user input
- ✅ **CORS Configuration**: Giới hạn origin
- ✅ **Rate Limiting**: Giới hạn số request
- ✅ **File Upload Validation**: Kiểm tra loại file và kích thước
- ✅ **PIN Protection**: Bảo vệ chữ ký số bằng mã PIN

### Best Practices

1. **Không commit file `.env`** vào Git
2. **Thay đổi JWT_SECRET** trong production
3. **Sử dụng HTTPS** trong production
4. **Backup database** định kỳ
5. **Update dependencies** thường xuyên
6. **Review code** trước khi merge
7. **Sử dụng strong password** cho database

---

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp cho dự án!

### Quy trình đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Coding Standards

- Sử dụng TypeScript
- Follow ESLint rules
- Format code với Prettier
- Viết commit message theo Conventional Commits
- Viết unit tests cho features mới

### Commit Convention

```
feat: Thêm tính năng mới
fix: Sửa lỗi
docs: Cập nhật documentation
style: Format code
refactor: Refactor code
test: Thêm tests
chore: Cập nhật dependencies
```

---

## 📄 Giấy phép

Dự án này được phát triển cho Trường Thực Hành Sư Phạm - Đại học Trà Vinh.

Copyright © 2024 Practice Pedagogical School. All rights reserved.

---

## 📞 Liên hệ

### Đội ngũ phát triển

- **Sinh viên thực hiện**: [Tên sinh viên]
- **Email**: [email@tvu.edu.vn]
- **Giảng viên hướng dẫn**: [Tên giảng viên]

### Trường Thực Hành Sư Phạm

- **Địa chỉ**: Đại học Trà Vinh, Số 126 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh
- **Website**: [https://www.tvu.edu.vn](https://www.tvu.edu.vn)
- **Email**: info@tvu.edu.vn
- **Điện thoại**: (0294) 3855246

---

## 🙏 Lời cảm ơn

Xin chân thành cảm ơn:

- Ban Giám hiệu Trường Thực Hành Sư Phạm
- Khoa Công nghệ Thông tin - Đại học Trà Vinh
- Giảng viên hướng dẫn
- Cán bộ, giáo viên đã đóng góp ý kiến
- Cộng đồng Open Source

---

<div align="center">

<img src="./thesis/png/logothsp.png" alt="Logo Trường Thực Hành Sư Phạm" width="150"/>

**Được phát triển với ❤️ tại Trường Thực Hành Sư Phạm - Đại học Trà Vinh**

⭐ Nếu dự án hữu ích, hãy cho chúng tôi một star!

</div>
