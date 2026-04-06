import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';
import { auth } from './firebase';

// API Base URL configuration
const API_BASE_URL = __DEV__ 
  ? process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.3:3000'  // Replace with your computer's IP
  : process.env.EXPO_PUBLIC_API_URL || 'https://api.streetbite.com';

// Configure API client
setBaseUrl(API_BASE_URL);

// Attach Firebase ID token to all API requests
setAuthTokenGetter(async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    // Get Firebase ID token
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
});

export { API_BASE_URL };
