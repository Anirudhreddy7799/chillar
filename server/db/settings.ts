import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";
import { AppSettings, DrawSettings, PaymentSettings } from "../types/settings";

// Settings tables
export const drawSettings = pgTable("draw_settings", {
  id: integer("id").primaryKey(),
  isAutoDrawEnabled: boolean("is_auto_draw_enabled").notNull().default(true),
  drawDayOfWeek: integer("draw_day_of_week").notNull().default(0), // Sunday = 0
  drawHour: integer("draw_hour").notNull().default(12), // 12PM default
  notificationDaysBefore: integer("notification_days_before")
    .notNull()
    .default(1),
  notificationEmail: text("notification_email").notNull(),
  backupDrawEnabled: boolean("backup_draw_enabled").notNull().default(false),
  maxDrawAttempts: integer("max_draw_attempts").notNull().default(3),
});

export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey(),
  appName: text("app_name").notNull(),
  supportEmail: text("support_email").notNull(),
  adminEmails: text("admin_emails").notNull(),
  baseUrl: text("base_url").notNull(),
  testModeEnabled: boolean("test_mode_enabled").notNull().default(false),
  subscriptionPrice: integer("subscription_price").notNull(),
});

export const paymentSettings = pgTable("payment_settings", {
  id: integer("id").primaryKey(),
  razorpayKeyId: text("razorpay_key_id").notNull(),
  razorpaySecret: text("razorpay_secret").notNull(),
  razorpayPlanId: text("razorpay_plan_id").notNull(),
  razorpayWebhookSecret: text("razorpay_webhook_secret").notNull(),
});
