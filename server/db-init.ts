import { db } from "./firebase-admin";

export async function initializeDatabase() {
  try {
    console.log("Initializing Firestore...");

    // Verify Firestore connection
    await db.collection("_init").doc("test").set({
      initialized: true,
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
    });

    console.log("✅ Firestore initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing Firestore:", error);
    throw new Error(`Failed to initialize Firestore: ${error.message}`);
  }
}
