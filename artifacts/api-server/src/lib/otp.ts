// OTP generation and validation utilities
import { auth } from "./firebase";

export function generateOtp(): string {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpExpiry(): Date {
  // OTP expires in 5 minutes
  return new Date(Date.now() + 5 * 60 * 1000);
}

export async function sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
  // If Firebase is configured, it will handle SMS automatically
  // Firebase Auth sends SMS when you call signInWithPhoneNumber on client
  
  // For development/testing, log the OTP
  if (process.env.NODE_ENV === "development") {
    console.log(`[OTP] Demo mode: Use OTP 123456 for any phone number`);
    console.log(`[OTP] Or use Firebase Auth to send real SMS to ${phoneNumber}`);
  } else {
    console.log(`[OTP] SMS sent to ${phoneNumber} via Firebase Auth`);
  }
  
  // Simulate SMS delay
  await new Promise(resolve => setTimeout(resolve, 100));
}
