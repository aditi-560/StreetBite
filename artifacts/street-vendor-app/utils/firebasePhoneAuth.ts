import { auth } from '@/config/firebase';
import { 
  PhoneAuthProvider, 
  signInWithCredential,
  RecaptchaVerifier,
  ApplicationVerifier
} from 'firebase/auth';

// For React Native, we need to use a different approach
// This is a placeholder for the actual implementation

export interface PhoneAuthResult {
  verificationId: string;
}

/**
 * Send OTP to phone number
 * Note: This requires platform-specific implementation
 * - For web: Use RecaptchaVerifier
 * - For React Native: Use expo-firebase-recaptcha or similar
 */
export async function sendPhoneOTP(phoneNumber: string): Promise<PhoneAuthResult> {
  try {
    // For web platform
    if (typeof window !== 'undefined') {
      // Create reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
      });

      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier as ApplicationVerifier
      );

      return { verificationId };
    }
    
    // For React Native (Expo)
    // You would use expo-firebase-recaptcha here
    throw new Error('Phone auth not yet implemented for React Native. Use demo mode for now.');
    
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
}

/**
 * Verify OTP code
 */
export async function verifyPhoneOTP(verificationId: string, code: string) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCredential = await signInWithCredential(auth, credential);
    
    return {
      user: userCredential.user,
      idToken: await userCredential.user.getIdToken(),
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    throw new Error(error.message || 'Invalid OTP');
  }
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  return !!(apiKey && apiKey !== 'demo-api-key');
}
