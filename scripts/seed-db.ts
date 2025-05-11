import { db } from "../server/db";
import { users, rewards, subscriptions, draws, claims } from "../shared/schema";
import { createHash } from "crypto";

// Simple password hashing function for demo purposes
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

// Get the current date and utility functions for date calculations
const today = new Date();
const oneDay = 24 * 60 * 60 * 1000;
const oneWeek = 7 * oneDay;
const oneMonth = 30 * oneDay;

// Format week strings in "YYYY-WW" format
function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - oneJan.getTime()) / oneDay);
  const weekNum = Math.ceil((dayOfYear + oneJan.getDay()) / 7);
  return `${year}-${weekNum < 10 ? '0' + weekNum : weekNum}`;
}

async function seed() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(claims);
    await db.delete(draws);
    await db.delete(rewards);
    await db.delete(subscriptions);
    await db.delete(users);
    
    console.log("Cleared existing data");

    // Create admin user
    const [admin] = await db.insert(users).values({
      email: "admin@chillarclub.in",
      password: hashPassword("admin123"),
      uid: "admin-uid-123",
      isAdmin: true,
      referralCode: "ADMIN123",
      isSubscribed: true,
      createdAt: new Date(today.getTime() - 30 * oneDay)
    }).returning();
    
    console.log("Created admin user:", admin.email);

    // Create regular users
    const [user1] = await db.insert(users).values({
      email: "user1@example.com",
      password: hashPassword("password123"),
      uid: "user1-uid-123",
      isAdmin: false,
      referralCode: "USER123",
      isSubscribed: true,
      createdAt: new Date(today.getTime() - 25 * oneDay)
    }).returning();
    
    const [user2] = await db.insert(users).values({
      email: "user2@example.com",
      password: hashPassword("password123"),
      uid: "user2-uid-123",
      isAdmin: false,
      referralCode: "USER456",
      referredBy: "ADMIN123",
      isSubscribed: true,
      createdAt: new Date(today.getTime() - 20 * oneDay)
    }).returning();
    
    const [user3] = await db.insert(users).values({
      email: "user3@example.com",
      password: hashPassword("password123"),
      uid: "user3-uid-123",
      isAdmin: false,
      referralCode: "USER789",
      referredBy: "USER123",
      isSubscribed: false,
      createdAt: new Date(today.getTime() - 15 * oneDay)
    }).returning();
    
    console.log("Created regular users");

    // Create subscriptions
    const [sub1] = await db.insert(subscriptions).values({
      userId: admin.id,
      razorpayCustomerId: "rz_cust_admin123",
      razorpaySubId: "rz_sub_admin123",
      startDate: new Date(today.getTime() - 30 * oneDay),
      endDate: new Date(today.getTime() + 30 * oneDay),
      status: "active"
    }).returning();
    
    const [sub2] = await db.insert(subscriptions).values({
      userId: user1.id,
      razorpayCustomerId: "rz_cust_user1",
      razorpaySubId: "rz_sub_user1",
      startDate: new Date(today.getTime() - 25 * oneDay),
      endDate: new Date(today.getTime() + 5 * oneDay),
      status: "active"
    }).returning();
    
    const [sub3] = await db.insert(subscriptions).values({
      userId: user2.id,
      razorpayCustomerId: "rz_cust_user2",
      razorpaySubId: "rz_sub_user2",
      startDate: new Date(today.getTime() - 20 * oneDay),
      endDate: new Date(today.getTime() + 10 * oneDay),
      status: "active"
    }).returning();
    
    console.log("Created subscriptions");

    // Create rewards
    // Previous weeks (completed)
    const previousWeek3 = new Date(today.getTime() - (3 * oneWeek));
    const previousWeek2 = new Date(today.getTime() - (2 * oneWeek));
    const previousWeek1 = new Date(today.getTime() - oneWeek);
    
    // Current and upcoming weeks
    const currentWeek = new Date(today);
    const nextWeek1 = new Date(today.getTime() + oneWeek);
    const nextWeek2 = new Date(today.getTime() + (2 * oneWeek));
    
    const [reward1] = await db.insert(rewards).values({
      week: getWeekString(previousWeek3),
      prizeName: "₹199 Mobile Recharge",
      prizeValue: 199,
      prizeType: "recharge",
      sponsor: "Airtel",
      createdAt: previousWeek3,
      imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1"
    }).returning();
    
    const [reward2] = await db.insert(rewards).values({
      week: getWeekString(previousWeek2),
      prizeName: "₹500 Amazon Voucher",
      prizeValue: 500,
      prizeType: "voucher",
      sponsor: "Amazon",
      createdAt: previousWeek2,
      imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db"
    }).returning();
    
    const [reward3] = await db.insert(rewards).values({
      week: getWeekString(previousWeek1),
      prizeName: "₹300 Movie Tickets",
      prizeValue: 300,
      prizeType: "voucher",
      sponsor: "BookMyShow",
      createdAt: previousWeek1,
      imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728"
    }).returning();
    
    const [reward4] = await db.insert(rewards).values({
      week: getWeekString(currentWeek),
      prizeName: "₹1000 Shopping Voucher",
      prizeValue: 1000,
      prizeType: "voucher",
      sponsor: "Myntra",
      createdAt: currentWeek,
      imageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f"
    }).returning();
    
    const [reward5] = await db.insert(rewards).values({
      week: getWeekString(nextWeek1),
      prizeName: "₹250 Food Delivery Voucher",
      prizeValue: 250,
      prizeType: "voucher",
      sponsor: "Swiggy",
      createdAt: nextWeek1,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
    }).returning();
    
    const [reward6] = await db.insert(rewards).values({
      week: getWeekString(nextWeek2),
      prizeName: "3 Months Spotify Premium",
      prizeValue: 399,
      prizeType: "subscription",
      sponsor: "Spotify",
      createdAt: nextWeek2,
      imageUrl: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7"
    }).returning();
    
    console.log("Created rewards");

    // Create draws for past weeks
    const [draw1] = await db.insert(draws).values({
      week: getWeekString(previousWeek3),
      winnerId: user1.id,
      rewardId: reward1.id,
      claimed: true,
      timestamp: previousWeek3
    }).returning();
    
    const [draw2] = await db.insert(draws).values({
      week: getWeekString(previousWeek2),
      winnerId: user2.id,
      rewardId: reward2.id,
      claimed: true,
      timestamp: previousWeek2
    }).returning();
    
    const [draw3] = await db.insert(draws).values({
      week: getWeekString(previousWeek1),
      winnerId: admin.id,
      rewardId: reward3.id,
      claimed: false,
      timestamp: previousWeek1
    }).returning();
    
    console.log("Created draws");

    // Create claims
    const [claim1] = await db.insert(claims).values({
      userId: user1.id,
      rewardId: reward1.id,
      notes: "Please send recharge to phone number 9876543210",
      status: "fulfilled",
      submittedAt: new Date(previousWeek3.getTime() + oneDay)
    }).returning();
    
    const [claim2] = await db.insert(claims).values({
      userId: user2.id,
      rewardId: reward2.id,
      notes: "Please send voucher code to my email",
      status: "fulfilled",
      submittedAt: new Date(previousWeek2.getTime() + oneDay)
    }).returning();
    
    const [claim3] = await db.insert(claims).values({
      userId: admin.id,
      rewardId: reward3.id,
      notes: "I'll pick up the tickets at the counter",
      status: "pending",
      submittedAt: new Date(previousWeek1.getTime() + oneDay)
    }).returning();
    
    console.log("Created claims");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the seed function
seed();