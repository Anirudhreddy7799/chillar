/**
 * Test script to verify that Firebase authentication data is syncing properly with the PostgreSQL database
 * This should be run in a development environment only!
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';

// Firebase configuration - Replace with actual config values for testing
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.appspot.com`,
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

async function testFirebaseDbSync() {
  console.log("Testing Firebase and database synchronization...");
  
  if (!process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_PROJECT_ID || !process.env.VITE_FIREBASE_APP_ID) {
    console.error("Firebase configuration missing. Make sure to set VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID");
    process.exit(1);
  }
  
  const testEmail = `test-user-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log(`Creating test user with email: ${testEmail}`);
    
    // Step 1: Create a user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log(`Firebase user created with UID: ${user.uid}`);
    
    // Step 2: Wait a moment for the API call to our server to complete (registration endpoint)
    console.log("Waiting for database sync...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 3: Check if the user is in the database
    const userInDb = await db.execute(sql`SELECT * FROM users WHERE email = ${testEmail}`);
    
    if (userInDb.rows.length === 0) {
      console.error("⛔️ Test FAILED: User was not found in the database");
    } else {
      console.log("✅ Test PASSED: User was found in the database");
      console.log("User data:", userInDb.rows[0]);
      
      // Check if uid matches
      if (userInDb.rows[0].uid === user.uid) {
        console.log("✅ Test PASSED: User UID matches between Firebase and database");
      } else {
        console.error(`⛔️ Test FAILED: User UID mismatch. Firebase: ${user.uid}, Database: ${userInDb.rows[0].uid}`);
      }
    }
    
    // Clean up - Delete test user from Firebase
    console.log("Cleaning up test data...");
    
    try {
      // Need to refresh the token to perform delete
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
        console.log("Firebase user deleted");
      }
      
      // Delete from our database
      await db.execute(sql`DELETE FROM users WHERE email = ${testEmail}`);
      console.log("Database user record deleted");
      
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

testFirebaseDbSync().then(() => {
  console.log("Test completed!");
  process.exit(0);
});