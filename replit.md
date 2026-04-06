# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── street-vendor-app/  # StreetBite Expo mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## StreetBite Mobile App (artifacts/street-vendor-app)

Smart Street Vendor Order Management System built with Expo React Native.

### Features
- **Role-based navigation**: Customer and Vendor roles
- **Customer features**: QR Scanner, Menu browsing, Cart, Order confirmation, Token display, Order tracking
- **Vendor features**: Phone + OTP login, Dashboard with order management, Queue display

### App Structure
```text
app/
  index.tsx              # Role selection screen
  customer/
    qr-scanner.tsx       # QR code scanner
    menu.tsx             # Food menu with category filters
    cart.tsx             # Shopping cart
    order-confirmation.tsx
    token.tsx            # Token display after order
    tracking.tsx         # Real-time order tracking
  vendor/
    login.tsx            # Phone number input
    otp.tsx              # OTP verification (demo: 123456)
    dashboard.tsx        # Order management dashboard
    queue.tsx            # Queue display screen
context/
  AppContext.tsx          # Global state (cart, orders, role)
data/
  mockData.ts             # Mock menu items and orders
types/
  index.ts               # TypeScript types
components/
  FoodCard.tsx            # Menu item card
  OrderCard.tsx           # Order card with vendor actions
  StatusTracker.tsx       # Order status progress tracker
  CustomButton.tsx        # Reusable button component
  LoadingIndicator.tsx    # Skeleton loading
```

### Tech
- Expo Router (file-based routing)
- React Context for state management
- AsyncStorage for persistence
- expo-camera for QR scanning
- expo-haptics for feedback
- Material 3-inspired UI with orange/red food theme

### Demo Credentials
- **Vendor OTP**: 123456
- **Any 10-digit phone** works for vendor login
