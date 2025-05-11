import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { CONFIG } from "@/config";

// Firebase configuration using the centralized config system
const firebaseConfig = {
  apiKey: CONFIG.FIREBASE_API_KEY,
  authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: CONFIG.FIREBASE_APP_ID,
};

// Log the config for debugging (with values masked)
console.log("Firebase config:", {
  apiKey: firebaseConfig.apiKey ? "SET" : "NOT SET",
  projectId: firebaseConfig.projectId ? "SET" : "NOT SET",
  appId: firebaseConfig.appId ? "SET" : "NOT SET",
});

// More useful debug information
console.log("Firebase domain configuration:", {
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
});

// For more verbose debugging
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "FIREBASE_API_KEY_PLACEHOLDER") {
  console.error("Firebase API Key is missing or invalid! Please set VITE_FIREBASE_API_KEY environment variable.");
}
if (!firebaseConfig.projectId || firebaseConfig.projectId === "FIREBASE_PROJECT_ID_PLACEHOLDER") {
  console.error("Firebase Project ID is missing or invalid! Please set VITE_FIREBASE_PROJECT_ID environment variable.");
}
if (!firebaseConfig.appId || firebaseConfig.appId === "FIREBASE_APP_ID_PLACEHOLDER") {
  console.error("Firebase App ID is missing or invalid! Please set VITE_FIREBASE_APP_ID environment variable.");
}

// Move imports to top of file
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

// Initialize Firebase - only initialize once
let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

try {
  // Check if we have an API key and Project ID before initializing
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    console.error("Firebase configuration is incomplete. Missing required fields:", {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
      hasAppId: !!firebaseConfig.appId
    });
    throw new Error("Firebase configuration is incomplete. Missing required fields.");
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase app");
  }
  
  // Initialize Firebase Auth and Firestore
  auth = getAuth(app);
  
  try {
    db = getFirestore(app);
    console.log("Firestore initialized successfully");
  } catch (firestoreError) {
    console.error("Error initializing Firestore (continuing without it):", firestoreError);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  
  // Provide fallbacks in case of initialization error
  if (!app && getApps().length > 0) {
    app = getApps()[0];
    console.log("Using fallback Firebase app");
  }
  
  if (app) {
    if (!auth) {
      try {
        auth = getAuth(app);
        console.log("Using fallback Firebase auth");
      } catch (authError) {
        console.error("Failed to initialize fallback auth:", authError);
      }
    }
    
    if (!db) {
      try {
        db = getFirestore(app);
        console.log("Using fallback Firebase firestore");
      } catch (dbError) {
        console.error("Failed to initialize fallback firestore:", dbError);
      }
    }
  }
}

// Auth functions
export const register = async (email: string, password: string, referralCode?: string) => {
  try {
    if (!auth) {
      console.error("Firebase auth is not initialized, likely due to missing or invalid Firebase configuration");
      throw new Error("Firebase auth is not initialized. Please check Firebase configuration.");
    }
    
    console.log("Attempting to register with email:", email);
    
    // Create the user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Firebase authentication created user with UID:", user.uid);
    
    // Generate a unique referral code for the new user
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store additional user data in Firestore (if available)
    if (db) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
          isAdmin: CONFIG.ADMIN_EMAILS.includes(user.email || ""),
          referralCode: newReferralCode,
          referredBy: referralCode || null,
          createdAt: new Date(),
          isSubscribed: false,
        });
        console.log("User data saved to Firestore");
      } catch (firestoreError) {
        console.error("Error saving to Firestore (continuing):", firestoreError);
      }
    } else {
      console.warn("Firestore not initialized, skipping Firestore data storage");
    }
    
    // Save user to Firestore first (primary database now)
    // And as a backup/sync, also save to our PostgreSQL database via API
    try {
      console.log("Syncing user to PostgreSQL database (secondary) via API...");
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          referralCode: newReferralCode,
          referredBy: referralCode || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error syncing user to PostgreSQL database:', errorData);
        // Continue even if database sync fails, we'll still have Firebase/Firestore
      } else {
        console.log('User successfully synced to PostgreSQL database');
      }
    } catch (dbError) {
      console.error('Error connecting to database API for sync:', dbError);
      // Continue even if database sync fails - Firestore is primary
    }
    
    console.log("User registered successfully:", user.uid);
    return user;
  } catch (error: any) {
    // More detailed error handling
    if (error.code === 'auth/configuration-not-found') {
      console.error("Firebase configuration error: The Firebase project may not be properly set up or the domain may not be authorized.");
    } else if (error.code === 'auth/email-already-in-use') {
      console.error("Registration error: Email already in use");
    } else {
      console.error("Error registering user:", error);
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    if (!auth) {
      console.error("Firebase auth is not initialized, likely due to missing or invalid Firebase configuration");
      throw new Error("Firebase auth is not initialized. Please check Firebase configuration.");
    }
    
    // Add console logging to help debug
    console.log("Attempting to login with:", { email });
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful for:", userCredential.user.email);
    
    // Get the user data from Firestore
    let userData = null;
    if (db) {
      try {
        userData = await getUserData(userCredential.user.uid);
        console.log("Retrieved Firestore user data:", userData);
      } catch (err) {
        console.warn("Could not fetch Firestore user data after login:", err);
      }
    }
    
    // Check if user exists in our database and create if not
    try {
      const response = await fetch(`/api/user/profile/${userCredential.user.uid}`);
      
      if (response.status === 404) {
        console.log("User not found in database, creating record...");
        
        // Generate referral code if not available from Firestore
        const referralCode = userData?.referralCode || 
          Math.random().toString(36).substring(2, 8).toUpperCase();
          
        // Create user in database
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            referralCode,
            referredBy: userData?.referredBy || null,
          }),
        });
        
        console.log("User created in database after login");
      } else if (response.ok) {
        console.log("User found in database");
      }
    } catch (dbError) {
      console.warn("Error checking/creating user in database:", dbError);
      // Continue even if database operations fail
    }
    
    return userCredential.user;
  } catch (error: any) {
    // More detailed error handling
    if (error.code === 'auth/configuration-not-found') {
      console.error("Firebase configuration error: The Firebase project may not be properly set up or the domain may not be authorized.");
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.error("Login error: Invalid credentials");
    } else {
      console.error("Error logging in:", error);
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }
    
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }
    
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Firestore functions
export const getUserData = async (uid: string) => {
  try {
    if (!db) {
      throw new Error("Firebase Firestore is not initialized");
    }
    
    // First, try to get user data from Firestore (primary source)
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log("Fetched user data:", userDoc.data());
      return userDoc.data();
    }
    
    // If not in Firestore, try to fetch from the PostgreSQL database through API
    try {
      console.log("User not found in Firestore, trying PostgreSQL database...");
      const response = await fetch(`/api/user/${uid}`);
      
      if (response.ok) {
        const userData = await response.json();
        
        // Store this data in Firestore for future use
        if (userData) {
          await setDoc(userDocRef, {
            ...userData,
            uid: uid,
            updatedAt: new Date()
          });
          console.log("Retrieved user from PostgreSQL and synced to Firestore");
          return userData;
        }
      }
    } catch (dbError) {
      console.error("Error fetching from PostgreSQL database:", dbError);
    }
    
    console.error("No user data found in either database!");
    return null;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Error fetching user data from Firestore:", error);
      console.warn(`
        Firebase Firestore permission denied. Please make sure:
        1. Your Firestore database exists
        2. Your security rules allow reading user data
        3. Your app domain (${window.location.hostname}) is authorized in Firebase console
      `);
      
      // Try to fall back to the PostgreSQL database
      try {
        const response = await fetch(`/api/user/${uid}`);
        if (response.ok) {
          const userData = await response.json();
          console.log("Retrieved user from PostgreSQL (Firestore permission denied)");
          return userData;
        }
      } catch (dbError) {
        console.error("Error fetching from PostgreSQL database:", dbError);
      }
      
      return null;
    } else {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }
};

export const updateUserData = async (uid: string, data: any) => {
  try {
    if (!db) {
      throw new Error("Firebase Firestore is not initialized");
    }

    // Process profile data if present
    let processedData = { ...data };
    
    // Ensure birthday is properly formatted for Firestore
    if (data.profile && data.profile.birthday) {
      // Convert Date object to Firebase timestamp if needed
      if (data.profile.birthday instanceof Date) {
        processedData = {
          ...data,
          profile: {
            ...data.profile,
            // Keep as Date object - Firestore will handle conversion to timestamp
          }
        };
      }
    }
    
    // First, update in Firestore (primary)
    const userDocRef = doc(db, "users", uid);
    
    // Add timestamp
    const dataWithTimestamp = {
      ...processedData,
      updatedAt: new Date()
    };
    
    await updateDoc(userDocRef, dataWithTimestamp);
    console.log("User data updated successfully in Firestore:", data);
    
    // Then, try to sync to PostgreSQL database
    try {
      // Get current user data to find SQL DB ID
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // If we have a PostgreSQL ID, we can update
        if (userData.id) {
          const response = await fetch(`/api/users/${userData.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Uid': uid // For authorization
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            console.log("User data synced to PostgreSQL database");
          } else {
            console.warn("Failed to sync user data to PostgreSQL database");
          }
        } else {
          console.warn("User doesn't have a PostgreSQL ID, skipping sync");
        }
      }
    } catch (dbError) {
      console.warn("Error syncing user data to PostgreSQL database:", dbError);
      // Continue even if database sync fails - Firestore is primary
    }
    
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Error updating user data in Firestore:", error);
      console.warn(`
        Firebase Firestore permission denied when updating data. Please make sure:
        1. Your Firestore database exists
        2. Your security rules allow writing user data
        3. Your app domain (${window.location.hostname}) is authorized in Firebase console
      `);
      
      // Try to update PostgreSQL directly instead
      try {
        const response = await fetch(`/api/user/${uid}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Uid': uid
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          console.log("User data updated in PostgreSQL database (Firestore permission denied)");
          return true;
        }
      } catch (dbError) {
        console.error("Error updating PostgreSQL database:", dbError);
      }
      
      // Return true to indicate we should continue with the flow
      return true;
    } else {
      console.error("Error updating user data:", error);
      throw error;
    }
  }
};

export const updateUserEmail = async (newEmail: string, password: string) => {
  try {
    if (!auth) {
      throw new Error("Firebase auth is not initialized");
    }
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    if (!db) {
      throw new Error("Firebase Firestore is not initialized");
    }
    
    console.log("Attempting to update email to:", newEmail);
    
    // Re-authenticate the user first
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email!, // Current email
      password
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    console.log("User re-authenticated successfully");
    
    // 1. Update email in Firebase Authentication (must be done first as it's the main identity source)
    await updateEmail(auth.currentUser, newEmail);
    console.log("Email updated in Firebase Auth");
    
    // 2. Update email in Firestore (primary data store)
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { 
      email: newEmail,
      updatedAt: new Date()
    });
    console.log("Email updated in primary Firestore database");
    
    // 3. Then sync to PostgreSQL database (secondary data store)
    try {
      // Get the user data to find the PostgreSQL ID
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.id) {
          // Use the PostgreSQL ID if available
          const response = await fetch(`/api/users/${userData.id}/email`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Uid': auth.currentUser.uid, // For authorization
            },
            body: JSON.stringify({ email: newEmail }),
          });
          
          if (response.ok) {
            console.log('Email synced to PostgreSQL database');
          } else {
            console.warn('Failed to sync email to PostgreSQL database');
          }
        } else {
          // Fallback to updating by UID
          const response = await fetch(`/api/user/email/update/${auth.currentUser.uid}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Uid': auth.currentUser.uid, // For authorization
            },
            body: JSON.stringify({ email: newEmail }),
          });
          
          if (response.ok) {
            console.log('Email synced to PostgreSQL database using UID');
          } else {
            console.warn('Failed to sync email to PostgreSQL database using UID');
          }
        }
      }
    } catch (dbError) {
      console.warn('Error syncing email to PostgreSQL database:', dbError);
      // Continue even if database sync fails - Firebase/Firestore are primary
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user email:", error);
    throw error;
  }
};

export const updateUserProfile = async (name: string) => {
  try {
    if (!auth) {
      console.error("Firebase auth is not initialized, likely due to missing or invalid Firebase configuration");
      throw new Error("Firebase auth is not initialized. Please check Firebase configuration.");
    }
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }
    if (!db) {
      throw new Error("Firebase Firestore is not initialized");
    }
    
    console.log("Updating user display name to:", name);
    
    // 1. Update profile in Firebase Authentication
    await updateProfile(auth.currentUser, {
      displayName: name
    });
    console.log("Updated display name in Firebase Auth");
    
    // 2. Update in Firestore (primary data store)
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { 
      displayName: name,
      updatedAt: new Date(),
      profileCompleted: true
    });
    console.log("Updated display name in primary Firestore database");
    
    // 3. Then sync to PostgreSQL database (secondary data store)
    try {
      // Get user data to find the PostgreSQL ID
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.id) {
          // Use the PostgreSQL ID directly if available
          const response = await fetch(`/api/users/${userData.id}/profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Uid': auth.currentUser.uid // For authorization
            },
            body: JSON.stringify({ 
              displayName: name,
              profileCompleted: true
            })
          });
          
          if (response.ok) {
            console.log("Profile synced to PostgreSQL database");
          } else {
            console.warn("Failed to sync profile to PostgreSQL database");
          }
        } else {
          // Fallback to updating by UID 
          // Fetch current profile first through API
          const profileResponse = await fetch(`/api/user/profile/${auth.currentUser.uid}`);
          let profileData = {};
          
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
          }
          
          // Update with new name
          profileData = {
            ...profileData,
            name,
            profileCompleted: true
          };
          
          // Send update to database
          const updateResponse = await fetch(`/api/user/profile/${auth.currentUser.uid}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Uid': auth.currentUser.uid // For authorization
            },
            body: JSON.stringify(profileData),
          });
          
          if (updateResponse.ok) {
            console.log("Profile synced to PostgreSQL database using UID");
          } else {
            console.warn("Failed to sync profile to PostgreSQL database using UID");
          }
        }
      }
    } catch (dbError) {
      console.warn("Error syncing profile to PostgreSQL database:", dbError);
      // Continue even if database sync fails - Firebase/Firestore are primary
    }
    
    console.log("User profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserByReferralCode = async (referralCode: string) => {
  try {
    if (!db) {
      throw new Error("Firebase Firestore is not initialized");
    }
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("referralCode", "==", referralCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    } else {
      return null;
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Error fetching user by referral code from Firestore:", error);
      console.warn(`
        Firebase Firestore permission denied when querying by referral code. Please make sure:
        1. Your Firestore database exists
        2. Your security rules allow querying documents
        3. Your app domain (${window.location.hostname}) is authorized in Firebase console
      `);
      return null;
    } else {
      console.error("Error fetching user by referral code:", error);
      throw error;
    }
  }
};

export { app, auth, db };
