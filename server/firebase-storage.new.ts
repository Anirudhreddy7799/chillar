import { getFirestore } from "firebase-admin/firestore";
import { auth } from "./firebase-admin";
import {
  IStorage,
  User,
  Subscription,
  Reward,
  Draw,
  Claim,
} from "./types/storage";

// Get Firestore instance
const db = getFirestore();

// Firebase-based storage implementation
export class FirebaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection("users").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as User) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User);
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const snapshot = await db
      .collection("users")
      .where("uid", "==", uid)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User);
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const snapshot = await db
      .collection("users")
      .where("referralCode", "==", code)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as User);
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const docRef = await db.collection("users").add(user);
    return { id: docRef.id, ...user };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await db.collection("users").doc(id).update(data);
    const updatedDoc = await db.collection("users").doc(id).get();
    if (!updatedDoc.exists) {
      throw new Error(`User with id ${id} not found`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  }

  async getAdminUsers(): Promise<User[]> {
    const snapshot = await db
      .collection("users")
      .where("isAdmin", "==", true)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
  }

  async getActiveSubscribers(): Promise<User[]> {
    const snapshot = await db
      .collection("users")
      .where("isSubscribed", "==", true)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
  }

  // Subscription operations
  async getSubscription(id: string): Promise<Subscription | undefined> {
    const doc = await db.collection("subscriptions").doc(id).get();
    return doc.exists
      ? ({ id: doc.id, ...doc.data() } as Subscription)
      : undefined;
  }

  async getSubscriptionByUserId(
    userId: string
  ): Promise<Subscription | undefined> {
    const snapshot = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as Subscription);
  }

  async getSubscriptionByRazorpayId(
    razorpaySubId: string
  ): Promise<Subscription | undefined> {
    const snapshot = await db
      .collection("subscriptions")
      .where("razorpaySubId", "==", razorpaySubId)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        } as Subscription);
  }

  async createSubscription(
    subscription: Omit<Subscription, "id">
  ): Promise<Subscription> {
    const docRef = await db.collection("subscriptions").add(subscription);
    return { id: docRef.id, ...subscription };
  }

  async updateSubscription(
    id: string,
    data: Partial<Subscription>
  ): Promise<Subscription> {
    await db.collection("subscriptions").doc(id).update(data);
    const updatedDoc = await db.collection("subscriptions").doc(id).get();
    if (!updatedDoc.exists) {
      throw new Error(`Subscription with id ${id} not found`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() } as Subscription;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const snapshot = await db.collection("subscriptions").get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Subscription
    );
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const snapshot = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Subscription
    );
  }

  // Reward operations
  async getReward(id: string): Promise<Reward | undefined> {
    const doc = await db.collection("rewards").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Reward) : undefined;
  }

  async getRewardByWeek(week: string): Promise<Reward | undefined> {
    const snapshot = await db
      .collection("rewards")
      .where("week", "==", week)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Reward);
  }

  async createReward(reward: Omit<Reward, "id">): Promise<Reward> {
    const docRef = await db.collection("rewards").add(reward);
    return { id: docRef.id, ...reward };
  }

  async updateReward(id: string, data: Partial<Reward>): Promise<Reward> {
    await db.collection("rewards").doc(id).update(data);
    const updatedDoc = await db.collection("rewards").doc(id).get();
    if (!updatedDoc.exists) {
      throw new Error(`Reward with id ${id} not found`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() } as Reward;
  }

  async deleteReward(id: string): Promise<boolean> {
    try {
      await db.collection("rewards").doc(id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting reward:", error);
      return false;
    }
  }

  async getAllRewards(): Promise<Reward[]> {
    const snapshot = await db
      .collection("rewards")
      .orderBy("drawDate", "desc")
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Reward
    );
  }

  async getUpcomingRewards(): Promise<Reward[]> {
    const now = new Date();
    const snapshot = await db
      .collection("rewards")
      .where("drawDate", ">=", now)
      .orderBy("drawDate", "asc")
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Reward
    );
  }

  async getPastRewards(): Promise<Reward[]> {
    const now = new Date();
    const snapshot = await db
      .collection("rewards")
      .where("drawDate", "<", now)
      .orderBy("drawDate", "desc")
      .get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Reward
    );
  }

  async getCurrentReward(): Promise<Reward | undefined> {
    const currentWeek = this.getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    const weekString = `${currentYear}-${currentWeek < 10 ? "0" + currentWeek : currentWeek}`;
    return this.getRewardByWeek(weekString);
  }

  // Draw operations
  async getDraw(id: string): Promise<Draw | undefined> {
    const doc = await db.collection("draws").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Draw) : undefined;
  }

  async getDrawByWeek(week: string): Promise<Draw | undefined> {
    const snapshot = await db
      .collection("draws")
      .where("week", "==", week)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Draw);
  }

  async createDraw(draw: Omit<Draw, "id">): Promise<Draw> {
    const docRef = await db.collection("draws").add(draw);
    return { id: docRef.id, ...draw };
  }

  async updateDraw(id: string, data: Partial<Draw>): Promise<Draw> {
    await db.collection("draws").doc(id).update(data);
    const updatedDoc = await db.collection("draws").doc(id).get();
    if (!updatedDoc.exists) {
      throw new Error(`Draw with id ${id} not found`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() } as Draw;
  }

  async getAllDraws(): Promise<Draw[]> {
    const snapshot = await db
      .collection("draws")
      .orderBy("timestamp", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Draw);
  }

  async getPastDraws(): Promise<Draw[]> {
    const now = new Date();
    const snapshot = await db
      .collection("draws")
      .where("timestamp", "<", now)
      .orderBy("timestamp", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Draw);
  }

  async getDrawsWithWinners(): Promise<Draw[]> {
    const snapshot = await db
      .collection("draws")
      .where("status", "==", "completed")
      .orderBy("timestamp", "desc")
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Draw);
  }

  // Claim operations
  async getClaim(id: string): Promise<Claim | undefined> {
    const doc = await db.collection("claims").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Claim) : undefined;
  }

  async getClaimByUserAndReward(
    userId: string,
    rewardId: string
  ): Promise<Claim | undefined> {
    const snapshot = await db
      .collection("claims")
      .where("userId", "==", userId)
      .where("rewardId", "==", rewardId)
      .limit(1)
      .get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Claim);
  }

  async createClaim(claim: Omit<Claim, "id">): Promise<Claim> {
    const docRef = await db.collection("claims").add(claim);
    return { id: docRef.id, ...claim };
  }

  async updateClaim(id: string, data: Partial<Claim>): Promise<Claim> {
    await db.collection("claims").doc(id).update(data);
    const updatedDoc = await db.collection("claims").doc(id).get();
    if (!updatedDoc.exists) {
      throw new Error(`Claim with id ${id} not found`);
    }
    return { id: updatedDoc.id, ...updatedDoc.data() } as Claim;
  }

  async getAllClaims(): Promise<Claim[]> {
    const snapshot = await db.collection("claims").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Claim);
  }

  async getPendingClaims(): Promise<
    (Claim & { user?: User; reward?: Reward })[]
  > {
    const snapshot = await db
      .collection("claims")
      .where("status", "in", ["pending", "approved"])
      .get();

    const claims = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Claim
    );

    return Promise.all(
      claims.map(async (claim) => {
        const user = await this.getUser(claim.userId);
        const reward = await this.getReward(claim.rewardId);
        return { ...claim, user, reward };
      })
    );
  }

  async getUserClaims(
    userId: string
  ): Promise<(Claim & { reward?: Reward })[]> {
    const snapshot = await db
      .collection("claims")
      .where("userId", "==", userId)
      .get();

    const claims = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Claim
    );

    return Promise.all(
      claims.map(async (claim) => {
        const reward = await this.getReward(claim.rewardId);
        return { ...claim, reward };
      })
    );
  }

  // Helper method to get current week number
  private getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil((day + start.getDay()) / 7);
  }
}

// Export the Firebase storage implementation
export const storage = new FirebaseStorage();
