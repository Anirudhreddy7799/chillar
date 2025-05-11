/**
 * Client-side application configuration
 *
 * This provides centralized access to all environment variables and default values
 * for the frontend application, making it more portable across development environments.
 */

import { FIREBASE_CONFIG } from "@shared/firebase-config";

// Get the environment or default to development
const APP_ENV = import.meta.env.MODE || "development";

// Get the base URL, falling back to the current origin
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || window.location.origin;

// Dynamically determine the Firebase Auth domain based on project ID
const getFirebaseAuthDomain = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return projectId ? `${projectId}.firebaseapp.com` : "";
};

// Dynamically determine the Firebase Storage bucket based on project ID
const getFirebaseStorageBucket = () => {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return projectId ? `${projectId}.appspot.com` : "";
};

export const CONFIG = {
  // App info
  APP_NAME: "Chillar Club",
  APP_ENV,
  ADMIN_EMAILS: ["admin@chillarclub.in"],
  SUPPORT_EMAIL: "support@chillarclub.in",

  // Firebase config
  FIREBASE: FIREBASE_CONFIG,

  // API and URLs
  BASE_URL,
  API_BASE_URL: `${BASE_URL}/api`,

  // Feature flags
  IS_PRODUCTION: APP_ENV === "production",
  IS_DEVELOPMENT: APP_ENV === "development",

  // Firebase (Client-side)
  FIREBASE_API_KEY: "AIzaSyBeKKQjIx0RGA5Gxo6tj2nJxmE3bufvDOc",
  FIREBASE_PROJECT_ID: "chillarclub351",
  FIREBASE_APP_ID: "1:62243064163:web:87c23dd60fbced4b6f2b56",
  FIREBASE_MESSAGING_SENDER_ID: "62243064163",
  // Firebase computed properties
  FIREBASE_AUTH_DOMAIN: "chillarclub351.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET: "chillarclub351.appspot.com",

  // Razorpay (Client-side public key only)
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || "",

  // Region
  REGION: "asia-south1",

  // Subscription details
  SUBSCRIPTION_PRICE: 30, // INR
  SUBSCRIPTION_INTERVAL: "monthly",

  // Utility functions
  hasFirebaseConfig: () =>
    !!(
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.appId
    ),
};
