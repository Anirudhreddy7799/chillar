/**
 * Shared Firebase configuration
 * This file provides centralized access to Firebase configuration for both client and server
 */

export const FIREBASE_CONFIG = {
  projectId: "chillarclub351",
  apiKey: "AIzaSyBeKKQjIx0RGA5Gxo6tj2nJxmE3bufvDOc",
  authDomain: "chillarclub351.firebaseapp.com",
  storageBucket: "chillarclub351.appspot.com",
  messagingSenderId: "62243064163",
  appId: "1:62243064163:web:87c23dd60fbced4b6f2b56",
  databaseURL: "https://chillarclub351.firebaseio.com",
} as const;

// Function to validate Firebase config
export function validateFirebaseConfig() {
  const requiredFields = [
    "projectId",
    "apiKey",
    "authDomain",
    "storageBucket",
    "appId",
  ] as const;
  const missingFields = requiredFields.filter(
    (field) => !FIREBASE_CONFIG[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase configuration fields: ${missingFields.join(", ")}`
    );
  }

  return true;
}
