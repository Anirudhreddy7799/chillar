import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Create a Drizzle instance
export const db = drizzle(pool);

// Also export the pool in case we need direct access
export { pool };
