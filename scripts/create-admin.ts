import { auth, db } from "../server/firebase-admin";

async function createAdminUser() {
  const email = "anirudh.kalvala@gmail.com";
  const password = "Anirudh@@98765";

  try {
    // Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });

    console.log("Created user in Firebase Auth:", userRecord.uid);

    // Create the user document in Firestore
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email,
        uid: userRecord.uid,
        isAdmin: true,
        isSubscribed: true,
        referralCode: "ADMIN",
        createdAt: new Date(),
        profileCompleted: true,
        profile: {
          name: "Anirudh Kalvala",
          phone: "",
          location: "",
          birthday: null,
        },
      });

    console.log("Created admin user document in Firestore");
    console.log("Admin user creation successful!");
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser().then(() => process.exit(0));
