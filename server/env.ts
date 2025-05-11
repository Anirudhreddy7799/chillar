/**
 * Environment configuration utility
 *
 * This file centralizes all environment variable access and provides defaults
 * to make the application more portable across different environments.
 */

export const env = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",

  // Storage Configuration
  USE_FIREBASE_AS_PRIMARY: true, // Always use Firebase

  // Firebase Admin (Server-side)
  FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || "",

  // Utility functions
  isDev: () => process.env.NODE_ENV !== "production",
  isProd: () => process.env.NODE_ENV === "production",

  // Check if we have complete Firebase config
  hasFirebaseConfig: () =>
    !!(
      process.env.VITE_FIREBASE_API_KEY &&
      process.env.VITE_FIREBASE_PROJECT_ID &&
      process.env.VITE_FIREBASE_APP_ID
    ),

  // Check if we have complete Razorpay config
  hasRazorpayConfig: () =>
    !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),

  // Use development mode for payments when no Razorpay API keys
  useDevPayments: () =>
    process.env.NODE_ENV !== "production" ||
    !(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
};

export default env;
