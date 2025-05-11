// Script to sync data from PostgreSQL to Firebase Firestore
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs,
  getDoc,
  setDoc, 
  Timestamp,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db as pgDb } from "../server/db";
import { users, subscriptions, rewards, draws, claims } from "../shared/schema";
import { eq } from "drizzle-orm";

// Firebase configuration - same as in your app
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

async function syncUsersToFirebase() {
  console.log("Starting sync from PostgreSQL to Firebase Firestore...");

  try {
    // Get all users from PostgreSQL
    const allUsers = await pgDb.select().from(users);
    console.log(`Found ${allUsers.length} users in PostgreSQL database`);

    // Create a batch to perform batch operations
    const batch = writeBatch(firestore);
    let batchCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit is 500 operations

    // Sync each user to Firebase
    for (const user of allUsers) {
      if (!user.uid) {
        console.log(`Skipping user ${user.id} - No Firebase UID`);
        continue;
      }
      
      try {
        // Check if user data already exists in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        // Prepare user data for Firestore
        const userData = {
          email: user.email,
          uid: user.uid,
          isAdmin: user.isAdmin || false,
          referralCode: user.referralCode || generateReferralCode(),
          referredBy: user.referredBy || null,
          createdAt: userDoc.exists() ? userDoc.data().createdAt : Timestamp.fromDate(user.createdAt || new Date()),
          updatedAt: serverTimestamp(),
          isSubscribed: user.isSubscribed || false,
          displayName: user.name || null,
          profileCompleted: user.profileCompleted || false,
          uniqueId: user.uniqueId || null,
          phone: user.phone || null,
          location: user.location || null,
          birthday: user.birthday ? Timestamp.fromDate(new Date(user.birthday)) : null,
        };

        // Add to batch
        batch.set(userRef, userData, { merge: true });
        batchCount++;
        
        // If batch limit reached, commit and create a new batch
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
        
        console.log(`Added user ${user.id} (${user.email}) to sync batch`);
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    // Commit any remaining operations in the batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }

    console.log("User sync completed!");
  } catch (error) {
    console.error("Error syncing users:", error);
  }
}

async function syncUserSubscriptionsToFirebase() {
  console.log("Starting subscription sync...");
  
  try {
    // Get all subscriptions from PostgreSQL
    const allSubscriptions = await pgDb.select().from(subscriptions);
    console.log(`Found ${allSubscriptions.length} subscriptions in PostgreSQL database`);
    
    // Group subscriptions by user ID
    const subscriptionsByUser = new Map();
    
    for (const subscription of allSubscriptions) {
      if (!subscription.userId) continue;
      
      const user = await pgDb.select().from(users).where(eq(users.id, subscription.userId)).limit(1);
      if (!user || !user[0] || !user[0].uid) {
        console.log(`Skipping subscription ${subscription.id} - No associated Firebase UID`);
        continue;
      }
      
      const userData = user[0];
      
      // Create subscription data
      const subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate ? Timestamp.fromDate(subscription.startDate) : null,
        endDate: subscription.endDate ? Timestamp.fromDate(subscription.endDate) : null,
        plan: subscription.plan || "monthly",
        price: subscription.price || 0,
        paymentId: subscription.paymentId || null,
        razorpaySubscriptionId: subscription.razorpaySubscriptionId || null,
        updatedAt: serverTimestamp(),
      };
      
      // Update user document with subscription data
      const userRef = doc(firestore, 'users', userData.uid);
      await setDoc(userRef, {
        isSubscribed: subscription.status === "active",
        subscription: subscriptionData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log(`Synced subscription ${subscription.id} for user ${userData.email}`);
    }
    
    console.log("Subscription sync completed!");
  } catch (error) {
    console.error("Error syncing subscriptions:", error);
  }
}

// Function to sync rewards to Firestore
async function syncRewardsToFirebase() {
  console.log("Starting rewards sync...");
  
  try {
    // Get all rewards from PostgreSQL
    const allRewards = await pgDb.select().from(rewards);
    console.log(`Found ${allRewards.length} rewards in PostgreSQL database`);
    
    const batch = writeBatch(firestore);
    let batchCount = 0;
    
    for (const reward of allRewards) {
      // Create reward data for Firestore
      const rewardData = {
        id: reward.id,
        week: reward.week,
        prizeName: reward.prizeName,
        prizeValue: reward.prizeValue || 0,
        description: reward.description || null,
        imageUrl: reward.imageUrl || null,
        drawDate: reward.drawDate ? Timestamp.fromDate(reward.drawDate) : null,
        createdAt: reward.createdAt ? Timestamp.fromDate(reward.createdAt) : Timestamp.fromDate(new Date()),
        updatedAt: serverTimestamp(),
      };
      
      // Add to Firestore rewards collection
      const rewardRef = doc(firestore, 'rewards', reward.id.toString());
      batch.set(rewardRef, rewardData, { merge: true });
      batchCount++;
      
      if (batchCount >= 500) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} rewards`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} rewards`);
    }
    
    console.log("Rewards sync completed!");
  } catch (error) {
    console.error("Error syncing rewards:", error);
  }
}

// Function to sync draws (winners) to Firestore
async function syncDrawsToFirebase() {
  console.log("Starting draws sync...");
  
  try {
    // Get all draws from PostgreSQL
    const allDraws = await pgDb.select().from(draws);
    console.log(`Found ${allDraws.length} draws in PostgreSQL database`);
    
    for (const draw of allDraws) {
      // Skip if no winner
      if (!draw.winnerId) {
        console.log(`Skipping draw ${draw.id} - No winner assigned`);
        continue;
      }
      
      // Get winner details
      const winnerList = await pgDb.select().from(users).where(eq(users.id, draw.winnerId)).limit(1);
      if (!winnerList.length || !winnerList[0].uid) {
        console.log(`Skipping draw ${draw.id} - Winner has no Firebase UID`);
        continue;
      }
      
      const winner = winnerList[0];
      
      // Get reward details
      let rewardData = null;
      if (draw.rewardId) {
        const rewardList = await pgDb.select().from(rewards).where(eq(rewards.id, draw.rewardId)).limit(1);
        if (rewardList.length) {
          rewardData = rewardList[0];
        }
      }
      
      // Create draw data for Firestore
      const drawData = {
        id: draw.id,
        week: draw.week,
        timestamp: draw.timestamp ? Timestamp.fromDate(draw.timestamp) : Timestamp.fromDate(new Date()),
        winnerId: draw.winnerId,
        winnerUid: winner.uid,
        winnerEmail: winner.email,
        winnerName: winner.name || winner.email,
        rewardId: draw.rewardId,
        rewardName: rewardData ? rewardData.prizeName : null,
        updatedAt: serverTimestamp(),
      };
      
      // Add to Firestore
      const drawRef = doc(firestore, 'draws', draw.id.toString());
      await setDoc(drawRef, drawData, { merge: true });
      
      console.log(`Synced draw ${draw.id} with winner ${winner.email}`);
    }
    
    console.log("Draws sync completed!");
  } catch (error) {
    console.error("Error syncing draws:", error);
  }
}

// Helper function to generate random referral code if needed
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Run all sync functions
async function syncAll() {
  try {
    await syncUsersToFirebase();
    await syncUserSubscriptionsToFirebase();
    await syncRewardsToFirebase();
    await syncDrawsToFirebase();
    console.log("All Firebase syncs completed successfully!");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// Run the sync
const syncType = process.argv[2] || 'all';

switch (syncType) {
  case 'users':
    syncUsersToFirebase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Sync failed:", error);
        process.exit(1);
      });
    break;
  case 'subscriptions':
    syncUserSubscriptionsToFirebase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Sync failed:", error);
        process.exit(1);
      });
    break;
  case 'rewards':
    syncRewardsToFirebase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Sync failed:", error);
        process.exit(1);
      });
    break;
  case 'draws':
    syncDrawsToFirebase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Sync failed:", error);
        process.exit(1);
      });
    break;
  case 'all':
  default:
    syncAll()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Sync failed:", error);
        process.exit(1);
      });
    break;
}