# Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# From root directory
pnpm install
```

### 2. Setup Database

Make sure PostgreSQL is running, then set your database URL:

```bash
# Create .env file in artifacts/api-server/
cd artifacts/api-server
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/streetbite
```

### 3. Push Database Schema

```bash
# From root directory
cd lib/db
pnpm run push
```

This will create all the tables in your database:
- `vendors` - Vendor profiles
- `menu_items` - Food items
- `orders` - Customer orders
- `otps` - OTP verification codes

### 4. Seed Database (Optional)

Populate the database with demo data:

```bash
cd artifacts/api-server
pnpm run seed
```

This creates:
- 1 demo vendor (Sharma's Street Kitchen)
- 10 menu items
- 3 sample orders

Demo credentials:
- Phone: `9876543210`
- OTP: `123456` (in development mode)

### 5. Start Backend Server

```bash
cd artifacts/api-server
pnpm run dev
```

Server will start on `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication

#### Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

Response:
```json
{
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "vendor": {
    "id": 1,
    "phoneNumber": "9876543210",
    "name": "Sharma's Street Kitchen",
    "description": "Authentic North Indian street food",
    "category": "North Indian",
    "rating": 4.8,
    "isOpen": true
  }
}
```

### Vendors

#### Get Vendor
```http
GET /api/vendors/:vendorId
```

#### Get My Profile (Authenticated)
```http
GET /api/vendors/me
Authorization: Bearer <token>
```

#### Update Vendor (Authenticated)
```http
PUT /api/vendors/:vendorId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "isOpen": true
}
```

### Menu Items

#### Get Vendor Menu
```http
GET /api/vendors/:vendorId/menu
GET /api/vendors/:vendorId/menu?category=main
GET /api/vendors/:vendorId/menu?available=true
```

#### Create Menu Item (Authenticated)
```http
POST /api/vendors/:vendorId/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry",
  "price": 150,
  "category": "main",
  "emoji": "🍗",
  "available": true,
  "rating": 4.8,
  "prepTime": 15
}
```

#### Update Menu Item (Authenticated)
```http
PUT /api/menu/:menuItemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "available": false,
  "price": 160
}
```

#### Delete Menu Item (Authenticated)
```http
DELETE /api/menu/:menuItemId
Authorization: Bearer <token>
```

### Orders

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "vendorId": 1,
  "customerId": "customer_123",
  "items": [
    {
      "menuItemId": 1,
      "name": "Chole Bhature",
      "price": 80,
      "quantity": 2
    },
    {
      "menuItemId": 5,
      "name": "Masala Chai",
      "price": 20,
      "quantity": 2
    }
  ],
  "total": 200,
  "estimatedTime": 8
}
```

Response:
```json
{
  "id": 4,
  "tokenNumber": 4,
  "vendorId": 1,
  "customerId": "customer_123",
  "items": [...],
  "status": "pending",
  "total": 200,
  "estimatedTime": 8,
  "createdAt": "2026-04-03T10:30:00Z",
  "updatedAt": "2026-04-03T10:30:00Z"
}
```

#### Get Order
```http
GET /api/orders/:orderId
```

#### Update Order Status (Authenticated)
```http
PATCH /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "preparing"
}
```

Status values: `pending`, `preparing`, `ready`, `delivered`

#### Get Vendor Orders (Authenticated)
```http
GET /api/vendors/:vendorId/orders
GET /api/vendors/:vendorId/orders?status=pending
Authorization: Bearer <token>
```

#### Get Token Counter
```http
GET /api/vendors/:vendorId/token-counter
```

Response:
```json
{
  "nextToken": 5
}
```

---

## 🔐 Authentication

All vendor-specific endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token by calling `/api/auth/verify-otp` after OTP verification.

---

## 🗄️ Database Schema

### vendors
- `id` - Primary key
- `phoneNumber` - Unique, 10 digits
- `name` - Vendor name
- `description` - Business description
- `category` - Food category
- `rating` - Average rating (0-5)
- `isOpen` - Business status
- `createdAt`, `updatedAt` - Timestamps

### menu_items
- `id` - Primary key
- `vendorId` - Foreign key to vendors
- `name` - Item name
- `description` - Item description
- `price` - Price in cents/paise
- `category` - main, side, drink, dessert
- `emoji` - Display emoji
- `available` - Availability status
- `rating` - Item rating (0-5)
- `prepTime` - Preparation time in minutes
- `createdAt`, `updatedAt` - Timestamps

### orders
- `id` - Primary key
- `tokenNumber` - Order token number
- `vendorId` - Foreign key to vendors
- `customerId` - Optional customer identifier
- `items` - JSON array of order items
- `status` - pending, preparing, ready, delivered
- `total` - Total price in cents/paise
- `estimatedTime` - Estimated prep time in minutes
- `createdAt`, `updatedAt` - Timestamps

### otps
- `id` - Primary key
- `phoneNumber` - 10 digit phone number
- `otp` - 6 digit OTP code
- `expiresAt` - Expiration timestamp
- `verified` - Verification status
- `createdAt` - Creation timestamp

---

## 🧪 Testing the API

### Using curl

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","otp":"123456"}'

# Get menu (no auth required)
curl http://localhost:3000/api/vendors/1/menu

# Create order (no auth required)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": 1,
    "items": [{"menuItemId":1,"name":"Chole Bhature","price":80,"quantity":2}],
    "total": 160,
    "estimatedTime": 8
  }'

# Get vendor orders (requires auth)
TOKEN="your-jwt-token-here"
curl http://localhost:3000/api/vendors/1/orders \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman/Insomnia

Import the OpenAPI spec from `lib/api-spec/openapi.yaml` to automatically generate all endpoints.

---

## 🔄 Regenerate API Client

After updating the OpenAPI spec, regenerate the client code:

```bash
cd lib/api-spec
pnpm run generate
```

This updates:
- `lib/api-client-react` - React Query hooks
- `lib/api-zod` - Zod validation schemas

---

## 🐛 Troubleshooting

### Database connection error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists: `createdb streetbite`

### Port already in use
- Change `PORT` in `.env`
- Kill process using port: `lsof -ti:3000 | xargs kill`

### OTP not working
- In development, OTP is always `123456`
- Check console logs for OTP output
- Verify phone number is 10 digits

### Token expired
- Tokens expire after 7 days
- Re-authenticate to get new token

---

## 🚀 Production Deployment

### Environment Variables

Set these in production:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
```

### SMS Integration

For production OTP delivery, integrate with SMS provider:

1. **Twilio**:
```bash
pnpm add twilio
```

Update `src/lib/otp.ts`:
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOtpSms(phoneNumber: string, otp: string) {
  await client.messages.create({
    body: `Your StreetBite OTP is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: `+91${phoneNumber}`
  });
}
```

2. **AWS SNS**, **Firebase Cloud Messaging**, or other SMS providers

### Database Migrations

For production schema changes, use Drizzle migrations:

```bash
cd lib/db
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

---

## 📚 Next Steps

1. ✅ Backend is ready
2. 🔄 Connect mobile app to backend
3. 🔥 Add Firebase for push notifications
4. 📸 Add image upload for menu items
5. 💳 Integrate payment gateway
6. 📊 Add analytics and reporting
