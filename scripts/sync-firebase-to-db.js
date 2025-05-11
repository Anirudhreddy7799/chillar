/**
 * Script to sync data from Firebase Firestore to PostgreSQL database
 * Usage: node sync-firebase-to-db.js [collection]
 * where collection is one of: users, subscriptions, rewards, draws, claims, all (default: all)
 */

const admin = require('firebase-admin');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

// Check if Firebase service account credentials exist
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Firebase service account credentials not found at:', serviceAccountPath);
  console.error('Please create a firebase-service-account.json file in the project root.');
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}

// Initialize Firestore
const firestore = admin.firestore();

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Get a collection of documents from Firestore
 */
async function getFirestoreCollection(collectionName) {
  try {
    const snapshot = await firestore.collection(collectionName).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName} from Firestore:`, error);
    return [];
  }
}

/**
 * Parse Firebase timestamp to JavaScript Date
 */
function parseFirebaseTimestamp(timestamp) {
  if (!timestamp) return null;
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return timestamp;
}

/**
 * Sync users from Firestore to PostgreSQL
 */
async function syncUsersToPostgres() {
  console.log('Syncing users from Firestore to PostgreSQL...');
  
  try {
    const firestoreUsers = await getFirestoreCollection('users');
    
    if (firestoreUsers.length === 0) {
      console.log('No users found in Firestore.');
      return;
    }
    
    console.log(`Found ${firestoreUsers.length} users in Firestore.`);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const fsUser of firestoreUsers) {
        // Check if user already exists in database by uid
        const { rows } = await client.query(
          'SELECT id FROM users WHERE uid = $1',
          [fsUser.uid]
        );
        
        // Parse profile data if it exists
        let profileData = null;
        if (fsUser.profile) {
          try {
            profileData = typeof fsUser.profile === 'string' 
              ? fsUser.profile
              : JSON.stringify(fsUser.profile);
          } catch (error) {
            console.error('Error parsing profile data:', error);
          }
        }

        // Convert Firebase timestamps to dates
        const createdAt = parseFirebaseTimestamp(fsUser.createdAt);
        
        if (rows.length > 0) {
          // Update existing user
          await client.query(
            `UPDATE users SET 
              email = $1,
              uid = $2,
              profileCompleted = $3,
              isAdmin = $4,
              isSubscribed = $5,
              referralCode = $6,
              referredBy = $7,
              uniqueId = $8,
              profile = $9,
              createdAt = $10
            WHERE id = $11`,
            [
              fsUser.email,
              fsUser.uid,
              fsUser.profileCompleted || false,
              fsUser.isAdmin || false,
              fsUser.isSubscribed || false,
              fsUser.referralCode || null,
              fsUser.referredBy || null,
              fsUser.uniqueId || null,
              profileData,
              createdAt,
              rows[0].id
            ]
          );
          console.log(`Updated user ${fsUser.email} (ID: ${rows[0].id})`);
        } else {
          // Generate a temporary password (user authenticates via Firebase)
          const tempPassword = Math.random().toString(36).substring(2, 15);
          
          // Insert new user
          const res = await client.query(
            `INSERT INTO users 
              (email, password, uid, profileCompleted, isAdmin, isSubscribed, 
               referralCode, referredBy, uniqueId, profile, createdAt) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING id`,
            [
              fsUser.email,
              tempPassword,
              fsUser.uid,
              fsUser.profileCompleted || false,
              fsUser.isAdmin || false,
              fsUser.isSubscribed || false,
              fsUser.referralCode || null,
              fsUser.referredBy || null,
              fsUser.uniqueId || null,
              profileData,
              createdAt
            ]
          );
          console.log(`Inserted user ${fsUser.email} (ID: ${res.rows[0].id})`);
        }
      }
      
      await client.query('COMMIT');
      console.log('Users sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing users from Firestore to PostgreSQL:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in syncUsersToPostgres:', error);
  }
}

/**
 * Sync subscriptions from Firestore to PostgreSQL
 */
async function syncSubscriptionsToPostgres() {
  console.log('Syncing subscriptions from Firestore to PostgreSQL...');
  
  try {
    const firestoreSubs = await getFirestoreCollection('subscriptions');
    
    if (firestoreSubs.length === 0) {
      console.log('No subscriptions found in Firestore.');
      return;
    }
    
    console.log(`Found ${firestoreSubs.length} subscriptions in Firestore.`);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const fsSub of firestoreSubs) {
        // Get user ID by uid
        const { rows: userRows } = await client.query(
          'SELECT id FROM users WHERE uid = $1',
          [fsSub.uid]
        );
        
        if (userRows.length === 0) {
          console.log(`User with UID ${fsSub.uid} not found, skipping subscription.`);
          continue;
        }
        
        const userId = userRows[0].id;
        
        // Parse dates
        const startDate = parseFirebaseTimestamp(fsSub.startDate);
        const endDate = parseFirebaseTimestamp(fsSub.endDate);
        
        // Check if subscription exists
        const { rows } = await client.query(
          'SELECT id FROM subscriptions WHERE razorpaySubId = $1',
          [fsSub.razorpaySubId]
        );
        
        if (rows.length > 0) {
          // Update existing subscription
          await client.query(
            `UPDATE subscriptions SET 
              userId = $1,
              razorpayCustomerId = $2,
              razorpaySubId = $3,
              startDate = $4,
              endDate = $5,
              status = $6
            WHERE id = $7`,
            [
              userId,
              fsSub.razorpayCustomerId || null,
              fsSub.razorpaySubId || null,
              startDate,
              endDate,
              fsSub.status,
              rows[0].id
            ]
          );
          console.log(`Updated subscription for user ID ${userId} (ID: ${rows[0].id})`);
        } else {
          // Insert new subscription
          const res = await client.query(
            `INSERT INTO subscriptions 
              (userId, razorpayCustomerId, razorpaySubId, startDate, endDate, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id`,
            [
              userId,
              fsSub.razorpayCustomerId || null,
              fsSub.razorpaySubId || null,
              startDate,
              endDate,
              fsSub.status
            ]
          );
          console.log(`Inserted subscription for user ID ${userId} (ID: ${res.rows[0].id})`);
        }
      }
      
      await client.query('COMMIT');
      console.log('Subscriptions sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing subscriptions from Firestore to PostgreSQL:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in syncSubscriptionsToPostgres:', error);
  }
}

/**
 * Sync rewards from Firestore to PostgreSQL
 */
async function syncRewardsToPostgres() {
  console.log('Syncing rewards from Firestore to PostgreSQL...');
  
  try {
    const firestoreRewards = await getFirestoreCollection('rewards');
    
    if (firestoreRewards.length === 0) {
      console.log('No rewards found in Firestore.');
      return;
    }
    
    console.log(`Found ${firestoreRewards.length} rewards in Firestore.`);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const fsReward of firestoreRewards) {
        // Parse date
        const createdAt = parseFirebaseTimestamp(fsReward.createdAt);
        
        // Check if reward exists
        const { rows } = await client.query(
          'SELECT id FROM rewards WHERE week = $1',
          [fsReward.week]
        );
        
        if (rows.length > 0) {
          // Update existing reward
          await client.query(
            `UPDATE rewards SET 
              prizeName = $1,
              prizeValue = $2,
              prizeType = $3,
              sponsor = $4,
              imageUrl = $5,
              createdAt = $6
            WHERE id = $7`,
            [
              fsReward.prizeName,
              fsReward.prizeValue,
              fsReward.prizeType,
              fsReward.sponsor || null,
              fsReward.imageUrl || null,
              createdAt,
              rows[0].id
            ]
          );
          console.log(`Updated reward for week ${fsReward.week} (ID: ${rows[0].id})`);
        } else {
          // Insert new reward
          const res = await client.query(
            `INSERT INTO rewards 
              (week, prizeName, prizeValue, prizeType, sponsor, imageUrl, createdAt) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id`,
            [
              fsReward.week,
              fsReward.prizeName,
              fsReward.prizeValue,
              fsReward.prizeType,
              fsReward.sponsor || null,
              fsReward.imageUrl || null,
              createdAt
            ]
          );
          console.log(`Inserted reward for week ${fsReward.week} (ID: ${res.rows[0].id})`);
        }
      }
      
      await client.query('COMMIT');
      console.log('Rewards sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing rewards from Firestore to PostgreSQL:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in syncRewardsToPostgres:', error);
  }
}

/**
 * Sync draws from Firestore to PostgreSQL
 */
async function syncDrawsToPostgres() {
  console.log('Syncing draws from Firestore to PostgreSQL...');
  
  try {
    const firestoreDraws = await getFirestoreCollection('draws');
    
    if (firestoreDraws.length === 0) {
      console.log('No draws found in Firestore.');
      return;
    }
    
    console.log(`Found ${firestoreDraws.length} draws in Firestore.`);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const fsDraw of firestoreDraws) {
        // Parse date
        const timestamp = parseFirebaseTimestamp(fsDraw.timestamp);
        
        let winnerId = null;
        if (fsDraw.winnerUid) {
          // Get winner ID from uid
          const { rows: winnerRows } = await client.query(
            'SELECT id FROM users WHERE uid = $1',
            [fsDraw.winnerUid]
          );
          
          if (winnerRows.length > 0) {
            winnerId = winnerRows[0].id;
          }
        }
        
        let rewardId = null;
        if (fsDraw.week) {
          // Get reward ID from week
          const { rows: rewardRows } = await client.query(
            'SELECT id FROM rewards WHERE week = $1',
            [fsDraw.week]
          );
          
          if (rewardRows.length > 0) {
            rewardId = rewardRows[0].id;
          }
        }
        
        // Check if draw exists
        const { rows } = await client.query(
          'SELECT id FROM draws WHERE week = $1',
          [fsDraw.week]
        );
        
        if (rows.length > 0) {
          // Update existing draw
          await client.query(
            `UPDATE draws SET 
              winnerId = $1,
              rewardId = $2,
              claimed = $3,
              timestamp = $4
            WHERE id = $5`,
            [
              winnerId,
              rewardId,
              fsDraw.claimed || false,
              timestamp,
              rows[0].id
            ]
          );
          console.log(`Updated draw for week ${fsDraw.week} (ID: ${rows[0].id})`);
        } else {
          // Insert new draw
          const res = await client.query(
            `INSERT INTO draws 
              (week, winnerId, rewardId, claimed, timestamp) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id`,
            [
              fsDraw.week,
              winnerId,
              rewardId,
              fsDraw.claimed || false,
              timestamp
            ]
          );
          console.log(`Inserted draw for week ${fsDraw.week} (ID: ${res.rows[0].id})`);
        }
      }
      
      await client.query('COMMIT');
      console.log('Draws sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing draws from Firestore to PostgreSQL:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in syncDrawsToPostgres:', error);
  }
}

/**
 * Sync claims from Firestore to PostgreSQL
 */
async function syncClaimsToPostgres() {
  console.log('Syncing claims from Firestore to PostgreSQL...');
  
  try {
    const firestoreClaims = await getFirestoreCollection('claims');
    
    if (firestoreClaims.length === 0) {
      console.log('No claims found in Firestore.');
      return;
    }
    
    console.log(`Found ${firestoreClaims.length} claims in Firestore.`);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const fsClaim of firestoreClaims) {
        // Parse date
        const submittedAt = parseFirebaseTimestamp(fsClaim.submittedAt);
        
        let userId = null;
        if (fsClaim.uid) {
          // Get user ID from uid
          const { rows: userRows } = await client.query(
            'SELECT id FROM users WHERE uid = $1',
            [fsClaim.uid]
          );
          
          if (userRows.length > 0) {
            userId = userRows[0].id;
          } else {
            console.log(`User with UID ${fsClaim.uid} not found, skipping claim.`);
            continue;
          }
        }
        
        let rewardId = null;
        if (fsClaim.rewardWeek) {
          // Get reward ID from week
          const { rows: rewardRows } = await client.query(
            'SELECT id FROM rewards WHERE week = $1',
            [fsClaim.rewardWeek]
          );
          
          if (rewardRows.length > 0) {
            rewardId = rewardRows[0].id;
          } else {
            console.log(`Reward for week ${fsClaim.rewardWeek} not found, skipping claim.`);
            continue;
          }
        }
        
        // Check if claim exists (by user and reward)
        const { rows } = await client.query(
          'SELECT id FROM claims WHERE userId = $1 AND rewardId = $2',
          [userId, rewardId]
        );
        
        if (rows.length > 0) {
          // Update existing claim
          await client.query(
            `UPDATE claims SET 
              status = $1,
              notes = $2,
              submittedAt = $3
            WHERE id = $4`,
            [
              fsClaim.status,
              fsClaim.notes || null,
              submittedAt,
              rows[0].id
            ]
          );
          console.log(`Updated claim for user ID ${userId} and reward ID ${rewardId} (ID: ${rows[0].id})`);
        } else {
          // Insert new claim
          const res = await client.query(
            `INSERT INTO claims 
              (userId, rewardId, status, notes, submittedAt) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id`,
            [
              userId,
              rewardId,
              fsClaim.status,
              fsClaim.notes || null,
              submittedAt
            ]
          );
          console.log(`Inserted claim for user ID ${userId} and reward ID ${rewardId} (ID: ${res.rows[0].id})`);
        }
      }
      
      await client.query('COMMIT');
      console.log('Claims sync completed successfully.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing claims from Firestore to PostgreSQL:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in syncClaimsToPostgres:', error);
  }
}

/**
 * Main function to start sync process
 */
async function syncAll() {
  try {
    const collection = process.argv[2] || 'all';
    
    console.log(`Starting sync from Firestore to PostgreSQL for collection: ${collection}`);
    
    if (collection === 'users' || collection === 'all') {
      await syncUsersToPostgres();
    }
    
    if (collection === 'subscriptions' || collection === 'all') {
      await syncSubscriptionsToPostgres();
    }
    
    if (collection === 'rewards' || collection === 'all') {
      await syncRewardsToPostgres();
    }
    
    if (collection === 'draws' || collection === 'all') {
      await syncDrawsToPostgres();
    }
    
    if (collection === 'claims' || collection === 'all') {
      await syncClaimsToPostgres();
    }
    
    console.log('Sync from Firestore to PostgreSQL completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error in syncAll:', error);
    process.exit(1);
  }
}

// Run the sync
syncAll();