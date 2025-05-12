import { sql } from "drizzle-orm";

export const up = async (db) => {
  // Create draw settings table
  await sql`
    CREATE TABLE draw_settings (
      id SERIAL PRIMARY KEY,
      is_auto_draw_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      draw_day_of_week INTEGER NOT NULL DEFAULT 0,
      draw_hour INTEGER NOT NULL DEFAULT 12,
      notification_days_before INTEGER NOT NULL DEFAULT 1,
      notification_email TEXT NOT NULL,
      backup_draw_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      max_draw_attempts INTEGER NOT NULL DEFAULT 3
    );
  `;

  // Create app settings table
  await sql`
    CREATE TABLE app_settings (
      id SERIAL PRIMARY KEY,
      app_name TEXT NOT NULL,
      support_email TEXT NOT NULL,
      admin_emails TEXT NOT NULL,
      base_url TEXT NOT NULL,
      test_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      subscription_price INTEGER NOT NULL
    );
  `;

  // Create payment settings table
  await sql`
    CREATE TABLE payment_settings (
      id SERIAL PRIMARY KEY, 
      razorpay_key_id TEXT NOT NULL,
      razorpay_secret TEXT NOT NULL,
      razorpay_plan_id TEXT NOT NULL,
      razorpay_webhook_secret TEXT NOT NULL
    );
  `;

  // Add initial records
  await sql`
    INSERT INTO app_settings (
      app_name,
      support_email, 
      admin_emails,
      base_url,
      subscription_price
    ) VALUES (
      'Chillar Club',
      'support@chillarclub.com',
      '',
      'http://localhost:3000',
      3000
    );
  `;

  await sql`
    INSERT INTO draw_settings (notification_email) 
    VALUES ('draws@chillarclub.com');
  `;
};

export const down = async (db) => {
  await sql`DROP TABLE IF EXISTS payment_settings;`;
  await sql`DROP TABLE IF EXISTS app_settings;`;
  await sql`DROP TABLE IF EXISTS draw_settings;`;
};
