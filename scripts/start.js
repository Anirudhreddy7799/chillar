#!/usr/bin/env node

/**
 * Chillar Club Startup Script
 * 
 * This script provides an entry point for the application that:
 * 1. Checks for required environment variables
 * 2. Sets up default fallbacks for missing configuration
 * 3. Initializes the database if needed
 * 4. Starts the application with the appropriate configuration
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, yellow: (s) => s, red: (s) => s };

// Check if essential env vars are set, provide defaults for others
function validateEnvironment() {
  const missingVars = [];
  
  // Essential Firebase vars (for client)
  if (!process.env.VITE_FIREBASE_API_KEY) missingVars.push('VITE_FIREBASE_API_KEY');
  if (!process.env.VITE_FIREBASE_PROJECT_ID) missingVars.push('VITE_FIREBASE_PROJECT_ID');
  if (!process.env.VITE_FIREBASE_APP_ID) missingVars.push('VITE_FIREBASE_APP_ID');
  
  // Check database URL
  if (!process.env.DATABASE_URL) {
    console.warn(chalk.yellow('⚠️  DATABASE_URL not set. Using default local PostgreSQL connection.'));
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/chillar_club';
  }
  
  // Check for payment processor configuration in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.RAZORPAY_KEY_ID) {
      console.warn(chalk.yellow('⚠️  RAZORPAY_KEY_ID not set in production. Payments will not work.'));
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.warn(chalk.yellow('⚠️  RAZORPAY_KEY_SECRET not set in production. Payments will not work.'));
    }
  }
  
  // If in development, use Firebase as primary by default
  if (process.env.NODE_ENV !== 'production' && !process.env.USE_FIREBASE_AS_PRIMARY) {
    process.env.USE_FIREBASE_AS_PRIMARY = 'true';
  }
  
  // Exit if critical environment variables are missing
  if (missingVars.length > 0) {
    console.error(chalk.red(`❌ Missing required environment variables: ${missingVars.join(', ')}`));
    console.error(chalk.red('Please set these variables in your .env file or environment.'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Environment validated'));
}

// Start the application with the appropriate configuration
function startApplication() {
  console.log(chalk.green(`🚀 Starting Chillar Club in ${process.env.NODE_ENV || 'development'} mode`));
  
  const isDev = process.env.NODE_ENV !== 'production';
  const startCommand = isDev ? 'tsx' : 'node';
  const scriptPath = isDev ? 'server/index.ts' : 'dist/index.js';
  
  const app = spawn(startCommand, [scriptPath], { stdio: 'inherit' });
  
  app.on('exit', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`❌ Application exited with code ${code}`));
      process.exit(code);
    }
  });
}

// Main execution
try {
  validateEnvironment();
  startApplication();
} catch (error) {
  console.error(chalk.red('❌ Failed to start application:'), error);
  process.exit(1);
}