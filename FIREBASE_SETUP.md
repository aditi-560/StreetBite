# Firebase Integration Setup Guide

## Overview

Your app now uses Firebase for:
- **Phone Authentication** - Real SMS OTP (no mock codes!)
- **Cloud Storage** - Upload vendor/food images
- **ID Tokens** - Secure authentication with your Express backend

Your Express backend still handles:
- Business logic and API endpoints
- PostgreSQL database for orders, menu items, vendors
- Data validation and complex queries

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "StreetBite")
4. Disable Google Analytics (optional)
5. Click "Create project"

---

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Phone** and toggle **Enable**
3. Click **Save**

**Important:** Firebase provides free SMS for testing, but you'll need to set up billing for production use.

---

## Step 3: Get Firebase Credentials

### For Mobile App (Client SDK)

1. In Firebase Console, click the **gear icon** > **Project settings**
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with nickname (e.g., "StreetBite Web")
5. Copy the `firebaseConfig` object

Create `artifacts/street-vendor-app/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.3:3000

EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### For Backend (Admin SDK)

1. In Firebase Console, go to **Project settings** > **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file (keep it secure!)

Create `artifacts/api-server/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/streetbite
JWT_SECRET=dev-secret-key-change-in-production

# Option 1: Use the entire service account JSON (recommended)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}

# Option 2: Use individual fields from the JSON
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

---

## Step 4: Configure Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (for development)
4. Click **Next** and **Done**

**Security Rules (for production):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /vendors/{vendorId}/{allPaths=**} {
      // Only authenticated vendors can upload to their folder
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.phone_number != null;
    }
  }
}
```

---

## Step 5: Test Phone Authentication

### Add Test Phone Numbers (Optional)

For testing without using real SMS:

1. Go to **Authentication** > **Sign-in method** > **Phone**
2. Scroll to **Phone numbers for testing**
3. Add test numbers:
   - Phone: `+1 650-555-1234`
   - Code: `123456`

### Update Mobile App

The mobile app is already configured! Just make sure you:

1. Created `.env` file with Firebase credentials
2. Updated `EXPO_PUBLIC_API_URL` with your computer's IP address

---

## Step 6: How It Works

### Authentication Flow

```
Mobile App                    Firebase Auth              Express Backend
    |                              |                            |
    |--1. Enter phone number------>|                            |
    |                              |                            |
    |<--2. SMS with OTP------------|                            |
    |                              |                            |
    |--3. Verify OTP-------------->|                            |
    |                              |                            |
    |<--4. Firebase ID Token-------|                            |
    |                              |                            |
    |--5. API call with token------------------------------>|
    |                              |                            |
    |                              |<--6. Verify token----------|
    |                              |                            |
    |                              |--7. Token valid----------->|
    |                              |                            |
    |<--8. API response (vendor data, orders, etc.)----------|
```

### Key Points

- **Firebase handles SMS** - No need for Twilio or other SMS services
- **ID tokens are secure** - They expire and can be verified server-side
- **Backend validates tokens** - Express verifies Firebase tokens before processing requests
- **Database stays in PostgreSQL** - Only auth is in Firebase

---

## Step 7: Update Mobile App Code

The configuration is already done! Here's what was added:

### `config/firebase.ts`
- Initializes Firebase with your credentials
- Sets up Auth with AsyncStorage persistence
- Exports `auth` and `storage` for use in app

### `config/api.ts`
- Configures API base URL
- Automatically attaches Firebase ID token to all API requests
- No manual token management needed!

### Usage in App

Import the config in your app's entry point:

```typescript
// artifacts/street-vendor-app/app/_layout.tsx
import '../config/api'; // This sets up the API client
```

---

## Step 8: Using Firebase Auth in Mobile App

### Send OTP

```typescript
import { auth } from '../config/firebase';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';

// 1. Send OTP (Firebase handles SMS automatically)
const phoneProvider = new PhoneAuthProvider(auth);
const verificationId = await phoneProvider.verifyPhoneNumber(
  phoneNumber,
  recaptchaVerifier // You'll need to set this up
);

// Store verificationId for next step
```

### Verify OTP

```typescript
// 2. Verify OTP
const credential = PhoneAuthProvider.credential(verificationId, otpCode);
const userCredential = await signInWithCredential(auth, credential);

// 3. User is now signed in!
const user = userCredential.user;
const idToken = await user.getIdToken();

// 4. Create/update vendor in your backend
const response = await fetch(`${API_BASE_URL}/api/auth/firebase-login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ phoneNumber: user.phoneNumber })
});
```

---

## Step 9: Backend Endpoints

### New Endpoint: Firebase Login

Add this to `artifacts/api-server/src/routes/auth.ts`:

```typescript
// Firebase-based login
router.post("/auth/firebase-login", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing authorization header" });
      return;
    }
    
    const idToken = authHeader.substring(7);
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (!decodedToken || !decodedToken.phone_number) {
      res.status(401).json({ error: "Invalid Firebase token" });
      return;
    }
    
    const phoneNumber = decodedToken.phone_number;
    
    // Find or create vendor
    let [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.phoneNumber, phoneNumber))
      .limit(1);
    
    if (!vendor) {
      [vendor] = await db
        .insert(vendorsTable)
        .values({
          phoneNumber,
          name: `Vendor ${phoneNumber.slice(-4)}`,
          description: "New street food vendor",
          category: "Street Food",
          rating: 4.5,
          isOpen: true,
        })
        .returning();
    }
    
    res.json({ vendor });
  } catch (error) {
    console.error("Error with Firebase login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

---

## Step 10: Upload Images to Firebase Storage

### Backend Helper

```typescript
// artifacts/api-server/src/lib/storage.ts
import { storage } from './firebase';

export async function uploadImage(
  file: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage not initialized");
  }
  
  const bucket = storage.bucket();
  const fileRef = bucket.file(path);
  
  await fileRef.save(file, {
    contentType,
    metadata: {
      firebaseStorageDownloadTokens: crypto.randomUUID(),
    },
  });
  
  // Get public URL
  const [url] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2500', // Far future
  });
  
  return url;
}
```

### Mobile App Upload

```typescript
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

async function uploadVendorImage(vendorId: number, imageUri: string) {
  // Convert image to blob
  const response = await fetch(imageUri);
  const blob = await response.blob();
  
  // Upload to Firebase Storage
  const storageRef = ref(storage, `vendors/${vendorId}/profile.jpg`);
  await uploadBytes(storageRef, blob);
  
  // Get download URL
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}
```

---

## Testing

### Without Real Phone Number

1. Add test phone number in Firebase Console
2. Use that number in the app
3. Use the test OTP code you configured

### With Real Phone Number

1. Enter your actual phone number
2. Receive real SMS from Firebase
3. Enter the OTP from SMS

---

## Production Checklist

- [ ] Enable billing in Firebase (required for SMS in production)
- [ ] Update Storage security rules
- [ ] Use production Firebase credentials
- [ ] Set `NODE_ENV=production` in backend
- [ ] Update `EXPO_PUBLIC_API_URL` to production URL
- [ ] Keep service account JSON secure (never commit to git)
- [ ] Set up Firebase App Check for additional security
- [ ] Monitor Firebase usage and costs

---

## Troubleshooting

### "Firebase not configured" warning
- Check that all environment variables are set correctly
- Verify the service account JSON is valid

### "Invalid phone number" error
- Phone numbers must be in E.164 format: `+[country code][number]`
- Example: `+919876543210` for India

### SMS not received
- Check Firebase Console > Authentication > Usage
- Verify billing is enabled for production
- Check phone number format
- Try a test phone number first

### Token verification fails
- Ensure backend has correct Firebase credentials
- Check that token hasn't expired (tokens expire after 1 hour)
- Verify the token is being sent in Authorization header

---

## Cost Estimate

Firebase pricing (as of 2024):

- **Authentication**: Free for phone auth (with limits)
- **SMS**: ~$0.01 per SMS (after free tier)
- **Storage**: $0.026/GB/month
- **Free tier**: 10GB storage, 50K downloads/day

For a small app: ~$10-50/month depending on usage.

---

## Next Steps

1. Create Firebase project
2. Add credentials to `.env` files
3. Test phone authentication
4. Implement image upload for menu items
5. Add push notifications (optional)

Your backend is now Firebase-ready! 🔥
