import {
  DrawConfig,
  PrizeDistribution,
  User,
  Draw,
  DrawWinner,
} from "../types/lucky-draw";

export class LuckyDrawService {
  private static instance: LuckyDrawService;
  private readonly DEFAULT_CONFIG: DrawConfig = {
    drawPercentage: 50,
    profitPercentage: 30,
    maintenancePercentage: 20,
    winnersPerDraw: 3,
    minimumReward: 500,
    eligibilityDays: 21,
    notificationDays: 5,
  };

  private constructor() {}

  public static getInstance(): LuckyDrawService {
    if (!LuckyDrawService.instance) {
      LuckyDrawService.instance = new LuckyDrawService();
    }
    return LuckyDrawService.instance;
  }

  /**
   * Calculate prize distribution for winners
   * Uses a fair algorithm to distribute prizes randomly but ensuring minimum amounts
   */
  public calculatePrizeDistribution(
    totalAmount: number,
    config: DrawConfig
  ): PrizeDistribution {
    const prizes: number[] = [];
    let remainingPool = totalAmount;
    const winnersCount = config.winnersPerDraw;
    const minReward = config.minimumReward;

    // Validate minimum pool amount
    const minRequired = winnersCount * minReward;
    if (totalAmount < minRequired) {
      throw new Error(
        `Prize pool ${totalAmount} is less than minimum required: ${minRequired}`
      );
    }

    // Calculate prizes for each winner
    for (let i = 0; i < winnersCount; i++) {
      const isLastWinner = i === winnersCount - 1;
      if (isLastWinner) {
        // Last winner gets the remaining pool
        prizes.push(Math.floor(remainingPool));
      } else {
        // Calculate maximum possible prize for this winner
        const remainingWinners = winnersCount - i;
        const maxPossible = remainingPool - (remainingWinners - 1) * minReward;

        // Generate a random prize between min and max
        const range = maxPossible - minReward;
        const randomPrize = Math.floor(minReward + Math.random() * range);
        prizes.push(randomPrize);
        remainingPool -= randomPrize;
      }
    }

    // Shuffle prizes so position doesn't determine amount
    for (let i = prizes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
    }

    return {
      prizes,
      totalPrizePool: prizes.reduce((sum, prize) => sum + prize, 0),
    };
  }

  /**
   * Filter eligible users based on subscription status and last win date
   */
  public filterEligibleUsers(users: User[], config: DrawConfig): User[] {
    const now = new Date();
    const eligibilityDate = new Date(
      now.getTime() - config.eligibilityDays * 24 * 60 * 60 * 1000
    );

    return users.filter((user) => {
      // Must be subscribed
      if (!user.isSubscribed) return false;

      // Check if user has won recently
      if (user.lastWonAt) {
        return user.lastWonAt < eligibilityDate;
      }

      return true;
    });
  }

  /**
   * Select winners randomly from eligible users
   */
  public selectWinners(eligibleUsers: User[], config: DrawConfig): User[] {
    if (eligibleUsers.length < config.winnersPerDraw) {
      throw new Error(
        `Not enough eligible users (${eligibleUsers.length}) for draw (${config.winnersPerDraw} required)`
      );
    }

    // Shuffle users array
    const shuffled = [...eligibleUsers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take first n users as winners
    return shuffled.slice(0, config.winnersPerDraw);
  }

  /**
   * Create a draw record with winners and prize distribution
   */
  public createDraw(
    winners: User[],
    distribution: PrizeDistribution,
    totalRevenue: number
  ): Draw {
    const drawWinners: DrawWinner[] = winners.map((winner, index) => ({
      uid: winner.uid,
      email: winner.email,
      prizeAmount: distribution.prizes[index],
    }));

    return {
      drawDate: new Date(),
      winners: drawWinners,
      totalPrizePool: distribution.totalPrizePool,
      totalRevenue,
      createdAt: new Date(),
      status: "completed",
    };
  }

  /**
   * Calculate the weekly prize pool based on total revenue and configuration
   */
  public calculateWeeklyPrizePool(
    totalMonthlyRevenue: number,
    config: DrawConfig
  ): number {
    const monthlyPrizePool =
      (totalMonthlyRevenue * config.drawPercentage) / 100;
    // Assuming 4 weeks per month
    return Math.floor(monthlyPrizePool / 4);
  }

  /**
   * Check if there are enough eligible users for the next draw
   * Should be called 5 days before the draw
   */
  public async checkEligibleUsersCount(
    users: User[],
    config: DrawConfig
  ): Promise<boolean> {
    const eligibleUsers = this.filterEligibleUsers(users, config);
    return eligibleUsers.length >= config.winnersPerDraw;
  }
}
