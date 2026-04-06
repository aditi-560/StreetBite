# Get Real SMS OTP - Complete Guide

You want to receive real SMS on your phone number. Here's how to set it up:

---

## Option 1: Use Twilio (Recommended - Easiest)

Twilio is the most popular SMS service and works great with your backend.

### Step 1: Create Twilio Account (5 minutes)

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your email and phone number
4. You'll get **$15 free credit** for testing!

### Step 2: Get Twilio Credentials

After signing up:

1. Go to Twilio Console: https://console.twilio.com/
2. You'll see your **Account SID** and **Auth Token**
3. Copy these values

### Step 3: Get a Twilio Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose your country (India: +91)
3. Select a number (free with trial credit!)
4. Click **Buy**

### Step 4: Update Backend .env

Edit `artifacts/api-server/.env`:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/streetbite
JWT_SECRET=dev-secret-key-change-in-production

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 5: Install Twilio in Backend

```bash
cd artifacts/api-server
npm install twilio
```

### Step 6: Update OTP Service

I'll update the code to use Twilio for sending SMS.

### Step 7: Start Backend

```bash
cd artifacts/api-server
pnpm run dev
```

### Step 8: Update Mobile App to Use Backend

The mobile app needs to call your backend API instead of Firebase directly.

### Step 9: Test!

1. Open mobile app
2. Enter your phone number
3. Click "Send OTP"
4. **Check your phone for real SMS!** 📱
5. Enter the OTP
6. Login successful!

---

## Option 2: Use Firebase Test Numbers (No SMS, No Cost)

If you just want to test without real SMS:

1. Go to Firebase Console
2. **Authentication** → **Sign-in method** → **Phone**
3. Scroll to **"Phone numbers for testing"**
4. Add your number: `+919876543210`
5. Set test code: `654321` (any 6-digit code)
6. Click **"Add"**

Now in the app:
- Enter your number
- Firebase won't send SMS
- Use your test code: `654321`
- Works perfectly!

---

## Option 3: Use MSG91 (India-specific, Cheaper)

If you're in India, MSG91 is cheaper than Twilio:

1. Sign up at https://msg91.com/
2. Get API key
3. Similar setup to Twilio

---

## Cost Comparison

### Twilio
- **Free trial**: $15 credit (~300 SMS)
- **Cost**: ₹0.50-1.00 per SMS in India
- **Pros**: Most reliable, great docs
- **Cons**: Slightly expensive

### MSG91 (India)
- **Free trial**: 100 SMS
- **Cost**: ₹0.15-0.25 per SMS
- **Pros**: Cheaper for India
- **Cons**: India-only

### Firebase Test Numbers
- **Cost**: FREE!
- **Pros**: No cost, works in Expo Go
- **Cons**: Not real SMS, manual setup per number

---

## My Recommendation

**For Development/Testing:**
→ Use Firebase test numbers (FREE, works now!)

**For Production:**
→ Use Twilio (reliable, works worldwide)

**For India-only app:**
→ Use MSG91 (cheaper)

---

## Quick Setup: Firebase Test Numbers (2 minutes)

This is the fastest way to test with your real number:

1. Firebase Console → Your Project
2. Authentication → Sign-in method → Phone
3. Scroll down to "Phone numbers for testing"
4. Click "Add phone number"
5. Phone: `+919876543210` (your number with +91)
6. Code: `654321` (any 6-digit code you want)
7. Click "Add"

Done! Now:
- Enter your number in app
- Use code `654321`
- No SMS sent, but works perfectly!

---

## Need Help Setting Up Twilio?

Let me know and I'll:
1. Update the backend code to use Twilio
2. Update the mobile app to call backend API
3. Test it end-to-end

Would you like me to:
- A) Set up Twilio integration (real SMS)
- B) Use Firebase test numbers (no SMS, works now)
- C) Use MSG91 (India-specific)

Let me know which option you prefer! 🚀
