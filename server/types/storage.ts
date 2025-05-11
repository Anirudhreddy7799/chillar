// Types for the storage interface
export interface User {
  id: string;
  email: string;
  uid: string;
  referralCode: string;
  referredBy?: string;
  isAdmin?: boolean;
  isSubscribed?: boolean;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  status: "active" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  razorpaySubId?: string;
  plan: string;
  amount: number;
}

export interface Reward {
  id: string;
  week: string;
  prizeName: string;
  prizeValue: number;
  prizeType: string;
  sponsor: string;
  imageUrl?: string;
  drawDate: Date;
  winnerId?: string;
  status: "pending" | "drawn" | "claimed";
}

export interface Draw {
  id: string;
  rewardId: string;
  week: string;
  timestamp: Date;
  winnerId?: string;
  status: "pending" | "completed";
}

export interface Claim {
  id: string;
  userId: string;
  rewardId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  processedAt?: Date;
  metadata?: Record<string, any>;
}

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAdminUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  getActiveSubscribers(): Promise<User[]>;

  // Subscription operations
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: string): Promise<Subscription | undefined>;
  getSubscriptionByRazorpayId(
    razorpaySubId: string
  ): Promise<Subscription | undefined>;
  createSubscription(
    subscription: Omit<Subscription, "id">
  ): Promise<Subscription>;
  updateSubscription(
    id: string,
    data: Partial<Subscription>
  ): Promise<Subscription>;
  getAllSubscriptions(): Promise<Subscription[]>;
  getActiveSubscriptions(): Promise<Subscription[]>;

  // Reward operations
  getReward(id: string): Promise<Reward | undefined>;
  getRewardByWeek(week: string): Promise<Reward | undefined>;
  createReward(reward: Omit<Reward, "id">): Promise<Reward>;
  updateReward(id: string, data: Partial<Reward>): Promise<Reward>;
  deleteReward(id: string): Promise<boolean>;
  getAllRewards(): Promise<Reward[]>;
  getUpcomingRewards(): Promise<Reward[]>;
  getPastRewards(): Promise<Reward[]>;
  getCurrentReward(): Promise<Reward | undefined>;

  // Draw operations
  getDraw(id: string): Promise<Draw | undefined>;
  getDrawByWeek(week: string): Promise<Draw | undefined>;
  createDraw(draw: Omit<Draw, "id">): Promise<Draw>;
  updateDraw(id: string, data: Partial<Draw>): Promise<Draw>;
  getAllDraws(): Promise<Draw[]>;
  getPastDraws(): Promise<Draw[]>;
  getDrawsWithWinners(): Promise<Draw[]>;

  // Claim operations
  getClaim(id: string): Promise<Claim | undefined>;
  getClaimByUserAndReward(
    userId: string,
    rewardId: string
  ): Promise<Claim | undefined>;
  createClaim(claim: Omit<Claim, "id">): Promise<Claim>;
  updateClaim(id: string, data: Partial<Claim>): Promise<Claim>;
  getAllClaims(): Promise<Claim[]>;
  getPendingClaims(): Promise<(Claim & { user?: User; reward?: Reward })[]>;
  getUserClaims(userId: string): Promise<(Claim & { reward?: Reward })[]>;
}
