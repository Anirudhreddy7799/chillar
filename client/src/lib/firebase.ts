import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Firestore,
} from "firebase/firestore";
import { CONFIG } from "@/config";

// Firebase configuration
const firebaseConfig = CONFIG.FIREBASE;

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Check if we have required config
  if (!CONFIG.hasFirebaseConfig()) {
    throw new Error(
      "Firebase configuration is incomplete. Please check your environment variables."
    );
  }

  // Initialize or get existing app
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase app");
  }

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase services initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw new Error(
    "Failed to initialize Firebase: " +
      (error instanceof Error ? error.message : String(error))
  );
}

// Auth functions
export const register = async (
  email: string,
  password: string,
  referralCode?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  try {
    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      uid: user.uid,
      referralCode: newReferralCode,
      referredBy: referralCode || null,
      createdAt: new Date(),
      isSubscribed: false,
    });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
  }

  return user;
};

export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};

export const getUserData = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }

  return null;
};

export { auth, db };
export type { Auth, Firestore };
export default auth;
