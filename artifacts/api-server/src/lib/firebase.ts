import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// In production, use service account JSON file
// For now, using environment variables
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if we have service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    // Production: Use service account JSON
    const credentials = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Development: Use individual environment variables
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    console.warn("⚠️  Firebase not configured. Phone auth will use mock OTP.");
    return null;
  }
};

// Initialize Firebase
const app = initializeFirebase();

// Export Firebase services
export const auth = app ? admin.auth() : null;
export const storage = app ? admin.storage() : null;
export const firebaseApp = app;

// Helper function to verify Firebase ID token
export async function verifyFirebaseToken(idToken: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}

// Helper function to get user by phone number
export async function getUserByPhoneNumber(phoneNumber: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  
  try {
    const user = await auth.getUserByPhoneNumber(phoneNumber);
    return user;
  } catch (error) {
    // User doesn't exist
    return null;
  }
}
