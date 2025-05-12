export interface DrawConfig {
  drawPercentage: number;
  profitPercentage: number;
  maintenancePercentage: number;
  winnersPerDraw: number;
  minimumReward: number;
  eligibilityDays: number; // Days before a user can win again
  notificationDays: number; // Days before draw to check eligible users
}

export interface DrawWinner {
  uid: string;
  email: string;
  prizeAmount: number;
}

export interface Draw {
  id?: string;
  drawDate: Date;
  winners: DrawWinner[];
  totalPrizePool: number;
  totalRevenue: number;
  createdAt: Date;
  status: "pending" | "completed" | "failed";
  errorMessage?: string;
}

export interface User {
  uid: string;
  email: string;
  isSubscribed: boolean;
  lastWonAt?: Date;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface PrizeDistribution {
  prizes: number[];
  totalPrizePool: number;
}
