# Quick Start Guide

## What You Have Now

✅ Express backend with Firebase integration
✅ React Native mobile app with Firebase Auth ready
✅ PostgreSQL database for business data
✅ Mock OTP (123456) works without Firebase setup
✅ Ready to add real SMS when you configure Firebase

---

## Start Without Firebase (Mock OTP)

### 1. Start Backend
```bash
cd artifacts/api-server
pnpm run dev
```

Backend runs on `http://localhost:3000`

### 2. Start Mobile App
```bash
cd artifacts/street-vendor-app
pnpm run dev
```

### 3. Test Login
- Phone: Any 10-digit number (e.g., `9876543210`)
- OTP: `123456` (always works in dev mode)

---

## Start With Firebase (Real SMS)

### 1. Create Firebase Project
Follow `FIREBASE_SETUP.md` steps 1-3 to:
- Create Firebase project
- Enable Phone Authentication
- Get credentials

### 2. Add Credentials

**Backend** (`artifacts/api-server/.env`):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Mobile App** (`artifacts/street-vendor-app/.env`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.3:3000

EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Start Everything
```bash
# Terminal 1: Backend
cd artifacts/api-server
pnpm run dev

# Terminal 2: Mobile App
cd artifacts/street-vendor-app
pnpm run dev
```

### 4. Test Real SMS
- Enter your real phone number
- Receive SMS from Firebase
- Enter the OTP from SMS

---

## What Changed

### Backend
- ✅ Firebase Admin SDK installed
- ✅ Can verify Firebase ID tokens
- ✅ Supports both JWT and Firebase tokens
- ✅ Falls back to mock OTP if Firebase not configured

### Mobile App
- ✅ Firebase SDK installed
- ✅ Firebase config ready
- ✅ API client auto-attaches Firebase tokens
- ✅ Ready for phone authentication

### What Still Works
- ✅ All existing API endpoints
- ✅ PostgreSQL database
- ✅ Mock OTP for testing
- ✅ JWT tokens (backward compatible)

---

## Architecture

```
┌─────────────────┐
│   Mobile App    │
│  (React Native) │
└────────┬────────┘
         │
         │ Firebase ID Token
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Express API    │◄────►│  PostgreSQL  │
│   (Node.js)     │      │   Database   │
└────────┬────────┘      └──────────────┘
         │
         │ Verify Token
         │
         ▼
┌─────────────────┐
│  Firebase Auth  │
│  (Phone + SMS)  │
└─────────────────┘
```

---

## Next Steps

1. **Test with mock OTP** - Start both servers and test login
2. **Create Firebase project** - Follow FIREBASE_SETUP.md
3. **Add real SMS** - Configure Firebase credentials
4. **Add image upload** - Use Firebase Storage for vendor images
5. **Deploy** - Host backend and configure production Firebase

---

## Need Help?

- **Mock OTP not working?** - Check backend logs for errors
- **Can't connect to backend?** - Update `EXPO_PUBLIC_API_URL` with your IP
- **Firebase errors?** - See FIREBASE_SETUP.md troubleshooting section
- **Database errors?** - Make sure PostgreSQL is running

Your app is ready to run! 🚀
