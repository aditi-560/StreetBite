# 🏗️ StreetBite Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                               │
│                    (Expo React Native)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Customer   │  │    Vendor    │  │   Mockup     │          │
│  │     Flow     │  │     Flow     │  │   Sandbox    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐        │
│  │           React Query + API Client                   │        │
│  │         (@workspace/api-client-react)                │        │
│  └─────────────────────────────────────────────────────┘        │
│                          ↕ HTTP/REST                             │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                          │
│                    (Express + TypeScript)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                   API Routes                          │       │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │       │
│  │  │  Auth  │ │Vendors │ │  Menu  │ │ Orders │       │       │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                  Middleware                           │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │       │
│  │  │    Auth    │  │    CORS    │  │  Logging   │    │       │
│  │  └────────────┘  └────────────┘  └────────────┘    │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                   Utilities                           │       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │       │
│  │  │    JWT     │  │    OTP     │  │ Validation │    │       │
│  │  └────────────┘  └────────────┘  └────────────┘    │       │
│  └──────────────────────────────────────────────────────┘       │
│                          ↕ SQL                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                  (PostgreSQL + Drizzle ORM)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ vendors  │  │menu_items│  │  orders  │  │   otps   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Vendor Authentication Flow

```
┌─────────────┐
│ Vendor App  │
└──────┬──────┘
       │ 1. Enter Phone Number
       ↓
┌─────────────────────────────────┐
│ POST /api/auth/send-otp         │
│ { phoneNumber: "9876543210" }   │
└──────┬──────────────────────────┘
       │ 2. Generate OTP
       ↓
┌─────────────────────────────────┐
│ Backend: Generate 6-digit OTP   │
│ Store in otps table             │
│ Send SMS (console log in dev)   │
└──────┬──────────────────────────┘
       │ 3. Return success
       ↓
┌─────────────┐
│ Vendor App  │ 4. Show OTP input
└──────┬──────┘
       │ 5. Enter OTP
       ↓
┌─────────────────────────────────┐
│ POST /api/auth/verify-otp       │
│ { phoneNumber, otp: "123456" }  │
└──────┬──────────────────────────┘
       │ 6. Verify OTP
       ↓
┌─────────────────────────────────┐
│ Backend: Check OTP validity     │
│ Find/Create vendor              │
│ Generate JWT token              │
└──────┬──────────────────────────┘
       │ 7. Return token + vendor
       ↓
┌─────────────┐
│ Vendor App  │ 8. Store token
│             │ 9. Navigate to dashboard
└─────────────┘
```

### 2. Customer Order Flow

```
┌──────────────┐
│ Customer App │
└──────┬───────┘
       │ 1. Browse Menu
       ↓
┌─────────────────────────────────┐
│ GET /api/vendors/1/menu         │
└──────┬──────────────────────────┘
       │ 2. Return menu items
       ↓
┌──────────────┐
│ Customer App │ 3. Add to cart
│              │ 4. Review cart
└──────┬───────┘
       │ 5. Place Order
       ↓
┌─────────────────────────────────┐
│ POST /api/orders                │
│ { vendorId, items, total }      │
└──────┬──────────────────────────┘
       │ 6. Create order
       ↓
┌─────────────────────────────────┐
│ Backend: Validate vendor        │
│ Generate token number           │
│ Store order in database         │
└──────┬──────────────────────────┘
       │ 7. Return order + token
       ↓
┌──────────────┐
│ Customer App │ 8. Show token
│              │ 9. Start tracking
└──────┬───────┘
       │ 10. Poll for updates
       ↓
┌─────────────────────────────────┐
│ GET /api/orders/:orderId        │
│ (every 3 seconds)               │
└──────┬──────────────────────────┘
       │ 11. Return current status
       ↓
┌──────────────┐
│ Customer App │ 12. Update UI
└──────────────┘
```

### 3. Vendor Order Management Flow

```
┌─────────────┐
│ Vendor App  │
└──────┬──────┘
       │ 1. View Dashboard
       ↓
┌─────────────────────────────────┐
│ GET /api/vendors/1/orders       │
│ Authorization: Bearer <token>   │
└──────┬──────────────────────────┘
       │ 2. Return orders
       ↓
┌─────────────┐
│ Vendor App  │ 3. Display orders
│             │ 4. Filter by status
└──────┬──────┘
       │ 5. Accept Order
       ↓
┌─────────────────────────────────┐
│ PATCH /api/orders/1/status      │
│ { status: "preparing" }         │
│ Authorization: Bearer <token>   │
└──────┬──────────────────────────┘
       │ 6. Update status
       ↓
┌─────────────────────────────────┐
│ Backend: Verify token           │
│ Validate ownership              │
│ Update order status             │
└──────┬──────────────────────────┘
       │ 7. Return updated order
       ↓
┌─────────────┐
│ Vendor App  │ 8. Refresh orders
│             │ 9. Update UI
└─────────────┘
       ↕
┌──────────────┐
│ Customer App │ Polling detects change
│              │ Updates tracking UI
└──────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────────────┐
│          vendors                 │
├─────────────────────────────────┤
│ id (PK)                         │
│ phoneNumber (UNIQUE)            │
│ name                            │
│ description                     │
│ category                        │
│ rating                          │
│ isOpen                          │
│ createdAt                       │
│ updatedAt                       │
└────────┬────────────────────────┘
         │
         │ 1:N
         │
         ├──────────────────────────────────┐
         │                                  │
         ↓                                  ↓
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│        menu_items                │  │          orders                  │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ id (PK)                         │  │ id (PK)                         │
│ vendorId (FK) ──────────────────┤  │ vendorId (FK) ──────────────────┤
│ name                            │  │ tokenNumber                     │
│ description                     │  │ customerId                      │
│ price                           │  │ items (JSONB)                   │
│ category                        │  │ status                          │
│ emoji                           │  │ total                           │
│ available                       │  │ estimatedTime                   │
│ rating                          │  │ createdAt                       │
│ prepTime                        │  │ updatedAt                       │
│ createdAt                       │  └─────────────────────────────────┘
│ updatedAt                       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│            otps                  │
├─────────────────────────────────┤
│ id (PK)                         │
│ phoneNumber                     │
│ otp                             │
│ expiresAt                       │
│ verified                        │
│ createdAt                       │
└─────────────────────────────────┘
```

---

## API Endpoint Map

```
┌─────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                           │
└─────────────────────────────────────────────────────────────┘

Authentication (Public)
├── POST   /api/auth/send-otp          Send OTP to phone
└── POST   /api/auth/verify-otp        Verify OTP, get token

Vendors
├── GET    /api/vendors/:id            Get vendor (Public)
├── GET    /api/vendors/me             Get my profile (Auth)
└── PUT    /api/vendors/:id            Update vendor (Auth)

Menu Items
├── GET    /api/vendors/:id/menu       Get menu (Public)
├── POST   /api/vendors/:id/menu       Create item (Auth)
├── PUT    /api/menu/:id               Update item (Auth)
└── DELETE /api/menu/:id               Delete item (Auth)

Orders
├── POST   /api/orders                 Create order (Public)
├── GET    /api/orders/:id             Get order (Public)
├── PATCH  /api/orders/:id/status      Update status (Auth)
├── GET    /api/vendors/:id/orders     Get vendor orders (Auth)
└── GET    /api/vendors/:id/token-counter  Get next token (Public)

Health
└── GET    /api/healthz                Health check (Public)
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Mobile)                         │
├─────────────────────────────────────────────────────────────┤
│ • Expo 54                                                    │
│ • React Native 0.81                                          │
│ • Expo Router (file-based routing)                          │
│ • React Query (data fetching)                               │
│ • AsyncStorage (local storage)                              │
│ • Expo Camera (QR scanning)                                 │
│ • TypeScript                                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (API)                             │
├─────────────────────────────────────────────────────────────┤
│ • Express 5                                                  │
│ • TypeScript                                                 │
│ • Pino (logging)                                            │
│ • CORS                                                       │
│ • Custom JWT (HS256)                                        │
│ • Zod (validation)                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
├─────────────────────────────────────────────────────────────┤
│ • PostgreSQL                                                 │
│ • Drizzle ORM                                               │
│ • Drizzle-Zod (schema validation)                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SHARED LIBRARIES                          │
├─────────────────────────────────────────────────────────────┤
│ • OpenAPI 3.1 (API specification)                           │
│ • Orval (code generation)                                   │
│ • pnpm workspaces (monorepo)                                │
│ • TypeScript (type safety)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
└─────────────────────────────────────────────────────────────┘

Mobile App                Backend API              Database
┌──────────┐             ┌──────────┐             ┌──────────┐
│          │             │          │             │          │
│  Expo    │────────────▶│ Railway  │────────────▶│PostgreSQL│
│   EAS    │   HTTPS     │  Replit  │   SQL      │  Cloud   │
│          │             │  Render  │             │          │
└──────────┘             └──────────┘             └──────────┘
     │                        │
     │                        │
     ↓                        ↓
┌──────────┐             ┌──────────┐
│ Firebase │             │  Sentry  │
│   Auth   │             │  Logging │
│   FCM    │             │          │
└──────────┘             └──────────┘
```

---

## Request/Response Flow

```
1. Customer places order:

   Mobile App
      │
      │ POST /api/orders
      │ { vendorId: 1, items: [...], total: 200 }
      ↓
   Express Server
      │
      │ Validate request body
      ↓
   Drizzle ORM
      │
      │ INSERT INTO orders
      ↓
   PostgreSQL
      │
      │ Return inserted row
      ↓
   Express Server
      │
      │ Format response
      ↓
   Mobile App
      │
      │ { id: 4, tokenNumber: 4, status: "pending", ... }
      └─ Display token to customer


2. Vendor updates status:

   Mobile App
      │
      │ PATCH /api/orders/4/status
      │ Authorization: Bearer <token>
      │ { status: "preparing" }
      ↓
   Auth Middleware
      │
      │ Verify JWT token
      │ Extract vendorId
      ↓
   Express Server
      │
      │ Validate ownership
      │ Validate status value
      ↓
   Drizzle ORM
      │
      │ UPDATE orders SET status = 'preparing'
      ↓
   PostgreSQL
      │
      │ Return updated row
      ↓
   Express Server
      │
      │ Format response
      ↓
   Mobile App
      │
      │ { id: 4, status: "preparing", ... }
      └─ Refresh dashboard


3. Customer tracks order:

   Mobile App (polling every 3s)
      │
      │ GET /api/orders/4
      ↓
   Express Server
      │
      │ No auth required
      ↓
   Drizzle ORM
      │
      │ SELECT * FROM orders WHERE id = 4
      ↓
   PostgreSQL
      │
      │ Return order row
      ↓
   Express Server
      │
      │ Format response
      ↓
   Mobile App
      │
      │ { id: 4, status: "preparing", ... }
      └─ Update tracking UI
```

---

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. OTP Generation
   ┌──────────┐
   │  Vendor  │ Enter phone
   └────┬─────┘
        │
        ↓
   ┌──────────────────┐
   │  Generate OTP    │ Math.random() → 6 digits
   │  Store in DB     │ Expiry: now + 5 minutes
   │  Send SMS        │ Console log in dev
   └──────────────────┘

2. OTP Verification
   ┌──────────┐
   │  Vendor  │ Enter OTP
   └────┬─────┘
        │
        ↓
   ┌──────────────────┐
   │  Verify OTP      │ Check DB for match
   │  Check expiry    │ Must be < 5 min old
   │  Mark verified   │ Prevent reuse
   └────┬─────────────┘
        │
        ↓
   ┌──────────────────┐
   │  Generate JWT    │ HS256 algorithm
   │  Payload:        │ vendorId, phoneNumber
   │  Expiry: 7 days  │ iat, exp timestamps
   └────┬─────────────┘
        │
        ↓
   ┌──────────┐
   │  Vendor  │ Store token
   └──────────┘

3. Authenticated Requests
   ┌──────────┐
   │  Vendor  │ API request
   └────┬─────┘
        │
        │ Authorization: Bearer <token>
        ↓
   ┌──────────────────┐
   │  Auth Middleware │ Extract token
   │  Verify signature│ Check expiry
   │  Decode payload  │ Inject vendor context
   └────┬─────────────┘
        │
        ↓
   ┌──────────────────┐
   │  Route Handler   │ Access req.vendor
   │  Validate owner  │ Check permissions
   │  Process request │ Return response
   └──────────────────┘
```

---

This architecture provides a scalable, secure, and maintainable foundation for the StreetBite application!
