/**
 * Database Setup Script
 * 
 * This script initializes the PostgreSQL database for a fresh installation.
 * It creates the necessary tables and initializes any required data.
 * 
 * Run this script after cloning the repository and setting up environment variables:
 * $ node scripts/db-setup.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const path = require('path');
const fs = require('fs');

// Check for database URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not found.');
  console.error('Please set up your .env file based on .env.example');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  try {
    // Initialize DB connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');
    
    // Create the database schema using drizzle-kit's push mechanism
    try {
      console.log('🔄 Running database migrations...');
      
      // Use npx to run drizzle-kit push (npm script equivalent)
      const { execSync } = require('child_process');
      execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
      
      console.log('✅ Database schema created successfully');
    } catch (err) {
      console.error('❌ Error creating database schema:', err);
      throw err;
    }
    
    // Initialize basic data if needed
    console.log('✅ Database setup complete!');
    
    // Close the connection
    await pool.end();
    
    console.log('\n📋 Next steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Access the application at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);