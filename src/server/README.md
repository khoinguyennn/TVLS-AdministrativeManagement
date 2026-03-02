# Express TypeScript Starter

## 📝 Giới thiệu

Express TypeScript Starter là một boilerplate RESTful API server được xây dựng với **TypeScript**, **Express**, **Sequelize ORM** và **MySQL**. Dự án được thiết kế theo kiến trúc MVC với các best practices về bảo mật, logging, validation và API documentation.

## ✨ Tính năng

### Core Features
- ⚡ **TypeScript** - Type safety và modern JavaScript features
- 🚀 **Express.js** - Fast, unopinionated web framework
- 🗄️ **Sequelize ORM** - Promise-based Node.js ORM cho MySQL
- 🔐 **Authentication & Authorization** - JWT-based authentication
- 📝 **Auto-generated API Documentation** - Swagger/OpenAPI integration
- ✅ **Validation** - Request validation sử dụng class-validator
- 🛡️ **Security** - Helmet, CORS, HPP protection
- 📊 **Logging** - Winston logger với daily rotate file
- 🧪 **Testing** - Jest testing framework
- 🐳 **Docker Support** - Dockerfile cho development và production
- 🔄 **Hot Reload** - Nodemon cho development mode

### Architecture
- **MVC Pattern** - Controllers, Services, Models separation
- **Dependency Injection** - TypeDI container
- **DTOs** - Data Transfer Objects cho validation
- **Middlewares** - Authentication, Error handling, Validation
- **Exception Handling** - Custom HTTP exceptions

### API Features
- User Management (CRUD operations)
- Authentication (Sign up, Login, Logout)
- Input validation
- Error handling
- Request logging

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)

### Security & Middleware
- **helmet** - Secure Express apps by setting various HTTP headers
- **cors** - Enable CORS
- **hpp** - HTTP Parameter Pollution protection
- **bcrypt** - Password hashing
- **morgan** - HTTP request logger

### Development Tools
- **TypeScript Compiler** - tsc & swc
- **Nodemon** - Auto-restart server
- **ESLint** - Code linting
- **Jest** - Testing framework
- **PM2** - Process manager
- **Docker** - Containerization

## 📋 Yêu cầu

- Node.js phiên bản >= 14.x
- npm hoặc yarn
- MySQL >= 5.7
- Docker (optional)

## 🚀 Cài đặt và Chạy

1. **Clone repository**:

```bash
git clone https://github.com/tanmaiii/express-typescript-starter
cd express-typescript-starter
```

2. **Cài đặt dependencies**:

```bash
npm install
```

hoặc nếu sử dụng yarn:

```bash
yarn install
```

3. **Cấu hình Database**:

   Tạo database MySQL:
   ```sql
   CREATE DATABASE dev;
   ```

4. **Cài đặt các biến môi trường**:

   Tạo file `.env.development.local` trong thư mục gốc của dự án:

   ```env
   # PORT
   PORT = 3000

   # DATABASE
   DB_USER = root
   DB_PASSWORD = password
   DB_HOST = localhost
   DB_PORT = 3306
   DB_DATABASE = dev

   # TOKEN
   SECRET_KEY = secretKey

   # LOG
   LOG_FORMAT = dev
   LOG_DIR = ../logs

   # CORS
   ORIGIN = *
   CREDENTIALS = true
   ```

5. **Chạy migrations** (nếu có):

```bash
npm run migration:run
```

6. **Chạy chương trình**:

```bash
npm run dev
```

hoặc với yarn:

```bash
yarn dev
```

7. **Truy cập ứng dụng**:
   - API Server: [http://localhost:3000](http://localhost:3000)
   - API Documentation: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## 🐳 Docker

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -f Dockerfile.prod -t express-api .
docker run -p 3000:3000 express-api
```

## 📁 Cấu trúc thư mục

```
express-typescript-starter/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts         # Environment variables
│   │   └── sequelize-cli.js # Sequelize CLI config
│   ├── controllers/         # Route controllers (HTTP handlers)
│   │   ├── auth.controller.ts
│   │   └── users.controller.ts
│   ├── database/           # Database related files
│   │   ├── index.ts        # Sequelize initialization
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── dtos/               # Data Transfer Objects
│   │   └── users.dto.ts
│   ├── exceptions/         # Custom exceptions
│   │   └── HttpException.ts
│   ├── interfaces/         # TypeScript interfaces
│   │   ├── auth.interface.ts
│   │   ├── routes.interface.ts
│   │   └── users.interface.ts
│   ├── middlewares/        # Custom middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/             # Sequelize models
│   │   └── users.model.ts
│   ├── routes/             # Route definitions
│   │   ├── auth.route.ts
│   │   └── users.route.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   └── users.service.ts
│   ├── test/               # Test files
│   │   ├── auth.test.ts
│   │   └── users.test.ts
│   ├── utils/              # Utility functions
│   │   ├── logger.ts
│   │   └── validateEnv.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── .env.development.local  # Environment variables (local)
├── docker-compose.yml      # Docker compose configuration
├── Dockerfile.dev          # Docker file for development
├── Dockerfile.prod         # Docker file for production
├── jest.config.js          # Jest configuration
├── nodemon.json            # Nodemon configuration
├── package.json            # Dependencies and scripts
├── swagger.yaml            # API documentation
└── tsconfig.json           # TypeScript configuration
```

## 📚 API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

📖 Chi tiết API documentation có sẵn tại `/api-docs` sau khi chạy server.

## � Dừng Server

### Trong Development Mode

#### Cách 1: Ctrl + C
Nhấn `Ctrl + C` trong terminal đang chạy server (có thể cần nhấn 2 lần)

#### Cách 2: Kill Terminal
- VS Code: Click icon 🗑️ ở góc phải terminal
- Hoặc: `Ctrl + Shift + P` → "Terminal: Kill Active Terminal"

#### Cách 3: Sử dụng Scripts
```bash
# Dừng server đang chạy trên port 3000
npm run stop

# Kill tất cả Node.js processes
npm run kill

# Restart server (kill port và start lại)
npm run restart
```

#### Cách 4: Manual Kill
```bash
# Tìm process đang chạy trên port 3000
netstat -ano | findstr :3000

# Kill process (thay <PID> bằng số PID thực tế)
taskkill /PID <PID> /F
```

### Trong Production Mode (PM2)

```bash
# Xem danh sách processes
npm run pm2:list

# Stop tất cả PM2 processes
npm run pm2:stop

# Delete tất cả PM2 processes
npm run pm2:delete

# Xem logs
npm run pm2:logs
```

## �🔧 Scripts khác

## 🔧 Scripts khác

### Development
- **Dev mode**: `npm run dev` - Chạy server với hot reload
- **Build**: `npm run build` - Build dự án với SWC
- **Build (TSC)**: `npm run build:tsc` - Build dự án với TypeScript compiler
- **Restart**: `npm run restart` - Kill port và restart server

### Production
- **Start**: `npm start` - Build và chạy production server
- **Deploy (PM2)**:
  - `npm run deploy:prod` - Deploy production với PM2
  - `npm run deploy:dev` - Deploy development với PM2

### PM2 Management
- **List**: `npm run pm2:list` - Xem danh sách PM2 processes
- **Stop**: `npm run pm2:stop` - Stop tất cả PM2 processes
- **Delete**: `npm run pm2:delete` - Xóa tất cả PM2 processes
- **Logs**: `npm run pm2:logs` - Xem PM2 logs

### Process Management
- **Stop**: `npm run stop` - Dừng server đang chạy trên port 3000
- **Kill**: `npm run kill` - Kill tất cả Node.js processes
- **Kill Port**: `npm run kill:port` - Kill process trên port 3000

### Code Quality
- **Lint**: `npm run lint` - Kiểm tra code style
- **Lint Fix**: `npm run lint:fix` - Tự động fix linting issues
- **Test**: `npm test` - Chạy unit tests với Jest

### Database
- **Generate Migration**: `npm run migration:generate -- <migration-name>` - Tạo migration file mới
- **Run Migrations**: `npm run migration:run` - Chạy pending migrations

## 🔐 Authentication Flow

1. **Sign Up**: Tạo tài khoản mới với email và password
2. **Login**: Nhận JWT token sau khi đăng nhập thành công
3. **Protected Routes**: Sử dụng JWT token trong Authorization header
   ```
   Authorization: Bearer <your_token>
   ```
4. **Logout**: Xóa token và session

## 🧪 Testing

Chạy test suite:
```bash
npm test
```

Chạy test với coverage:
```bash
npm test -- --coverage
```

## 📝 Logging

- **Development**: Logs hiển thị trong console
- **Production**: Logs được lưu vào files với daily rotation
  - Debug logs: `src/logs/debug/`
  - Error logs: `src/logs/error/`

## 🛡️ Security Features

- **Helmet** - Thiết lập các HTTP headers bảo mật
- **CORS** - Cấu hình Cross-Origin Resource Sharing
- **HPP** - Bảo vệ khỏi HTTP Parameter Pollution
- **bcrypt** - Mã hóa passwords
- **JWT** - Token-based authentication
- **Validation** - Input validation với class-validator
- **Error Handling** - Centralized error handling

## 🔄 Environment Variables

Dự án hỗ trợ nhiều môi trường:
- `.env.development.local` - Development environment
- `.env.production.local` - Production environment
- `.env.test.local` - Test environment

## 📦 Dependencies chính

| Package | Version | Mô tả |
|---------|---------|-------|
| express | ^4.18.1 | Web framework |
| sequelize | ^6.21.3 | ORM cho MySQL |
| mysql2 | ^2.3.3 | MySQL driver |
| jsonwebtoken | ^8.5.1 | JWT authentication |
| bcrypt | ^5.0.1 | Password hashing |
| class-validator | ^0.13.2 | Validation decorators |
| swagger-jsdoc | ^6.2.1 | API documentation |
| winston | ^3.8.1 | Logging |
| helmet | ^5.1.1 | Security middleware |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Author

- GitHub: [@tanmaiii](https://github.com/tanmaiii)

## 🙏 Acknowledgments

- Express.js team
- TypeScript team
- Sequelize team
- All contributors and maintainers

---

**Happy Coding! 🚀**
