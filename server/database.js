/**
 * Database Connection Utility
 * 
 * This module provides a robust PostgreSQL database connection with automatic reconnection
 * and connection pooling. It's designed to be portable across different environments.
 */

const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const env = require('./env').default;

class Database {
  constructor() {
    this.pool = null;
    this.db = null;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
  }

  /**
   * Initialize the database connection pool
   */
  async connect() {
    try {
      // If already connected, return the existing connection
      if (this.pool && this.db) {
        return { pool: this.pool, db: this.db };
      }

      console.log('Connecting to PostgreSQL database...');
      
      // Create a new connection pool
      this.pool = new Pool({
        connectionString: env.DATABASE_URL,
        max: 20, // maximum number of clients
        idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 10000, // how long to wait for a connection
      });

      // Test the connection
      await this.pool.query('SELECT NOW()');
      
      // Initialize Drizzle ORM with the pool
      const schema = require('../shared/schema');
      this.db = drizzle(this.pool, { schema });
      
      console.log('Database connection established successfully');
      this.connectionAttempts = 0;
      
      // Set up event listeners for the pool
      this.pool.on('error', (err) => this.handleConnectionError(err));
      
      return { pool: this.pool, db: this.db };
    } catch (error) {
      return this.handleConnectionError(error);
    }
  }

  /**
   * Handle database connection errors with automatic reconnection
   */
  handleConnectionError(error) {
    this.connectionAttempts++;
    
    console.error(`Database connection error (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}): ${error.message}`);
    
    // Close the existing pool if it exists
    if (this.pool) {
      this.pool.end().catch(err => console.error('Error closing pool:', err));
      this.pool = null;
      this.db = null;
    }
    
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      console.log(`Attempting to reconnect in ${this.reconnectInterval / 1000} seconds...`);
      
      // Schedule a reconnection attempt
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error(`Failed to connect to database after ${this.maxConnectionAttempts} attempts`);
      
      // In development, continue with a warning
      if (env.isDev()) {
        console.warn('Running in development mode without database connection. Some features will not work.');
        return { pool: null, db: null };
      } else {
        // In production, throw an error
        throw new Error('Failed to establish database connection');
      }
    }
  }

  /**
   * Close the database connection pool
   */
  async disconnect() {
    if (this.pool) {
      console.log('Closing database connection...');
      await this.pool.end();
      this.pool = null;
      this.db = null;
      console.log('Database connection closed');
    }
  }
}

// Export a singleton instance
const database = new Database();
module.exports = database;