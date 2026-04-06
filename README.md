# StreetBite - Street Vendor Order Management System

A complete full-stack application for managing street food vendor orders with real-time order tracking, QR code scanning, and vendor dashboard.

## 🎯 Features

### Customer Features
- 📱 QR code scanning to access vendor menu
- 🍽️ Browse menu with categories (Main, Side, Drink, Dessert)
- 🛒 Shopping cart with quantity management
- 🎫 Token-based order system
- 📊 Real-time order tracking
- ⏱️ Estimated preparation time

### Vendor Features
- 📞 Phone + OTP authentication
- 📋 Order management dashboard
- 🔄 Real-time order status updates (Pending → Preparing → Ready → Delivered)
- 📊 Order statistics and filtering
- 🎯 Queue display for customers
- 🍴 Menu management (CRUD operations)

## 🏗️ Architecture

### Monorepo Structure
```
workspace/
├── artifacts/
│   ├── api-server/              # Express REST API (Backend)
│   ├── street-vendor-app/       # Expo React Native (Mobile App)
│   └── mockup-sandbox/          # React component preview
├── lib/
│   ├── api-spec/               # OpenAPI specification
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle ORM + PostgreSQL
└── scripts/                     # Utility scripts
```

### Tech Stack

**Backend:**
- Express 5 + TypeScript
- PostgreSQL + Drizzle ORM
- Zod validation
- JWT authentication
- Pino logging

**Mobile App:**
- Expo 54 + React Native
- Expo Router (file-based routing)
- React Query for data fetching
- AsyncStorage for persistence
- Expo Camera for QR scanning

**Shared:**
- pnpm workspaces
- TypeScript
- Orval (API client generation)

## 🚀 Quick Start

### Prerequisites
- Node.js 24+
- pnpm
- PostgreSQL
- Expo Go app (for mobile testing)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Setup Database
```bash
# Create database
createdb streetbite

# Copy environment file
cd artifacts/api-server
cp .env.example .env

# Edit .env and set DATABASE_URL
# DATABASE_URL=postgresql://user:password@localhost:5432/streetbite

# Push schema to database
cd ../../lib/db
pnpm run push

# Seed with demo data
cd ../../artifacts/api-server
pnpm run seed
```

### 3. Start Backend
```bash
cd artifacts/api-server
pnpm run dev
```

Backend runs on `http://localhost:3000`

### 4. Start Mobile App
```bash
cd artifacts/street-vendor-app
pnpm run dev
```

Scan QR code with Expo Go app or press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web

### 5. Test the App

**Demo Credentials:**
- Phone: `9876543210`
- OTP: `123456`
- Vendor ID: `1`

## 📚 Documentation

- [**PROJECT_ARCHITECTURE.md**](./PROJECT_ARCHITECTURE.md) - Complete project overview and Firebase integration guide
- [**BACKEND_SETUP.md**](./BACKEND_SETUP.md) - Backend API setup and endpoints documentation
- [**MOBILE_APP_INTEGRATION.md**](./MOBILE_APP_INTEGRATION.md) - Mobile app backend integration guide

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login

### Vendors
- `GET /api/vendors/:vendorId` - Get vendor details
- `GET /api/vendors/me` - Get authenticated vendor profile
- `PUT /api/vendors/:vendorId` - Update vendor profile

### Menu Items
- `GET /api/vendors/:vendorId/menu` - Get vendor menu
- `POST /api/vendors/:vendorId/menu` - Create menu item
- `PUT /api/menu/:menuItemId` - Update menu item
- `DELETE /api/menu/:menuItemId` - Delete menu item

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order details
- `PATCH /api/orders/:orderId/status` - Update order status
- `GET /api/vendors/:vendorId/orders` - Get vendor orders
- `GET /api/vendors/:vendorId/token-counter` - Get next token number

Full API documentation: [BACKEND_SETUP.md](./BACKEND_SETUP.md)

## 🗄️ Database Schema

### Tables
- **vendors** - Vendor profiles and business info
- **menu_items** - Food items with pricing and availability
- **orders** - Customer orders with token numbers
- **otps** - OTP verification codes

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed schema.

## 🔐 Authentication Flow

1. Vendor enters phone number
2. Backend sends 6-digit OTP (demo: always `123456`)
3. Vendor enters OTP
4. Backend verifies and returns JWT token
5. Token stored in AsyncStorage
6. Token attached to all authenticated requests

## 🛠️ Development Workflow

### Making API Changes

1. Update OpenAPI spec: `lib/api-spec/openapi.yaml`
2. Regenerate clients:
   ```bash
   cd lib/api-spec
   pnpm run generate
   ```
3. Implement backend route in `artifacts/api-server/src/routes/`
4. Use generated hooks in mobile app

### Database Changes

1. Update schema in `lib/db/src/schema/`
2. Push changes:
   ```bash
   cd lib/db
   pnpm run push
   ```

### Type Checking

```bash
# Check all packages
pnpm run typecheck

# Check specific package
cd artifacts/api-server
pnpm run typecheck
```

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3000/api/healthz

# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210"}'

# Get menu
curl http://localhost:3000/api/vendors/1/menu
```

### Test Mobile App
1. Start backend server
2. Update API_BASE_URL in mobile app config
3. Test vendor login flow
4. Test customer order flow

## 📱 Mobile App Screens

### Customer Flow
```
index.tsx (Role Selection)
  ↓
customer/qr-scanner.tsx (Scan QR)
  ↓
customer/menu.tsx (Browse Menu)
  ↓
customer/cart.tsx (Review Cart)
  ↓
customer/order-confirmation.tsx (Confirm Order)
  ↓
customer/token.tsx (Get Token)
  ↓
customer/tracking.tsx (Track Order)
```

### Vendor Flow
```
index.tsx (Role Selection)
  ↓
vendor/login.tsx (Phone Number)
  ↓
vendor/otp.tsx (OTP Verification)
  ↓
vendor/dashboard.tsx (Order Management)
  ↓
vendor/queue.tsx (Queue Display)
```

## 🔥 Firebase Integration (Optional)

For production deployment, integrate Firebase for:
- **Authentication** - Phone OTP via Firebase Auth
- **Storage** - Menu item images
- **Cloud Messaging** - Push notifications for order updates
- **Analytics** - User behavior tracking

See [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) for Firebase integration guide.

## 🚀 Deployment

### Backend (Replit/Railway/Render)
1. Set environment variables
2. Push database schema
3. Deploy backend
4. Update mobile app API_BASE_URL

### Mobile App (Expo EAS)
```bash
cd artifacts/street-vendor-app
eas build --platform all
eas submit --platform all
```

## 🐛 Troubleshooting

### Mobile app can't connect to backend
- Use computer's IP address instead of localhost
- Ensure both on same network
- Check firewall settings

### Database connection error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### OTP not working
- In development, OTP is always `123456`
- Check console logs for OTP output

See [MOBILE_APP_INTEGRATION.md](./MOBILE_APP_INTEGRATION.md) for more troubleshooting.

## 📦 Scripts

```bash
# Root level
pnpm install              # Install all dependencies
pnpm run build           # Build all packages
pnpm run typecheck       # Type check all packages

# Backend
cd artifacts/api-server
pnpm run dev             # Start dev server
pnpm run build           # Build for production
pnpm run seed            # Seed database

# Mobile App
cd artifacts/street-vendor-app
pnpm run dev             # Start Expo dev server
pnpm run build           # Build for production

# Database
cd lib/db
pnpm run push            # Push schema to database
pnpm run push-force      # Force push schema
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Expo team for amazing React Native framework
- Drizzle team for excellent ORM
- shadcn/ui for beautiful components
- Replit for development platform

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Review troubleshooting guides

---

Built with ❤️ for street food vendors everywhere
