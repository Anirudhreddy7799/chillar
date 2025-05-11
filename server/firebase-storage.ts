import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import {
  User, InsertUser,
  Subscription, InsertSubscription,
  Reward, InsertReward,
  Draw, InsertDraw,
  Claim, InsertClaim
} from '@shared/schema';
import { IStorage } from './storage';
import { eq } from 'drizzle-orm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as fs from 'fs';

// Get the current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to service account file
const serviceAccountPath = join(__dirname, '../firebase-service-account.json');

// Initialize Firebase Admin SDK
let app;
let firestore;

try {
  // Check if the service account file exists
  if (fs.existsSync(serviceAccountPath)) {
    // Use service account file for authentication
    // Read and parse the service account file for ESM
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback to app config only (for local development)
    console.warn('Firebase service account not found, falling back to application default credentials');
    app = initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    });
  }
  
  // Initialize Firestore
  firestore = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // Create a more robust mock Firestore instance for fallback
  // This mock will fall back to the database implementation when needed
  const createMockQuerySnapshot = (data = []) => ({
    empty: data.length === 0,
    docs: data.map(item => ({
      id: String(item.id || '0'),
      data: () => item,
      ref: {
        get: async () => ({
          exists: true, 
          data: () => item
        }),
        update: async () => {},
        set: async () => {}
      }
    }))
  });

  // Import DB access for fallback
  import('./db').then(({ db }) => {
    console.log('Imported DB module for Firebase fallback');
  }).catch(err => {
    console.error('Failed to import DB module:', err);
  });

  // A more sophisticated mock that will try to use the database as fallback
  const createMockCollection = (name) => {
    return {
      doc: (id) => ({
        get: async () => {
          try {
            // Try to get data from the database
            const { db } = await import('./db');
            const tables = {
              'users': async () => {
                const [user] = await db.query.users.findMany({
                  where: (users, { eq }) => eq(users.id, Number(id))
                });
                return { exists: !!user, data: () => user || null };
              },
              'subscriptions': async () => {
                const [subscription] = await db.query.subscriptions.findMany({
                  where: (subscriptions, { eq }) => eq(subscriptions.id, Number(id))
                });
                return { exists: !!subscription, data: () => subscription || null };
              },
              'rewards': async () => {
                const [reward] = await db.query.rewards.findMany({
                  where: (rewards, { eq }) => eq(rewards.id, Number(id))
                });
                return { exists: !!reward, data: () => reward || null };
              },
              'draws': async () => {
                const [draw] = await db.query.draws.findMany({
                  where: (draws, { eq }) => eq(draws.id, Number(id))
                });
                return { exists: !!draw, data: () => draw || null };
              },
              'claims': async () => {
                const [claim] = await db.query.claims.findMany({
                  where: (claims, { eq }) => eq(claims.id, Number(id))
                });
                return { exists: !!claim, data: () => claim || null };
              },
              'counters': async () => {
                return { exists: false, data: () => ({ nextId: 1 }) };
              }
            };
            
            if (tables[name]) {
              return await tables[name]();
            }
            
            return { exists: false, data: () => null };
          } catch (error) {
            console.error(`Error in mock Firestore doc.get for ${name}/${id}:`, error);
            return { exists: false, data: () => null };
          }
        },
        set: async () => {},
        update: async () => {},
      }),
      where: (field, op, value) => ({
        limit: () => ({
          get: async () => {
            try {
              // Try to get data from the database
              const { db } = await import('./db');
              const tables = {
                'users': async () => {
                  if (field === 'uid') {
                    const [user] = await db.query.users.findMany({
                      where: (users, { eq }) => eq(users.uid, value)
                    });
                    return createMockQuerySnapshot(user ? [user] : []);
                  } else if (field === 'email') {
                    const [user] = await db.query.users.findMany({
                      where: (users, { eq }) => eq(users.email, value)
                    });
                    return createMockQuerySnapshot(user ? [user] : []);
                  } else if (field === 'id') {
                    const [user] = await db.query.users.findMany({
                      where: (users, { eq }) => eq(users.id, value)
                    });
                    return createMockQuerySnapshot(user ? [user] : []);
                  } else if (field === 'referralCode') {
                    const [user] = await db.query.users.findMany({
                      where: (users, { eq }) => eq(users.referralCode, value)
                    });
                    return createMockQuerySnapshot(user ? [user] : []);
                  }
                  return createMockQuerySnapshot([]);
                },
                'subscriptions': async () => {
                  if (field === 'userId') {
                    const [subscription] = await db.query.subscriptions.findMany({
                      where: (subscriptions, { eq }) => eq(subscriptions.userId, value)
                    });
                    return createMockQuerySnapshot(subscription ? [subscription] : []);
                  } else if (field === 'razorpaySubId') {
                    const [subscription] = await db.query.subscriptions.findMany({
                      where: (subscriptions, { eq }) => eq(subscriptions.razorpaySubId, value)
                    });
                    return createMockQuerySnapshot(subscription ? [subscription] : []);
                  } else if (field === 'id') {
                    const [subscription] = await db.query.subscriptions.findMany({
                      where: (subscriptions, { eq }) => eq(subscriptions.id, value)
                    });
                    return createMockQuerySnapshot(subscription ? [subscription] : []);
                  }
                  return createMockQuerySnapshot([]);
                },
                'rewards': async () => {
                  if (field === 'week') {
                    const [reward] = await db.query.rewards.findMany({
                      where: (rewards, { eq }) => eq(rewards.week, value)
                    });
                    return createMockQuerySnapshot(reward ? [reward] : []);
                  } else if (field === 'id') {
                    const [reward] = await db.query.rewards.findMany({
                      where: (rewards, { eq }) => eq(rewards.id, value)
                    });
                    return createMockQuerySnapshot(reward ? [reward] : []);
                  }
                  return createMockQuerySnapshot([]);
                },
                'draws': async () => {
                  if (field === 'week') {
                    const [draw] = await db.query.draws.findMany({
                      where: (draws, { eq }) => eq(draws.week, value)
                    });
                    return createMockQuerySnapshot(draw ? [draw] : []);
                  } else if (field === 'id') {
                    const [draw] = await db.query.draws.findMany({
                      where: (draws, { eq }) => eq(draws.id, value)
                    });
                    return createMockQuerySnapshot(draw ? [draw] : []);
                  }
                  return createMockQuerySnapshot([]);
                },
                'claims': async () => {
                  if (field === 'userId' && op === '==') {
                    const claims = await db.query.claims.findMany({
                      where: (claims, { eq }) => eq(claims.userId, value)
                    });
                    return createMockQuerySnapshot(claims);
                  }
                  return createMockQuerySnapshot([]);
                }
              };
              
              if (tables[name]) {
                return await tables[name]();
              }
              
              return createMockQuerySnapshot([]);
            } catch (error) {
              console.error(`Error in mock Firestore where.limit.get for ${name}:`, error);
              return createMockQuerySnapshot([]);
            }
          }
        }),
        get: async () => {
          try {
            const { db } = await import('./db');
            const tables = {
              'users': async () => {
                if (field === 'isAdmin' && value === true) {
                  const users = await db.query.users.findMany({
                    where: (users, { eq }) => eq(users.isAdmin, true)
                  });
                  return createMockQuerySnapshot(users);
                } else if (field === 'isSubscribed' && value === true) {
                  const users = await db.query.users.findMany({
                    where: (users, { eq }) => eq(users.isSubscribed, true)
                  });
                  return createMockQuerySnapshot(users);
                }
                return createMockQuerySnapshot([]);
              },
              'subscriptions': async () => {
                if (field === 'status' && value === 'active') {
                  const subscriptions = await db.query.subscriptions.findMany({
                    where: (subscriptions, { eq }) => eq(subscriptions.status, 'active')
                  });
                  return createMockQuerySnapshot(subscriptions);
                }
                return createMockQuerySnapshot([]);
              }
            };
            
            if (tables[name]) {
              return await tables[name]();
            }
            
            return createMockQuerySnapshot([]);
          } catch (error) {
            console.error(`Error in mock Firestore where.get for ${name}:`, error);
            return createMockQuerySnapshot([]);
          }
        }
      }),
      get: async () => {
        try {
          // Try to get all data from the database
          const { db } = await import('./db');
          const tables = {
            'users': async () => {
              const users = await db.query.users.findMany();
              return createMockQuerySnapshot(users);
            },
            'subscriptions': async () => {
              const subscriptions = await db.query.subscriptions.findMany();
              return createMockQuerySnapshot(subscriptions);
            },
            'rewards': async () => {
              const rewards = await db.query.rewards.findMany();
              return createMockQuerySnapshot(rewards);
            },
            'draws': async () => {
              const draws = await db.query.draws.findMany();
              return createMockQuerySnapshot(draws);
            },
            'claims': async () => {
              const claims = await db.query.claims.findMany();
              return createMockQuerySnapshot(claims);
            }
          };
          
          if (tables[name]) {
            return await tables[name]();
          }
          
          return createMockQuerySnapshot([]);
        } catch (error) {
          console.error(`Error in mock Firestore collection.get for ${name}:`, error);
          return createMockQuerySnapshot([]);
        }
      }
    };
  };
  
  // Create the mock Firestore with database fallback
  firestore = {
    collection: (name) => createMockCollection(name)
  };
  
  console.log('Using mock Firestore with database fallback due to initialization error');
  
  console.warn('Using mock Firestore due to initialization error');
}

/**
 * FirebaseStorage class implements the IStorage interface to store and retrieve data from Firebase Firestore
 */
export class FirebaseStorage implements IStorage {
  // Users collection
  private usersCollection = firestore.collection('users');
  private subscriptionsCollection = firestore.collection('subscriptions');
  private rewardsCollection = firestore.collection('rewards');
  private drawsCollection = firestore.collection('draws');
  private claimsCollection = firestore.collection('claims');

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const querySnapshot = await this.usersCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const userData = querySnapshot.docs[0].data() as User;
    return this.normalizeUserDates(userData);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const querySnapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const userData = querySnapshot.docs[0].data() as User;
    return this.normalizeUserDates(userData);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const querySnapshot = await this.usersCollection.where('uid', '==', uid).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const userData = querySnapshot.docs[0].data() as User;
    return this.normalizeUserDates(userData);
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const querySnapshot = await this.usersCollection.where('referralCode', '==', code).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const userData = querySnapshot.docs[0].data() as User;
    return this.normalizeUserDates(userData);
  }

  async createUser(user: InsertUser): Promise<User> {
    // Get the next ID
    const idDoc = await firestore.collection('counters').doc('users').get();
    let nextId = 1;
    
    if (idDoc.exists) {
      nextId = idDoc.data()?.nextId || 1;
      await firestore.collection('counters').doc('users').update({
        nextId: nextId + 1
      });
    } else {
      await firestore.collection('counters').doc('users').set({
        nextId: nextId + 1
      });
    }
    
    // Create the user with auto-incremented ID
    const newUser: User = {
      ...user,
      id: nextId,
      createdAt: new Date(),
      profile: null,
      profileCompleted: false
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreUser = {
      ...newUser,
      createdAt: Timestamp.fromDate(newUser.createdAt || new Date()),
      birthday: newUser.birthday ? Timestamp.fromDate(newUser.birthday) : null
    };
    
    // Store user in Firestore
    await this.usersCollection.doc(user.uid).set(firestoreUser);
    
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const querySnapshot = await this.usersCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) throw new Error(`User with ID ${id} not found`);
    
    const docRef = querySnapshot.docs[0].ref;
    const userData = querySnapshot.docs[0].data() as User;
    
    // Convert dates to Firestore Timestamps
    const updateData = { ...data };
    if (updateData.birthday) {
      updateData.birthday = Timestamp.fromDate(updateData.birthday);
    }
    if (updateData.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updateData.createdAt);
    }
    
    // Update the document with merge
    await docRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedUser = updatedDoc.data() as User;
    
    return this.normalizeUserDates(updatedUser);
  }

  async getAdminUsers(): Promise<User[]> {
    const querySnapshot = await this.usersCollection.where('isAdmin', '==', true).get();
    
    return querySnapshot.docs.map(doc => {
      const userData = doc.data() as User;
      return this.normalizeUserDates(userData);
    });
  }

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await this.usersCollection.get();
    
    return querySnapshot.docs.map(doc => {
      const userData = doc.data() as User;
      return this.normalizeUserDates(userData);
    });
  }

  async getActiveSubscribers(): Promise<User[]> {
    const querySnapshot = await this.usersCollection.where('isSubscribed', '==', true).get();
    
    return querySnapshot.docs.map(doc => {
      const userData = doc.data() as User;
      return this.normalizeUserDates(userData);
    });
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const querySnapshot = await this.subscriptionsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const subscriptionData = querySnapshot.docs[0].data() as Subscription;
    return this.normalizeSubscriptionDates(subscriptionData);
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const querySnapshot = await this.subscriptionsCollection.where('userId', '==', userId).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const subscriptionData = querySnapshot.docs[0].data() as Subscription;
    return this.normalizeSubscriptionDates(subscriptionData);
  }

  async getSubscriptionByRazorpayId(razorpaySubId: string): Promise<Subscription | undefined> {
    const querySnapshot = await this.subscriptionsCollection.where('razorpaySubId', '==', razorpaySubId).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const subscriptionData = querySnapshot.docs[0].data() as Subscription;
    return this.normalizeSubscriptionDates(subscriptionData);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    // Get the next ID
    const idDoc = await firestore.collection('counters').doc('subscriptions').get();
    let nextId = 1;
    
    if (idDoc.exists) {
      nextId = idDoc.data()?.nextId || 1;
      await firestore.collection('counters').doc('subscriptions').update({
        nextId: nextId + 1
      });
    } else {
      await firestore.collection('counters').doc('subscriptions').set({
        nextId: nextId + 1
      });
    }
    
    // Create the subscription with auto-incremented ID
    const newSubscription: Subscription = {
      ...subscription,
      id: nextId
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreSubscription = {
      ...newSubscription,
      startDate: Timestamp.fromDate(newSubscription.startDate),
      endDate: Timestamp.fromDate(newSubscription.endDate),
      createdAt: Timestamp.fromDate(new Date())
    };
    
    // Store subscription in Firestore
    await this.subscriptionsCollection.doc(nextId.toString()).set(firestoreSubscription);
    
    return newSubscription;
  }

  async updateSubscription(id: number, data: Partial<Subscription>): Promise<Subscription> {
    const querySnapshot = await this.subscriptionsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) throw new Error(`Subscription with ID ${id} not found`);
    
    const docRef = querySnapshot.docs[0].ref;
    const subscriptionData = querySnapshot.docs[0].data() as Subscription;
    
    // Convert dates to Firestore Timestamps
    const updateData = { ...data };
    if (updateData.startDate) {
      updateData.startDate = Timestamp.fromDate(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = Timestamp.fromDate(updateData.endDate);
    }
    
    // Update the document with merge
    await docRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedSubscription = updatedDoc.data() as Subscription;
    
    return this.normalizeSubscriptionDates(updatedSubscription);
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const querySnapshot = await this.subscriptionsCollection.get();
    
    return querySnapshot.docs.map(doc => {
      const subscriptionData = doc.data() as Subscription;
      return this.normalizeSubscriptionDates(subscriptionData);
    });
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const querySnapshot = await this.subscriptionsCollection.where('status', '==', 'active').get();
    
    return querySnapshot.docs.map(doc => {
      const subscriptionData = doc.data() as Subscription;
      return this.normalizeSubscriptionDates(subscriptionData);
    });
  }

  // Reward operations
  async getReward(id: number): Promise<Reward | undefined> {
    const querySnapshot = await this.rewardsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const rewardData = querySnapshot.docs[0].data() as Reward;
    return this.normalizeRewardDates(rewardData);
  }

  async getRewardByWeek(week: string): Promise<Reward | undefined> {
    const querySnapshot = await this.rewardsCollection.where('week', '==', week).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const rewardData = querySnapshot.docs[0].data() as Reward;
    return this.normalizeRewardDates(rewardData);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    // Get the next ID
    const idDoc = await firestore.collection('counters').doc('rewards').get();
    let nextId = 1;
    
    if (idDoc.exists) {
      nextId = idDoc.data()?.nextId || 1;
      await firestore.collection('counters').doc('rewards').update({
        nextId: nextId + 1
      });
    } else {
      await firestore.collection('counters').doc('rewards').set({
        nextId: nextId + 1
      });
    }
    
    // Create the reward with auto-incremented ID
    const newReward: Reward = {
      ...reward,
      id: nextId,
      createdAt: new Date()
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreReward = {
      ...newReward,
      createdAt: Timestamp.fromDate(newReward.createdAt || new Date())
    };
    
    // Store reward in Firestore
    await this.rewardsCollection.doc(nextId.toString()).set(firestoreReward);
    
    return newReward;
  }

  async updateReward(id: number, data: Partial<Reward>): Promise<Reward> {
    const querySnapshot = await this.rewardsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) throw new Error(`Reward with ID ${id} not found`);
    
    const docRef = querySnapshot.docs[0].ref;
    
    // Convert dates to Firestore Timestamps
    const updateData = { ...data };
    if (updateData.createdAt) {
      updateData.createdAt = Timestamp.fromDate(updateData.createdAt);
    }
    
    // Update the document with merge
    await docRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedReward = updatedDoc.data() as Reward;
    
    return this.normalizeRewardDates(updatedReward);
  }

  async deleteReward(id: number): Promise<boolean> {
    const querySnapshot = await this.rewardsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return false;
    
    const docRef = querySnapshot.docs[0].ref;
    await docRef.delete();
    
    return true;
  }

  async getAllRewards(): Promise<Reward[]> {
    const querySnapshot = await this.rewardsCollection.orderBy('week', 'desc').get();
    
    return querySnapshot.docs.map(doc => {
      const rewardData = doc.data() as Reward;
      return this.normalizeRewardDates(rewardData);
    });
  }

  async getUpcomingRewards(): Promise<Reward[]> {
    const currentWeek = this.getCurrentWeekString();
    const querySnapshot = await this.rewardsCollection.where('week', '>=', currentWeek).orderBy('week', 'asc').get();
    
    return querySnapshot.docs.map(doc => {
      const rewardData = doc.data() as Reward;
      return this.normalizeRewardDates(rewardData);
    });
  }

  async getPastRewards(): Promise<Reward[]> {
    const currentWeek = this.getCurrentWeekString();
    const querySnapshot = await this.rewardsCollection.where('week', '<', currentWeek).orderBy('week', 'desc').get();
    
    return querySnapshot.docs.map(doc => {
      const rewardData = doc.data() as Reward;
      return this.normalizeRewardDates(rewardData);
    });
  }

  async getCurrentReward(): Promise<Reward | undefined> {
    const currentWeek = this.getCurrentWeekString();
    const querySnapshot = await this.rewardsCollection.where('week', '==', currentWeek).limit(1).get();
    
    if (querySnapshot.empty) {
      // If current week doesn't have a reward, find the next closest one
      const futureRewardsSnapshot = await this.rewardsCollection
        .where('week', '>', currentWeek)
        .orderBy('week', 'asc')
        .limit(1)
        .get();
      
      if (futureRewardsSnapshot.empty) return undefined;
      
      const rewardData = futureRewardsSnapshot.docs[0].data() as Reward;
      return this.normalizeRewardDates(rewardData);
    }
    
    const rewardData = querySnapshot.docs[0].data() as Reward;
    return this.normalizeRewardDates(rewardData);
  }

  // Draw operations
  async getDraw(id: number): Promise<Draw | undefined> {
    const querySnapshot = await this.drawsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const drawData = querySnapshot.docs[0].data() as Draw;
    return this.normalizeDrawDates(drawData);
  }

  async getDrawByWeek(week: string): Promise<Draw | undefined> {
    const querySnapshot = await this.drawsCollection.where('week', '==', week).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const drawData = querySnapshot.docs[0].data() as Draw;
    return this.normalizeDrawDates(drawData);
  }

  async createDraw(draw: InsertDraw): Promise<Draw> {
    // Get the next ID
    const idDoc = await firestore.collection('counters').doc('draws').get();
    let nextId = 1;
    
    if (idDoc.exists) {
      nextId = idDoc.data()?.nextId || 1;
      await firestore.collection('counters').doc('draws').update({
        nextId: nextId + 1
      });
    } else {
      await firestore.collection('counters').doc('draws').set({
        nextId: nextId + 1
      });
    }
    
    // Create the draw with auto-incremented ID
    const newDraw: Draw = {
      ...draw,
      id: nextId,
      timestamp: new Date()
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreDraw = {
      ...newDraw,
      timestamp: Timestamp.fromDate(newDraw.timestamp || new Date())
    };
    
    // Store draw in Firestore
    await this.drawsCollection.doc(nextId.toString()).set(firestoreDraw);
    
    return newDraw;
  }

  async updateDraw(id: number, data: Partial<Draw>): Promise<Draw> {
    const querySnapshot = await this.drawsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) throw new Error(`Draw with ID ${id} not found`);
    
    const docRef = querySnapshot.docs[0].ref;
    
    // Convert dates to Firestore Timestamps
    const updateData = { ...data };
    if (updateData.timestamp) {
      updateData.timestamp = Timestamp.fromDate(updateData.timestamp);
    }
    
    // Update the document with merge
    await docRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedDraw = updatedDoc.data() as Draw;
    
    return this.normalizeDrawDates(updatedDraw);
  }

  async getAllDraws(): Promise<Draw[]> {
    const querySnapshot = await this.drawsCollection.orderBy('week', 'desc').get();
    
    return querySnapshot.docs.map(doc => {
      const drawData = doc.data() as Draw;
      return this.normalizeDrawDates(drawData);
    });
  }

  async getPastDraws(): Promise<Draw[]> {
    const currentWeek = this.getCurrentWeekString();
    const querySnapshot = await this.drawsCollection.where('week', '<', currentWeek).orderBy('week', 'desc').get();
    
    return querySnapshot.docs.map(doc => {
      const drawData = doc.data() as Draw;
      return this.normalizeDrawDates(drawData);
    });
  }

  async getDrawsWithWinners(): Promise<(Draw & { winner?: User; reward?: Reward })[]> {
    const draws = await this.getAllDraws();
    const result = [];
    
    for (const draw of draws) {
      if (!draw.winnerId) continue;
      
      const winnerData = await this.getUser(draw.winnerId);
      
      let rewardData = undefined;
      if (draw.rewardId) {
        rewardData = await this.getReward(draw.rewardId);
      }
      
      result.push({
        ...draw,
        winner: winnerData,
        reward: rewardData
      });
    }
    
    return result;
  }

  // Claim operations
  async getClaim(id: number): Promise<Claim | undefined> {
    const querySnapshot = await this.claimsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) return undefined;
    
    const claimData = querySnapshot.docs[0].data() as Claim;
    return this.normalizeClaimDates(claimData);
  }

  async getClaimByUserAndReward(userId: number, rewardId: number): Promise<Claim | undefined> {
    const querySnapshot = await this.claimsCollection
      .where('userId', '==', userId)
      .where('rewardId', '==', rewardId)
      .limit(1)
      .get();
    
    if (querySnapshot.empty) return undefined;
    
    const claimData = querySnapshot.docs[0].data() as Claim;
    return this.normalizeClaimDates(claimData);
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    // Get the next ID
    const idDoc = await firestore.collection('counters').doc('claims').get();
    let nextId = 1;
    
    if (idDoc.exists) {
      nextId = idDoc.data()?.nextId || 1;
      await firestore.collection('counters').doc('claims').update({
        nextId: nextId + 1
      });
    } else {
      await firestore.collection('counters').doc('claims').set({
        nextId: nextId + 1
      });
    }
    
    // Create the claim with auto-incremented ID
    const newClaim: Claim = {
      ...claim,
      id: nextId,
      submittedAt: new Date(),
      status: 'pending'
    };
    
    // Convert Date objects to Firestore Timestamps
    const firestoreClaim = {
      ...newClaim,
      submittedAt: Timestamp.fromDate(newClaim.submittedAt || new Date())
    };
    
    // Store claim in Firestore
    await this.claimsCollection.doc(nextId.toString()).set(firestoreClaim);
    
    return newClaim;
  }

  async updateClaim(id: number, data: Partial<Claim>): Promise<Claim> {
    const querySnapshot = await this.claimsCollection.where('id', '==', id).limit(1).get();
    if (querySnapshot.empty) throw new Error(`Claim with ID ${id} not found`);
    
    const docRef = querySnapshot.docs[0].ref;
    
    // Convert dates to Firestore Timestamps
    const updateData = { ...data };
    if (updateData.submittedAt) {
      updateData.submittedAt = Timestamp.fromDate(updateData.submittedAt);
    }
    if (updateData.processedAt) {
      updateData.processedAt = Timestamp.fromDate(updateData.processedAt);
    }
    
    // Update the document with merge
    await docRef.update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Get updated document
    const updatedDoc = await docRef.get();
    const updatedClaim = updatedDoc.data() as Claim;
    
    return this.normalizeClaimDates(updatedClaim);
  }

  async getAllClaims(): Promise<Claim[]> {
    const querySnapshot = await this.claimsCollection.orderBy('submittedAt', 'desc').get();
    
    return querySnapshot.docs.map(doc => {
      const claimData = doc.data() as Claim;
      return this.normalizeClaimDates(claimData);
    });
  }

  async getPendingClaims(): Promise<(Claim & { user?: User; reward?: Reward })[]> {
    const querySnapshot = await this.claimsCollection
      .where('status', '==', 'pending')
      .orderBy('submittedAt', 'asc')
      .get();
    
    const pendingClaims = querySnapshot.docs.map(doc => {
      const claimData = doc.data() as Claim;
      return this.normalizeClaimDates(claimData);
    });
    
    const result = [];
    
    for (const claim of pendingClaims) {
      const userData = await this.getUser(claim.userId);
      const rewardData = await this.getReward(claim.rewardId);
      
      result.push({
        ...claim,
        user: userData,
        reward: rewardData
      });
    }
    
    return result;
  }

  async getUserClaims(userId: number): Promise<(Claim & { reward?: Reward })[]> {
    const querySnapshot = await this.claimsCollection
      .where('userId', '==', userId)
      .orderBy('submittedAt', 'desc')
      .get();
    
    const userClaims = querySnapshot.docs.map(doc => {
      const claimData = doc.data() as Claim;
      return this.normalizeClaimDates(claimData);
    });
    
    const result = [];
    
    for (const claim of userClaims) {
      const rewardData = await this.getReward(claim.rewardId);
      
      result.push({
        ...claim,
        reward: rewardData
      });
    }
    
    return result;
  }

  // Helper methods
  private normalizeUserDates(user: any): User {
    return {
      ...user,
      createdAt: user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt) : null,
      birthday: user.birthday ? (user.birthday.toDate ? user.birthday.toDate() : user.birthday) : null
    };
  }

  private normalizeSubscriptionDates(subscription: any): Subscription {
    return {
      ...subscription,
      startDate: subscription.startDate ? (subscription.startDate.toDate ? subscription.startDate.toDate() : subscription.startDate) : new Date(),
      endDate: subscription.endDate ? (subscription.endDate.toDate ? subscription.endDate.toDate() : subscription.endDate) : new Date()
    };
  }

  private normalizeRewardDates(reward: any): Reward {
    return {
      ...reward,
      createdAt: reward.createdAt ? (reward.createdAt.toDate ? reward.createdAt.toDate() : reward.createdAt) : null
    };
  }

  private normalizeDrawDates(draw: any): Draw {
    return {
      ...draw,
      timestamp: draw.timestamp ? (draw.timestamp.toDate ? draw.timestamp.toDate() : draw.timestamp) : null
    };
  }

  private normalizeClaimDates(claim: any): Claim {
    return {
      ...claim,
      submittedAt: claim.submittedAt ? (claim.submittedAt.toDate ? claim.submittedAt.toDate() : claim.submittedAt) : null,
      processedAt: claim.processedAt ? (claim.processedAt.toDate ? claim.processedAt.toDate() : claim.processedAt) : null
    };
  }

  private getCurrentWeekString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = this.getCurrentWeekNumber();
    return `${year}-${weekNumber}`;
  }

  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil((day + 1) / 7);
  }
}