/**
 * Client-side application configuration
 * 
 * This provides centralized access to all environment variables and default values
 * for the frontend application, making it more portable across development environments.
 */

// Get the environment or default to development
const APP_ENV = import.meta.env.MODE || 'development';

// Get the base URL, falling back to the current origin
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

// Dynamically determine the Firebase Auth domain based on project ID
const getFirebaseAuthDomain = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return projectId ? `${projectId}.firebaseapp.com` : '';
};

// Dynamically determine the Firebase Storage bucket based on project ID
const getFirebaseStorageBucket = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return projectId ? `${projectId}.appspot.com` : '';
};

export const CONFIG = {
  // App info
  APP_NAME: "Chillar Club",
  APP_ENV,
  ADMIN_EMAILS: ["admin@chillarclub.in"],
  SUPPORT_EMAIL: "support@chillarclub.in",
  
  // API and URLs
  BASE_URL,
  API_BASE_URL: `${BASE_URL}/api`,
  
  // Feature flags
  IS_PRODUCTION: APP_ENV === 'production',
  IS_DEVELOPMENT: APP_ENV === 'development',
  
  // Firebase (Client-side)
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  
  // Computed Firebase properties
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || getFirebaseAuthDomain(),
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || getFirebaseStorageBucket(),
  
  // Legacy Firebase fields (kept for backward compatibility)
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  
  // Razorpay (Client-side public key only)
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  
  // Region
  REGION: "asia-south1",
  
  // Subscription details
  SUBSCRIPTION_PRICE: 30, // INR
  SUBSCRIPTION_INTERVAL: "monthly",
  
  // Utility functions
  hasFirebaseConfig: () => !!(
    import.meta.env.VITE_FIREBASE_API_KEY && 
    import.meta.env.VITE_FIREBASE_PROJECT_ID && 
    import.meta.env.VITE_FIREBASE_APP_ID
  ),
};
