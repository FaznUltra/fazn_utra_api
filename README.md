# Fazn Ultra Backend

Secure Express TypeScript backend with MongoDB, JWT authentication, and role-based access control.

## 🔒 Security Features

- **HTTPOnly Cookies** - Secure token storage
- **Helmet.js** - Security headers
- **Rate Limiting** - DDoS protection
- **Data Sanitization** - NoSQL injection prevention
- **Input Validation** - Joi schema validation
- **Password Hashing** - bcrypt with configurable rounds
- **CORS** - Cross-origin resource sharing
- **Request Size Limits** - Prevent payload attacks

## 🚀 Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```
Edit `.env` and update:
- `JWT_SECRET` - Use a strong random secret
- `MONGODB_URI` - Your MongoDB connection string

3. **Run development server:**
```bash
npm run dev
```

## 📜 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 👥 User Roles

1. **super_admin** - Full system access
2. **admin** - Manage users and content
3. **manager** - Limited management access
4. **user** - Standard user access

## 🔑 API Endpoints

### Public Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Logout
```http
POST /api/auth/logout
```

### Protected Routes (Requires Authentication)

#### Get Current User
```http
GET /api/auth/me
Cookie: token=<jwt_token>
```

#### Update Password
```http
PATCH /api/auth/update-password
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

### Admin Routes (Super Admin & Admin Only)

#### Get All Users
```http
GET /api/auth/users
Cookie: token=<jwt_token>
```

#### Update User Role
```http
PATCH /api/auth/users/:userId/role
Cookie: token=<jwt_token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### Deactivate User
```http
PATCH /api/auth/users/:userId/deactivate
Cookie: token=<jwt_token>
```

## 🛡️ Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.ts   # Auth logic
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification & RBAC
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── validate.ts          # Request validation
│   ├── models/
│   │   └── User.ts              # User schema
│   ├── routes/
│   │   └── auth.routes.ts       # Auth endpoints
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── utils/
│   │   ├── AppError.ts          # Custom error class
│   │   └── jwt.ts               # JWT utilities
│   ├── validators/
│   │   └── auth.validator.ts    # Joi schemas
│   └── index.ts                 # App entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Security
BCRYPT_ROUNDS=12
```

## 🧪 Response Format

### Success Response
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Error Response
```json
{
  "success": false,
  "status": "fail",
  "message": "Error message here"
}
```

## 🚨 Error Handling

All errors are handled centrally with appropriate HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Notes

- Tokens are stored in HTTPOnly cookies for security
- All passwords are hashed with bcrypt before storage
- MongoDB queries are sanitized to prevent NoSQL injection
- Rate limiting: 100 requests per 15 minutes per IP
- Request payload limit: 10kb
