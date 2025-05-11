import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function main() {
  try {
    console.log("Connecting to database...");
    
    const pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool, { schema });
    
    console.log("Creating tables if they don't exist...");
    
    // Create all tables in the correct order (respecting dependencies)
    await db.execute(sql`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        uid TEXT,
        unique_id TEXT,
        birthday TIMESTAMP,
        profile TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_subscribed BOOLEAN DEFAULT FALSE,
        profile_completed BOOLEAN DEFAULT FALSE,
        referral_code TEXT,
        referred_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add unique constraint to email
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
        END IF;
      END $$;
      
      -- Add unique constraint to uid
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_uid_unique'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_uid_unique UNIQUE (uid);
        END IF;
      END $$;
      
      -- Add unique constraint to unique_id
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_unique_id_unique'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_unique_id_unique UNIQUE (unique_id);
        END IF;
      END $$;
      
      -- Add unique constraint to referral_code
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_referral_code_unique'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);
        END IF;
      END $$;
      
      -- Subscriptions table
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        razorpay_subscription_id TEXT,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add foreign key constraint
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_user_id_fkey'
        ) THEN
          ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;
      
      -- Rewards table
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        week TEXT NOT NULL,
        prize_name TEXT NOT NULL,
        prize_description TEXT,
        prize_amount DOUBLE PRECISION,
        prize_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add unique constraint to week
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'rewards_week_unique'
        ) THEN
          ALTER TABLE rewards ADD CONSTRAINT rewards_week_unique UNIQUE (week);
        END IF;
      END $$;
      
      -- Draws table
      CREATE TABLE IF NOT EXISTS draws (
        id SERIAL PRIMARY KEY,
        week TEXT NOT NULL,
        winner_id INTEGER,
        reward_id INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add unique constraint to week
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'draws_week_unique'
        ) THEN
          ALTER TABLE draws ADD CONSTRAINT draws_week_unique UNIQUE (week);
        END IF;
      END $$;
      
      -- Add foreign key constraints
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'draws_winner_id_fkey'
        ) THEN
          ALTER TABLE draws ADD CONSTRAINT draws_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'draws_reward_id_fkey'
        ) THEN
          ALTER TABLE draws ADD CONSTRAINT draws_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL;
        END IF;
      END $$;
      
      -- Claims table
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reward_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        claim_details TEXT,
        admin_notes TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add foreign key constraints
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'claims_user_id_fkey'
        ) THEN
          ALTER TABLE claims ADD CONSTRAINT claims_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'claims_reward_id_fkey'
        ) THEN
          ALTER TABLE claims ADD CONSTRAINT claims_reward_id_fkey FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);
    
    // Check that tables were created
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log("Database tables created:", tables.rows.map(row => row.table_name).join(", "));
    console.log("Database initialization complete!");
    
    await pool.end();
    
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

main();