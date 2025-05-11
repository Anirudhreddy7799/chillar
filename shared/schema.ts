import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users collection
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  uid: text("uid").notNull().unique(),
  uniqueId: text("unique_id").unique(),
  birthday: timestamp("birthday"),
  isAdmin: boolean("is_admin").notNull().default(false),
  referralCode: text("referral_code"),
  referredBy: text("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  isSubscribed: boolean("is_subscribed").notNull().default(false),
  profile: text("profile"), // Store profile data as JSON string
  profileCompleted: boolean("profile_completed").notNull().default(false),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
    relationName: "user_subscription",
  }),
  claims: many(claims),
  draws: many(draws, { relationName: "winner_draws" }),
}));

// Subscriptions collection
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpaySubId: text("razorpay_subscription_id"),
  planId: text("plan_id"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull(), // active, cancelled, expired, payment_failed
  amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("INR"),
  isActive: boolean("is_active").notNull().default(false),
  metadata: text("metadata"), // Store additional Razorpay data as JSON string
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
    relationName: "user_subscription",
  }),
}));

// Rewards collection
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  week: text("week").notNull(), // Format: "YYYY-WW"
  prizeName: text("prize_name").notNull(),
  prizeValue: integer("prize_value").notNull(),
  prizeType: text("prize_type").notNull(), // voucher, recharge, subscription
  sponsor: text("sponsor"),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url"),
});

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  draw: one(draws, {
    fields: [rewards.id],
    references: [draws.rewardId],
  }),
  claims: many(claims),
}));

// Draws collection
export const draws = pgTable("draws", {
  id: serial("id").primaryKey(),
  week: text("week").notNull(), // Format: "YYYY-WW"
  winnerId: integer("winner_id").references(() => users.id),
  rewardId: integer("reward_id").references(() => rewards.id),
  claimed: boolean("claimed").notNull().default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const drawsRelations = relations(draws, ({ one }) => ({
  winner: one(users, {
    fields: [draws.winnerId],
    references: [users.id],
    relationName: "winner_draws",
  }),
  reward: one(rewards, {
    fields: [draws.rewardId],
    references: [rewards.id],
  }),
}));

// Claims collection
export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rewardId: integer("reward_id").notNull().references(() => rewards.id),
  notes: text("notes"),
  status: text("status").notNull(), // pending, approved, rejected, fulfilled
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const claimsRelations = relations(claims, ({ one }) => ({
  user: one(users, {
    fields: [claims.userId],
    references: [users.id],
  }),
  reward: one(rewards, {
    fields: [claims.rewardId],
    references: [rewards.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertDrawSchema = createInsertSchema(draws).omit({
  id: true,
  timestamp: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  submittedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Draw = typeof draws.$inferSelect;
export type InsertDraw = z.infer<typeof insertDrawSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
