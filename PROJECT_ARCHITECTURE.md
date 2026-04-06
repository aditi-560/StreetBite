# Project Architecture & Firebase Integration Guide

## 📋 Project Overview

This is a **pnpm monorepo workspace** for a Street Vendor Order Management System called **StreetBite**. It contains:
- Backend API server (Express + TypeScript)
- Mobile app (Expo React Native)
- React mockup sandbox (for UI component previews)
- Shared libraries for API clients, database, and validation

---

## 🏗️ Project Structure

```
workspace/
├── artifacts/                    # Deployable applications
│   ├── api-server/              # Express REST API (Backend)
│   ├── street-vendor-app/       # Expo mobile app (Frontend)
│   └── mockup-sandbox/          # React component preview server
│
├── lib/                         # Shared libraries
│   ├── api-spec/               # OpenAPI specification (source of truth)
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod validation schemas
│   └── db/                     # Drizzle ORM + PostgreSQL
│
├── scripts/                     # Utility scripts
├── pnpm-workspace.yaml         # Monorepo configuration
└── tsconfig.base.json          # Shared TypeScript config
```

---

## 🔄 How Everything Connects

### 1. **API Specification (Source of Truth)**
- Location: `lib/api-spec/openapi.yaml`
- Defines all API endpoints, request/response schemas
- Currently has one endpoint: `GET /api/healthz`

### 2. **Code Generation Flow**
```
openapi.yaml (API Spec)
    ↓
    ├─→ Orval generates → api-client-react (React Query hooks)
    └─→ Orval generates → api-zod (Zod validation schemas)
```

### 3. **Backend API Server**
- **Location**: `artifacts/api-server/`
- **Stack**: Express 5 + TypeScript
- **Port**: Configured via `PORT` environment variable
- **Database**: PostgreSQL via Drizzle ORM (`@workspace/db`)
- **Validation**: Uses Zod schemas from `@workspace/api-zod`
- **Build**: esbuild bundles to CommonJS (`dist/index.mjs`)
- **Entry**: `src/index.ts` → `src/app.ts` → `src/routes/`

**Current Routes:**
- `GET /api/healthz` - Health check endpoint

### 4. **Mobile App (StreetBite)**
- **Location**: `artifacts/street-vendor-app/`
- **Stack**: Expo 54 + React Native + Expo Router
- **Features**:
  - Customer flow: QR scanner → Menu → Cart → Order → Tracking
  - Vendor flow: Phone login → OTP → Dashboard → Queue management
- **State**: React Context (`context/AppContext.tsx`)
- **Storage**: AsyncStorage for persistence
- **API Client**: Uses `@workspace/api-client-react`

### 5. **Mockup Sandbox**
- **Location**: `artifacts/mockup-sandbox/`
- **Purpose**: Preview React components in isolation
- **Stack**: Vite + React + Tailwind + shadcn/ui
- **Access**: `/preview/ComponentName` routes

---

## 🚀 How to Run the Frontend (Mobile App)

### Prerequisites
```bash
# Install dependencies
pnpm install

# Make sure you have Expo CLI
pnpm add -g @expo/cli
```

### Development Mode
```bash
# Navigate to mobile app
cd artifacts/street-vendor-app

# Start Expo dev server
pnpm run dev
```

This will:
1. Start Metro bundler on the configured PORT
2. Generate QR code for Expo Go app
3. Enable hot reload for development

### Access Options
1. **Expo Go App** (iOS/Android): Scan QR code
2. **iOS Simulator**: Press `i` in terminal
3. **Android Emulator**: Press `a` in terminal
4. **Web**: Press `w` in terminal (limited functionality)

---

## 🔥 Firebase Integration Guide

### Current State
- Backend uses **PostgreSQL** with Drizzle ORM
- No Firebase integration yet

### Integration Strategy

#### Option 1: Firebase as Primary Backend (Replace Express)
**Use Case**: If you want Firebase to handle everything

1. **Install Firebase SDK**
```bash
cd artifacts/street-vendor-app
pnpm add firebase
```

2. **Create Firebase Config**
```typescript
// artifacts/street-vendor-app/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

3. **Update Mobile App to Use Firebase**
```typescript
// Replace mock data with Firestore queries
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Example: Fetch menu items
const menuRef = collection(db, 'menuItems');
const snapshot = await getDocs(menuRef);
const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

4. **Firebase Authentication**
```typescript
// artifacts/street-vendor-app/app/vendor/login.tsx
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebase';

const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
await confirmation.confirm(otpCode);
```

---

#### Option 2: Hybrid (Express + Firebase)
**Use Case**: Keep Express API, add Firebase for auth/storage

1. **Install Firebase Admin SDK** (Backend)
```bash
cd artifacts/api-server
pnpm add firebase-admin
```

2. **Configure Firebase Admin**
```typescript
// artifacts/api-server/src/lib/firebase.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export const firestore = admin.firestore();
export const auth = admin.auth();
```

3. **Add Auth Middleware**
```typescript
// artifacts/api-server/src/middlewares/auth.ts
import { auth } from '../lib/firebase';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

4. **Update Mobile App API Client**
```typescript
// artifacts/street-vendor-app/config/api.ts
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { auth } from './firebase';

// Set API base URL
setBaseUrl('https://your-api-server.com');

// Attach Firebase token to all requests
setAuthTokenGetter(async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
});
```

---

## 🔌 Connecting Frontend to Backend

### Current Setup (Local Development)
The mobile app uses the custom fetch client from `@workspace/api-client-react`:

```typescript
// In mobile app
import { useHealthCheck } from '@workspace/api-client-react';

function MyComponent() {
  const { data, isLoading } = useHealthCheck();
  // data will be { status: "ok" }
}
```

### Configure API Base URL

**For Expo Development:**
```typescript
// artifacts/street-vendor-app/app/_layout.tsx
import { setBaseUrl } from '@workspace/api-client-react';

// Point to your backend
setBaseUrl('http://192.168.1.100:3000'); // Local network IP
// OR
setBaseUrl('https://your-replit-url.repl.co'); // Replit deployment
```

**For Production:**
```typescript
setBaseUrl(process.env.EXPO_PUBLIC_API_URL);
```

Add to `.env`:
```
EXPO_PUBLIC_API_URL=https://api.streetbite.com
```

---

## 🗄️ Database Schema

Currently empty (`lib/db/src/schema/index.ts`). You'll need to define tables:

```typescript
// lib/db/src/schema/vendors.ts
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({ id: true });
export type Vendor = typeof vendorsTable.$inferSelect;
```

Then run:
```bash
cd lib/db
pnpm run push  # Push schema to database
```

---

## 🛠️ Development Workflow

### 1. Start Backend
```bash
cd artifacts/api-server
pnpm run dev  # Builds and starts on PORT
```

### 2. Start Mobile App
```bash
cd artifacts/street-vendor-app
pnpm run dev  # Starts Expo dev server
```

### 3. Make API Changes
1. Update `lib/api-spec/openapi.yaml`
2. Regenerate clients: `cd lib/api-spec && pnpm run generate`
3. Implement in `artifacts/api-server/src/routes/`
4. Use in mobile app via generated hooks

---

## 📦 Key Dependencies

### Backend
- `express` - Web framework
- `drizzle-orm` - Database ORM
- `zod` - Validation
- `pino` - Logging
- `cors` - CORS middleware

### Mobile App
- `expo` - React Native framework
- `expo-router` - File-based routing
- `@tanstack/react-query` - Data fetching
- `expo-camera` - QR scanning
- `@react-native-async-storage/async-storage` - Local storage

### Shared
- `typescript` - Type safety
- `pnpm` - Package manager
- `orval` - API client generation

---

## 🔐 Environment Variables

### Backend (`artifacts/api-server/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/streetbite
NODE_ENV=development
```

### Mobile App (`artifacts/street-vendor-app/.env`)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
EXPO_PUBLIC_FIREBASE_API_KEY=your-key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
```

---

## 🚨 Common Issues & Solutions

### Issue: Mobile app can't connect to backend
**Solution**: 
- Use your computer's local IP (not localhost)
- Ensure backend is running
- Check firewall settings
- Use `setBaseUrl()` to configure API endpoint

### Issue: "Cannot find module @workspace/..."
**Solution**: Run `pnpm install` at root level

### Issue: Database connection error
**Solution**: 
- Ensure PostgreSQL is running
- Check `DATABASE_URL` environment variable
- Run `pnpm run push` in `lib/db` to create tables

---

## 📚 Next Steps

1. **Define Database Schema**: Add tables in `lib/db/src/schema/`
2. **Expand API**: Add endpoints in `lib/api-spec/openapi.yaml`
3. **Implement Routes**: Create handlers in `artifacts/api-server/src/routes/`
4. **Connect Mobile App**: Replace mock data with API calls
5. **Add Firebase**: Follow integration guide above
6. **Deploy**: Use Replit, Vercel, or your preferred platform

---

## 🎯 Firebase Integration Recommendation

For StreetBite, I recommend **Option 2 (Hybrid)**:
- Use Firebase Auth for phone authentication (OTP)
- Use Firebase Storage for vendor/food images
- Use Firebase Cloud Messaging for order notifications
- Keep Express API for business logic and complex queries
- Use PostgreSQL for relational data (orders, menu items, etc.)

This gives you the best of both worlds: Firebase's excellent mobile SDKs and your own controlled backend logic.
