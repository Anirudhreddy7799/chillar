// Script to sync a specific Firebase user to Firestore
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  Timestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "000000000000", // Firebase requires this field even if empty
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Your specific user data from Firebase Authentication
const USER_UID = 'gGXOLYPHluWfJlSlQfFQYjO2mJF2'; // Your UID
const USER_EMAIL = 'anirudh.kalvala03@gmail.com'; // Your email

async function createUserInFirestore() {
  try {
    // User data to add to Firestore
    const userData = {
      email: USER_EMAIL,
      uid: USER_UID,
      isAdmin: false,
      referralCode: generateReferralCode(),
      referredBy: null,
      createdAt: Timestamp.fromDate(new Date()),
      isSubscribed: false,
      displayName: null,
    };

    // Create a document in the users collection with UID as document ID
    const userRef = doc(firestore, 'users', USER_UID);
    await setDoc(userRef, userData);
    console.log(`Successfully created user document for ${USER_EMAIL} in Firestore!`);
    
  } catch (error) {
    console.error("Error creating user in Firestore:", error);
  }
}

// Helper function to generate random referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Run the function
createUserInFirestore()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Failed:", error);
    process.exit(1);
  });