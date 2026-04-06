# SMS Not Working? Here's the Fix!

## ✅ What I Just Fixed

I've updated the code to actually send real SMS via Firebase! The previous code only detected Firebase but didn't send SMS.

---

## 🔄 What You Need to Do Now

### 1. Restart the App (IMPORTANT!)

```bash
# Stop the current Expo server (Ctrl+C)
cd artifacts/street-vendor-app
pnpm exec expo start --clear
```

The `--clear` flag clears the cache and loads the new code.

### 2. Reload on Your Phone

- If using Expo Go: Shake phone → "Reload"
- Or close and reopen the app

---

## 📱 Testing Real SMS

### Option A: On Physical Device (Recommended)

1. Open Expo Go app on your phone
2. Scan the QR code from terminal
3. Click "Vendor" → Enter your phone number
4. Click "Send OTP"
5. **Check your phone for SMS!** 📱
6. Enter the OTP from SMS
7. Login successful!

### Option B: Use Test Phone Numbers (No SMS Cost)

If SMS still doesn't work or you want to test without using SMS quota:

1. Go to Firebase Console
2. **Authentication** → **Sign-in method** → **Phone**
3. Scroll to **"Phone numbers for testing"**
4. Click **"Add phone number"**
5. Add: `+919876543210` (your number with country code)
6. Set code: `123456` (or any 6-digit code)
7. Click **"Add"**

Now when you enter that number in the app, it won't send SMS but will accept the test code!

---

## 🔍 Check If It's Working

### In the Console/Terminal:

When you click "Send OTP", you should see:

✅ **If Firebase is working:**
```
🔥 Sending real SMS via Firebase to: +919876543210
✅ SMS sent successfully!
```

❌ **If Firebase fails:**
```
⚠️ Firebase failed, using demo mode
```

❌ **If Firebase not configured:**
```
🧪 Using demo mode - OTP is always 123456
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Demo mode" still showing

**Cause:** App not reloaded with new code

**Fix:**
```bash
pnpm exec expo start --clear
```
Then reload app on phone.

---

### Issue 2: "Firebase failed" error

**Possible causes:**

**A. Billing not enabled (most common)**
- Firebase needs billing enabled for SMS in production
- Go to Firebase Console → Upgrade to Blaze plan
- Don't worry: Free tier includes 10 SMS/day for testing!

**B. Phone number format wrong**
- Must include country code: `+919876543210`
- Check the code in login.tsx (line with `+91${phone}`)
- Change `+91` to your country code if not India

**C. Firebase quota exceeded**
- You've hit the free 10 SMS/day limit
- Either enable billing or use test phone numbers

**D. reCAPTCHA verification failed**
- This can happen on some devices
- Use test phone numbers instead (see Option B above)

---

### Issue 3: SMS sent but not received

**Check:**
1. Phone number is correct (with country code)
2. Phone can receive SMS (try sending from another phone)
3. Check spam/blocked messages
4. Wait 1-2 minutes (sometimes delayed)
5. Check Firebase Console → Authentication → Usage (shows if SMS was sent)

---

### Issue 4: "Invalid verification code" error

**Cause:** Entered wrong OTP or OTP expired

**Fix:**
- Check the SMS for correct code
- OTP expires after 5 minutes
- Click "Resend OTP" to get a new one

---

## 💰 About Firebase Billing

**Free Tier (No billing):**
- 10 SMS/day for testing
- Perfect for development
- Unlimited test phone numbers

**Blaze Plan (Pay as you go):**
- Required for production
- ~₹0.50 per SMS in India
- ~$0.01 per SMS in USA
- Set budget alerts to control costs

**To enable billing:**
1. Firebase Console → Upgrade
2. Choose "Blaze (Pay as you go)"
3. Add payment method
4. Set budget alert (e.g., $10/month)

---

## ✅ Verification Checklist

Run through this checklist:

- [ ] Restarted Expo with `--clear` flag
- [ ] Reloaded app on phone
- [ ] Using Expo Go on physical device (not web browser)
- [ ] Firebase credentials in `.env` are correct
- [ ] Phone number includes country code
- [ ] Console shows "🔥 Sending real SMS via Firebase"
- [ ] Either billing enabled OR using test phone numbers

---

## 🎯 Quick Test

**Test with demo mode first:**
1. Enter any number: `9876543210`
2. Console should show Firebase attempt
3. If Firebase fails, it falls back to demo
4. Use OTP: `123456`
5. Should login successfully

**Then test with real SMS:**
1. Add your number as test number in Firebase
2. Enter your real number
3. Use the test code you set
4. Should work without sending SMS!

---

## 📞 Still Not Working?

Check these logs in the console:

1. **When clicking "Send OTP":**
   - Should see Firebase attempt
   - Should see success or error message

2. **When entering OTP:**
   - Should see verification attempt
   - Should see success or specific error

Share these console logs if you need more help!

---

## 🚀 Next Steps

Once SMS is working:

1. ✅ Test with your phone number
2. ✅ Add team members as test numbers
3. ✅ Enable billing before going live
4. ✅ Monitor usage in Firebase Console

Your app is now ready for real SMS! 📱🔥
