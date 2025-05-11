import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Required to make the neon client work in Replit
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Create a database pool and connect
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a drizzle client with our schema
export const db = drizzle(pool, { schema });