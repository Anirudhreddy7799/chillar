import * as functions from "firebase-functions";
import { DrawConfig, User, Draw } from "../../shared/types/lucky-draw";
import { LuckyDrawService } from "../../shared/services/lucky-draw.service";
import { db } from "../firebase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Scheduled function that runs every Saturday at 8:00 AM IST
 */
export const runWeeklyDraw = functions.pubsub
  .schedule("0 8 * * 6") // Every Saturday at 8:00 AM
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const luckyDraw = LuckyDrawService.getInstance();

    try {
      // 1. Fetch current configuration
      const configDoc = await db.collection("config").doc("drawConfig").get();
      const config = configDoc.data() as DrawConfig;

      // 2. Fetch all subscribed users
      const usersSnapshot = await db
        .collection("users")
        .where("isSubscribed", "==", true)
        .get();

      const users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      // 3. Filter eligible users
      const eligibleUsers = luckyDraw.filterEligibleUsers(users, config);

      // 4. Check if we have enough eligible users
      if (eligibleUsers.length < config.winnersPerDraw) {
        // Create a failed draw record
        const failedDraw: Draw = {
          drawDate: new Date(),
          winners: [],
          totalPrizePool: 0,
          totalRevenue: 0,
          createdAt: new Date(),
          status: "failed",
          errorMessage: `Not enough eligible users (${eligibleUsers.length}/${config.winnersPerDraw} required)`,
        };

        await db.collection("draws").add(failedDraw);

        // Notify admin
        await notifyAdmin(failedDraw);
        return;
      }

      // 5. Calculate total revenue and prize pool
      const totalMonthlyRevenue =
        users.filter((u) => u.isSubscribed).length * 30 * 100; // ₹30 per user per month
      const weeklyPrizePool = luckyDraw.calculateWeeklyPrizePool(
        totalMonthlyRevenue,
        config
      );

      // 6. Select winners and calculate prize distribution
      const winners = luckyDraw.selectWinners(eligibleUsers, config);
      const distribution = luckyDraw.calculatePrizeDistribution(
        weeklyPrizePool,
        config
      );

      // 7. Create draw record
      const draw = luckyDraw.createDraw(
        winners,
        distribution,
        totalMonthlyRevenue
      );

      // 8. Save draw record
      const drawRef = await db.collection("draws").add(draw);

      // 9. Update winners' lastWonAt
      const batch = db.batch();
      winners.forEach((winner, index) => {
        const userRef = db.collection("users").doc(winner.uid);
        batch.update(userRef, {
          lastWonAt: new Date(),
          lastWinAmount: distribution.prizes[index],
        });
      });
      await batch.commit();

      // 10. Notify winners
      await notifyWinners(draw);

      return drawRef;
    } catch (error) {
      console.error("Error running weekly draw:", error);
      throw error;
    }
  });

/**
 * Notify winners via email
 */
async function notifyWinners(draw: Draw) {
  for (const winner of draw.winners) {
    try {
      await resend.emails.send({
        from: "Chillar Club <no-reply@chillarclub.com>",
        to: winner.email,
        subject: "🎉 Congratulations! You won the Chillar Club weekly draw!",
        html: `
          <h1>Congratulations! 🎉</h1>
          <p>You've won ₹${winner.prizeAmount} in this week's Chillar Club draw!</p>
          <p>Rewards vary weekly — so stay subscribed for more surprises!</p>
          <p>Visit your dashboard to claim your prize.</p>
        `,
      });
    } catch (error) {
      console.error(`Failed to notify winner ${winner.email}:`, error);
    }
  }
}

/**
 * Notify admin about failed draws or other issues
 */
async function notifyAdmin(draw: Draw) {
  try {
    const adminSnapshot = await db
      .collection("users")
      .where("isAdmin", "==", true)
      .get();

    const adminEmails = adminSnapshot.docs.map((doc) => doc.data().email);

    await resend.emails.send({
      from: "Chillar Club System <no-reply@chillarclub.com>",
      to: adminEmails,
      subject: "⚠️ Weekly Draw Failed - Action Required",
      html: `
        <h1>Weekly Draw Failed</h1>
        <p>The weekly draw scheduled for ${draw.drawDate.toLocaleDateString()} has failed.</p>
        <p>Reason: ${draw.errorMessage}</p>
        <p>Please check the admin dashboard for more details.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to notify admin:", error);
  }
}

/**
 * Check eligible users 5 days before draw
 * Runs every Monday at 8:00 AM IST
 */
export const checkEligibleUsers = functions.pubsub
  .schedule("0 8 * * 1") // Every Monday at 8:00 AM
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    const luckyDraw = LuckyDrawService.getInstance();

    try {
      const configDoc = await db.collection("config").doc("drawConfig").get();
      const config = configDoc.data() as DrawConfig;

      const usersSnapshot = await db
        .collection("users")
        .where("isSubscribed", "==", true)
        .get();

      const users = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];

      const hasEnoughUsers = await luckyDraw.checkEligibleUsersCount(
        users,
        config
      );

      if (!hasEnoughUsers) {
        // Notify admin about potential issues with next draw
        const adminSnapshot = await db
          .collection("users")
          .where("isAdmin", "==", true)
          .get();

        const adminEmails = adminSnapshot.docs.map((doc) => doc.data().email);

        await resend.emails.send({
          from: "Chillar Club System <no-reply@chillarclub.com>",
          to: adminEmails,
          subject: "⚠️ Insufficient Eligible Users for Next Draw",
          html: `
            <h1>Draw Warning</h1>
            <p>There are not enough eligible users for the draw scheduled this Saturday.</p>
            <p>Current eligible users: ${luckyDraw.filterEligibleUsers(users, config).length}</p>
            <p>Required: ${config.winnersPerDraw}</p>
            <p>Please check the admin dashboard and consider adjusting the draw parameters if needed.</p>
          `,
        });
      }

      return { success: true, hasEnoughUsers };
    } catch (error) {
      console.error("Error checking eligible users:", error);
      throw error;
    }
  });
