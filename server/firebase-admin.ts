import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getAuth, type Auth } from "firebase-admin/auth";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { FIREBASE_CONFIG } from "../shared/firebase-config";

// Get current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, "firebase-service-account.json");

// Read and parse service account file
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

// Initialize Firebase Admin
let app: App;
let firestoreDb: Firestore;
let firestoreAuth: Auth;
let firestoreStorage: Storage;

try {
  // Initialize or get existing app
  if (getApps().length === 0) {
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: FIREBASE_CONFIG.projectId,
      storageBucket: FIREBASE_CONFIG.storageBucket,
      databaseURL: `https://${FIREBASE_CONFIG.projectId}.firebaseio.com`,
    });
    console.log("✅ Firebase Admin initialized successfully");
  } else {
    app = getApps()[0];
    console.log("✅ Using existing Firebase Admin app");
  }

  // Initialize services
  firestoreDb = getFirestore(app);
  firestoreDb.settings({ ignoreUndefinedProperties: true }); // Add this line to ignore undefined
  firestoreAuth = getAuth(app);
  firestoreStorage = getStorage(app);

  console.log("✅ Firebase Admin services initialized successfully");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error);
  throw error;
}

// Export initialized services
export const db = firestoreDb;
export const auth = firestoreAuth;
export const storage = firestoreStorage;
