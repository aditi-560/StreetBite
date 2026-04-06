# Setup Real SMS with Firebase - Quick Start

## Current Status

✅ Firebase SDK installed
✅ Configuration files ready
✅ Demo mode working (OTP: 123456)
⏳ Waiting for Firebase credentials

---

## Quick Setup (15 minutes)

### 1. Create Firebase Project

Visit: https://console.firebase.google.com/

1. Click "Add project"
2. Name: `StreetBite`
3. Disable Analytics
4. Click "Create project"

### 2. Enable Phone Auth

1. Go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Phone**
4. Click **Save**

### 3. Get Web App Credentials

1. Click ⚙️ → **Project settings**
2. Scroll to "Your apps"
3. Click Web icon `</>`
4. Register app: `StreetBite Mobile`
5. Copy the `firebaseConfig` values

### 4. Update .env File

Edit `artifacts/street-vendor-app/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.3:3000

# Replace these with YOUR Firebase values:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Restart App

```bash
# Stop current server (Ctrl+C)
cd artifacts/street-vendor-app
pnpm exec expo start --clear
```

### 6. Test!

1. Open app
2. Click "Vendor"
3. Enter your phone: `9876543210`
4. Check console - should say "🔥 Using Firebase"
5. For now, still use demo OTP: `123456`

---

## For Real SMS (Native App Only)

Firebase phone auth with real SMS works best on:
- ✅ Real iOS device (via Expo Go or build)
- ✅ Real Android device (via Expo Go or build)
- ❌ Web (requires reCAPTCHA setup)
- ❌ Emulator (limited functionality)

### To Test on Real Device:

1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will use Firebase
4. Real SMS will be sent! 📱

### For Web Testing:

Use test phone numbers in Firebase Console:
1. Authentication → Sign-in method → Phone
2. Scroll to "Phone numbers for testing"
3. Add: `+919876543210` → Code: `123456`
4. Now this number works without SMS!

---

## Cost

**Free Tier:**
- 10 SMS/day for testing
- Unlimited test phone numbers

**Paid (after enabling billing):**
- India: ~₹0.50 per SMS
- USA: ~$0.01 per SMS
- 100 users/day = ~₹50/day

---

## Troubleshooting

### "Demo mode" still showing
- Check `.env` has real Firebase values
- Restart Expo server with `--clear` flag
- Check console logs for Firebase status

### "Firebase not configured"
- Verify all EXPO_PUBLIC_* variables are set
- No quotes around values in .env
- Restart server after changing .env

### Want to test without SMS?
- Use test phone numbers (see above)
- Or keep using demo mode (OTP: 123456)

---

## What's Next?

After adding Firebase credentials:

1. ✅ App detects Firebase automatically
2. ✅ Shows "Firebase configured" message
3. ⏳ Real SMS needs native app (not web)
4. ⏳ Or use test phone numbers

For production:
1. Build native app (iOS/Android)
2. Enable billing in Firebase
3. Real SMS will work automatically!

---

## Need Help?

Check these files:
- `FIREBASE_SMS_SETUP_GUIDE.md` - Detailed setup
- `FIREBASE_SETUP.md` - Complete Firebase guide
- Console logs - Shows Firebase status

Your app is ready for Firebase! Just add the credentials. 🚀
