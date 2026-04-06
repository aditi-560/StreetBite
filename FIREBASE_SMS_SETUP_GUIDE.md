# Firebase SMS OTP Setup Guide

Follow these steps to get real SMS OTP working on your phone.

---

## Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `StreetBite` (or any name you like)
4. Click **Continue**
5. **Disable Google Analytics** (optional, not needed for now)
6. Click **Create project**
7. Wait for project creation, then click **Continue**

---

## Step 2: Enable Phone Authentication (2 minutes)

1. In Firebase Console, click **Authentication** in left sidebar
2. Click **Get started** button
3. Go to **Sign-in method** tab
4. Find **Phone** in the list
5. Click on **Phone**
6. Toggle **Enable** switch to ON
7. Click **Save**

✅ Phone authentication is now enabled!

---

## Step 3: Register Your App (3 minutes)

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>`
5. Enter app nickname: `StreetBite Mobile`
6. **DO NOT** check "Also set up Firebase Hosting"
7. Click **Register app**
8. You'll see a `firebaseConfig` object - **KEEP THIS PAGE OPEN**

---

## Step 4: Copy Firebase Credentials

From the `firebaseConfig` object on the screen, copy these values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

---

## Step 5: Update Mobile App .env File

Open `artifacts/street-vendor-app/.env` and replace with your Firebase credentials:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://192.168.1.3:3000

# Firebase Configuration - REPLACE WITH YOUR VALUES
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important:** Replace ALL the values with your actual Firebase credentials!

---

## Step 6: Test Phone Numbers (Optional - For Testing)

Before using real phone numbers, you can add test numbers:

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Scroll to **Phone numbers for testing**
3. Click **Add phone number**
4. Add your number in international format: `+919876543210`
5. Set verification code: `123456` (or any 6-digit code)
6. Click **Add**

✅ Now you can test without using SMS quota!

---

## Step 7: Enable Billing (Required for Production)

**For testing:** Firebase provides free SMS for development.

**For production:** You need to enable billing:

1. Go to Firebase Console
2. Click **Upgrade** in left sidebar
3. Choose **Blaze (Pay as you go)** plan
4. Add payment method
5. Set budget alerts (recommended: $10/month)

**SMS Pricing:**
- India: ~₹0.50 per SMS
- USA: ~$0.01 per SMS
- Most countries: $0.01-0.05 per SMS

---

## Step 8: Update App Code (I'll do this for you)

I'll update the login and OTP screens to use Firebase authentication.

---

## Step 9: Restart Mobile App

After updating the `.env` file:

1. Stop the Expo dev server (Ctrl+C)
2. Start it again: `pnpm run dev`
3. Reload the app on your phone

---

## Step 10: Test Real SMS!

1. Open the app
2. Click **Vendor**
3. Enter your real phone number (with country code)
4. Click **Send OTP**
5. **Check your phone for SMS!** 📱
6. Enter the OTP from SMS
7. Login successful! 🎉

---

## Troubleshooting

### "Invalid phone number" error
- Use international format: `+919876543210` (India)
- Include country code with `+`

### SMS not received
- Check Firebase Console > Authentication > Usage
- Verify phone number is correct
- Try a test phone number first
- Check spam/blocked messages

### "Firebase not configured" error
- Make sure `.env` file has correct values
- Restart Expo dev server
- Clear app cache: `pnpm exec expo start --clear`

### "Quota exceeded" error
- You've hit the free tier limit
- Enable billing in Firebase Console
- Or use test phone numbers

---

## Cost Estimate

**Free Tier:**
- 10 SMS/day for testing
- Unlimited test phone numbers

**Paid (Blaze Plan):**
- ~₹0.50 per SMS in India
- ~$0.01 per SMS in USA
- For 100 users/day: ~₹50-100/day (~₹1500-3000/month)

---

## Security Best Practices

1. **Enable App Check** (recommended for production)
   - Prevents abuse of your Firebase project
   - Go to Firebase Console > App Check

2. **Set up reCAPTCHA** (automatic in web)
   - Prevents bot attacks
   - Already configured in Firebase Auth

3. **Monitor usage**
   - Check Firebase Console > Authentication > Usage
   - Set up budget alerts

4. **Rate limiting**
   - Firebase automatically rate limits
   - Max 5 SMS per phone number per hour

---

## Next Steps After Setup

1. ✅ Test with your phone number
2. ✅ Add test numbers for team members
3. ✅ Enable billing before going live
4. ✅ Set up App Check for security
5. ✅ Monitor usage and costs

---

## Need Help?

- Firebase Docs: https://firebase.google.com/docs/auth/web/phone-auth
- Firebase Support: https://firebase.google.com/support
- Check `FIREBASE_SETUP.md` for more details

Your app is ready for real SMS! 🚀
