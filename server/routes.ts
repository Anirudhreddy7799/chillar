import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createOrder, verifyPaymentSignature, createSubscription, handleWebhookEvent, SUBSCRIPTION_PLANS, razorpay } from "./razorpay";
import { z } from "zod";
import {
  insertUserSchema,
  insertSubscriptionSchema, 
  insertRewardSchema,
  insertDrawSchema,
  insertClaimSchema
} from "@shared/schema";

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// The direction of sync depends on which database is primary
const DATABASE_TO_FIREBASE = 'db-to-firebase';
const FIREBASE_TO_DATABASE = 'firebase-to-db';

// Helper function to create a timeout promise that rejects after specified ms
function createTimeoutPromise<T>(ms: number = 10000): Promise<T> {
  return new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error("Firebase timeout reached")), ms);
  });
}

// Determine which way to sync
const PRIMARY_DB_IS_FIREBASE = true; // This is our new flag

// Function to run the sync script - direction depends on which database is primary
async function runSync(syncType: string = 'users', forceDirection?: string) {
  try {
    // Default sync direction based on primary database
    const direction = forceDirection || 
                     (PRIMARY_DB_IS_FIREBASE ? FIREBASE_TO_DATABASE : DATABASE_TO_FIREBASE);
    
    console.log(`Syncing data - ${direction}: ${syncType}`);
    
    // Run the appropriate sync script with direction parameter
    const { stdout, stderr } = await execPromise(`./scripts/run-sync.sh ${syncType} ${direction}`);
    
    if (stdout) console.log(`Sync output: ${stdout}`);
    if (stderr) console.error(`Sync error: ${stderr}`);
    
    return true;
  } catch (error) {
    console.error('Error running sync script:', error);
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Test Razorpay integration in development mode
  app.get('/api/test-razorpay', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'This endpoint is only available in development mode' });
    }
    
    try {
      // Test creating an order
      const testOrder = await razorpay.orders.create({
        amount: 100 * 100, // ₹100 in paise
        currency: 'INR',
        receipt: 'test_receipt_' + Date.now(),
        notes: {
          testMode: true
        }
      });
      
      // Test creating a customer
      const testCustomer = await razorpay.customers.create({
        name: 'Test Customer',
        email: 'test@example.com',
        contact: '1234567890'
      });
      
      return res.status(200).json({
        message: 'Razorpay test integration working correctly',
        order: testOrder,
        customer: testCustomer,
        mode: 'development'
      });
    } catch (error: any) {
      console.error('Razorpay test error:', error);
      return res.status(500).json({ 
        message: 'Error testing Razorpay integration', 
        error: error.message || 'Unknown error' 
      });
    }
  });
  
  // Razorpay Webhook Endpoint
  app.post('/api/razorpay-webhook', async (req, res) => {
    try {
      // Verify webhook signature if needed (requires signature from Razorpay)
      // For testing, we'll process without verification
      const event = req.body;
      const result = await handleWebhookEvent(event);
      
      if (result) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, message: 'Failed to process webhook' });
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ success: false, message: 'Error processing webhook' });
    }
  });
  
  // Create subscription order
  app.post('/api/create-subscription-order', async (req, res) => {
    try {
      if (!req.body.planType || !['MONTHLY', 'ANNUAL'].includes(req.body.planType)) {
        return res.status(400).json({ success: false, message: 'Invalid plan type' });
      }
      
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      const order = await createOrder(user.id, req.body.planType);
      res.status(200).json(order);
    } catch (error) {
      console.error('Error creating subscription order:', error);
      res.status(500).json({ success: false, message: 'Failed to create subscription order' });
    }
  });
  
  // Verify payment and activate subscription
  app.post('/api/verify-subscription-payment', async (req, res) => {
    try {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature, planType } = req.body;
      
      if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({ success: false, message: 'Missing payment verification data' });
      }
      
      // Get authenticated user
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      // Verify payment signature (always accept in development mode)
      let isValid = false;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Automatically accepting payment verification');
        isValid = true;
      } else {
        try {
          isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        } catch (error) {
          console.warn('Error verifying payment signature:', error);
        }
      }
      
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
      
      // Get subscription plan details
      const planTypeFormatted = planType as 'MONTHLY' | 'ANNUAL';
      const plan = SUBSCRIPTION_PLANS[planTypeFormatted] || SUBSCRIPTION_PLANS.MONTHLY;
      
      // In development mode, create a demo subscription directly in the database
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Creating demo subscription in database');
      }
      
      // Get current date and calculate end date based on plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (planType === 'ANNUAL' ? 365 : 30));
      
      // Create or update subscription
      const existingSubscription = await storage.getSubscriptionByUserId(user.id);
      
      if (existingSubscription) {
        // Update existing subscription
        const updatedSubscription = await storage.updateSubscription(existingSubscription.id, {
          status: 'active',
          startDate,
          endDate,
          isActive: true,
          amount: plan.amount,
          currency: plan.currency,
          metadata: JSON.stringify({
            razorpayPaymentId,
            razorpayOrderId,
            planType,
            updatedAt: new Date().toISOString(),
            isDevelopment: process.env.NODE_ENV === 'development'
          })
        });
        
        console.log(`Updated subscription: ${existingSubscription.id} for user ${user.id}`);
      } else {
        // Create new subscription
        const newSubscription = await storage.createSubscription({
          userId: user.id,
          razorpayCustomerId: null,
          razorpaySubId: null,
          planId: plan.id,
          startDate,
          endDate,
          status: 'active',
          amount: plan.amount,
          currency: plan.currency,
          isActive: true,
          metadata: JSON.stringify({
            razorpayPaymentId,
            razorpayOrderId,
            planType,
            createdAt: new Date().toISOString(),
            isDevelopment: process.env.NODE_ENV === 'development'
          })
        });
        
        console.log(`Created new subscription: ${newSubscription.id} for user ${user.id}`);
      }
      
      // Update user subscription status
      await storage.updateUser(user.id, {
        isSubscribed: true
      });
      
      res.status(200).json({ success: true, message: 'Subscription activated successfully' });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
  });
  
  // Get user subscription
  app.get('/api/user/subscription/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      
      if (!uid) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Verify authentication
      const requestingUser = await getUserFromRequest(req);
      if (!requestingUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user by uid
      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check authorization - user can only access their own subscription
      if (user.id !== requestingUser.id && !requestingUser.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Get subscription
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      // Return subscription data
      res.status(200).json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Cancel subscription
  app.post('/api/cancel-subscription', async (req, res) => {
    try {
      const { subscriptionId } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({ success: false, message: 'Missing subscription ID' });
      }
      
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      // Get subscription
      const subscription = await storage.getSubscriptionByRazorpayId(subscriptionId);
      
      if (!subscription || subscription.userId !== user.id) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }
      
      // Update subscription status
      await storage.updateSubscription(subscription.id, {
        status: 'cancelled',
        metadata: JSON.stringify({
          ...JSON.parse(subscription.metadata || '{}'),
          cancelledAt: new Date().toISOString()
        })
      });
      
      res.status(200).json({ success: true, message: 'Subscription cancelled successfully' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
    }
  });
  
  // Get user subscription
  app.get('/api/user/subscription/:uid', async (req, res) => {
    try {
      // Using UID to query user subscription
      const uid = req.params.uid;
      
      if (!uid) {
        return res.status(400).json({ success: false, message: 'Missing user ID' });
      }
      
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      if (!subscription) {
        return res.status(200).json(null); // No subscription
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ success: false, message: 'Failed to get subscription details' });
    }
  });
  
  // Helper function to get user from request
  async function getUserFromRequest(req: Request) {
    // Manual type assertion for Express with Passport
    interface AuthenticatedRequest extends Request {
      isAuthenticated(): boolean;
      user?: any;
    }
    const authReq = req as AuthenticatedRequest;
    
    // If user is already authenticated through session, use that
    if (authReq.isAuthenticated && authReq.isAuthenticated() && authReq.user) {
      return authReq.user;
    }
    
    // For testing purposes in development
    const devEmail = req.headers['x-dev-user-email'];
    if (process.env.NODE_ENV === 'development' && devEmail && typeof devEmail === 'string') {
      try {
        // Look up user by email for testing
        const user = await storage.getUserByEmail(devEmail);
        if (user) {
          console.log(`Development mode: Using user ${devEmail} for testing`);
          return user;
        }
      } catch (err) {
        console.warn('Error getting test user:', err);
      }
    }
    
    return null;
  }
  // Firebase user registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, uid, referralCode, referredBy } = req.body;
      
      if (!email || !uid) {
        return res.status(400).json({ message: 'Email and UID are required' });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }
      
      // Generate a temporary password (user would authenticate via Firebase, not this password)
      const tempPassword = Math.random().toString(36).substring(2, 15);
      
      // Create the user in our database
      const newUser = await storage.createUser({
        email,
        password: tempPassword, // This is required by our schema but not used for auth
        uid,
        referralCode,
        referredBy,
        isSubscribed: false,
        profileCompleted: false,
        // Generate a unique ID for the user (used for referrals)
        uniqueId: `U${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      });
      
      // Sync the new user to Firebase
      runSync('users').catch(err => console.error('Error syncing after user creation:', err));
      
      return res.status(201).json({ 
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          uid: newUser.uid,
          uniqueId: newUser.uniqueId,
          referralCode: newUser.referralCode
        } 
      });
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Email update endpoint
  app.patch('/api/user/email/update/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Verify that the request is coming from the same user
      const requestUid = req.headers['x-user-uid'] as string;
      if (requestUid !== uid) {
        return res.status(403).json({ message: 'Not authorized to update this user' });
      }
      
      // Find the user by UID
      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if email is already in use by another user
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      // Update the user's email
      const updatedUser = await storage.updateUser(user.id, { email });
      
      // Sync the updated user to Firebase
      runSync('users').catch(err => console.error('Error syncing after email update:', err));
      
      return res.json({ 
        success: true,
        message: 'Email updated successfully' 
      });
    } catch (error) {
      console.error('Error updating user email:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User profile routes
  app.get('/api/user/profile/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      console.log(`Fetching profile for user ${uid}`);
      
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      try {
        // Try to get user with timeout
        const userPromise = storage.getUserByUid(uid);
        let user;
        
        try {
          user = await Promise.race([userPromise, timeoutPromise]);
          console.log(`User retrieved for ${uid}:`, user ? 'Found' : 'Not found');
        } catch (timeoutError) {
          console.log("Timeout reached when fetching user profile, falling back to cached data");
          // Continue with default empty profile on timeout
          const defaultProfile = { 
            name: '', 
            birthday: null, 
            location: '', 
            phone: '', 
            avatarUrl: '',
            referralCode: ''
          };
          return res.json(defaultProfile);
        }
        
        // If user not found, return default empty profile
        // This prevents app failures when user is still being authenticated
        if (!user) {
          console.log(`User with uid ${uid} not found, returning default empty profile`);
          const defaultProfile = { 
            name: '', 
            birthday: null, 
            location: '', 
            phone: '', 
            avatarUrl: '',
            referralCode: ''
          };
          return res.json(defaultProfile);
        }
        
        console.log(`Found user ${uid} in database:`, JSON.stringify(user).substring(0, 100) + '...');
        
        // First check if this is a Firestore record with the profile already as an object
        if (user.profile && typeof user.profile === 'object') {
          console.log(`User ${uid} has profile as object`);
          const profile = user.profile as any;
          
          // Return formatted profile data
          const formattedProfile = {
            name: profile.name || '',
            birthday: profile.birthday || null,
            location: profile.location || '',
            phone: profile.phone || '',
            avatarUrl: profile.avatarUrl || '',
            referralCode: user.referralCode || ''
          };
          
          console.log(`Returning formatted profile for ${uid}:`, JSON.stringify(formattedProfile).substring(0, 100) + '...');
          return res.json(formattedProfile);
        }
        
        // Parse profile data from JSON string (for PostgreSQL records)
        let profileData = { 
          name: '', 
          birthday: null, 
          location: '', 
          phone: '', 
          avatarUrl: '',
          referralCode: user.referralCode || '' // Changed from uniqueId to referralCode
        };
        
        if (user.profile && typeof user.profile === 'string') {
          try {
            console.log(`Parsing profile string for user ${uid}`);
            const parsedProfile = JSON.parse(user.profile);
            profileData = {
              ...profileData,
              ...parsedProfile
            };
          } catch (parseError) {
            console.error('Error parsing profile data:', parseError);
          }
        }
        
        console.log(`Returning profile data for ${uid}:`, JSON.stringify(profileData).substring(0, 100) + '...');
        
        // Return profile data
        return res.json(profileData);
      } catch (userError) {
        console.error('Error retrieving user for profile:', userError);
        // Return default profile instead of an error for graceful degradation
        const defaultProfile = { 
          name: '', 
          birthday: null, 
          location: '', 
          phone: '', 
          avatarUrl: '',
          referralCode: '' // Changed from uniqueId to referralCode
        };
        return res.json(defaultProfile);
      }
    } catch (error) {
      console.error('Error in profile endpoint:', error);
      // Return default profile instead of an error to prevent app from breaking
      const defaultProfile = { 
        name: '', 
        birthday: null, 
        location: '', 
        phone: '', 
        avatarUrl: '',
        uniqueId: ''
      };
      return res.json(defaultProfile);
    }
  });

  // Regular profile update
  app.patch('/api/user/profile/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const profileData = req.body;
      
      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Stringify profile data as JSON
      const profileJson = JSON.stringify(profileData);
      
      // Update user profile
      const updatedUser = await storage.updateUser(user.id, {
        profile: profileJson,
      });
      
      // Parse updated profile
      let parsedProfile = null;
      if (updatedUser.profile) {
        try {
          parsedProfile = JSON.parse(updatedUser.profile);
        } catch (parseError) {
          console.error('Error parsing updated profile:', parseError);
        }
      }
      
      return res.json({
        success: true,
        profile: parsedProfile,
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Complete profile (first login)
  app.patch('/api/user/profile/complete/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const { name, birthday, location, phone, uniqueId, profileCompleted } = req.body;
      
      const user = await storage.getUserByUid(uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create profile data object
      const profileData = {
        name,
        birthday,
        location,
        phone,
        avatarUrl: '', // Default empty
      };
      
      // Stringify profile data as JSON
      const profileJson = JSON.stringify(profileData);
      
      // Update user profile and set profileCompleted flag
      const updatedUser = await storage.updateUser(user.id, {
        profile: profileJson,
        uniqueId,
        profileCompleted: true
      });
      
      // Sync the updated user profile to Firebase
      runSync('users').catch(err => console.error('Error syncing after profile completion:', err));
      
      return res.json({
        success: true,
        profileCompleted: true,
        uniqueId
      });
    } catch (error) {
      console.error('Error completing user profile:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/user/subscription/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      
      try {
        const user = await storage.getUserByUid(uid);
        
        // If user not found, return default empty subscription
        if (!user) {
          console.log(`User with uid ${uid} not found, returning default empty subscription`);
          const defaultSubscription = { 
            id: 0, 
            status: 'inactive',
            userId: 0,
            startDate: new Date(),
            endDate: new Date(),
            razorpayCustomerId: null,
            razorpaySubId: null
          };
          return res.json(defaultSubscription);
        }
        
        // Attempt to get the user's subscription
        try {
          const subscription = await storage.getSubscriptionByUserId(user.id);
          
          // If no subscription, return default subscription model
          if (!subscription) {
            console.log(`No active subscription found for user ${user.id}, returning default`);
            const defaultSubscription = { 
              id: 0, 
              status: 'inactive',
              userId: user.id,
              startDate: new Date(),
              endDate: new Date(),
              razorpayCustomerId: null,
              razorpaySubId: null
            };
            return res.json(defaultSubscription);
          }
          
          // We have a valid subscription
          return res.json(subscription);
        } catch (subscriptionError) {
          console.error('Error retrieving subscription data:', subscriptionError);
          // Return default subscription instead of an error
          const defaultSubscription = { 
            id: 0, 
            status: 'inactive',
            userId: user.id,
            startDate: new Date(),
            endDate: new Date(),
            razorpayCustomerId: null,
            razorpaySubId: null
          };
          return res.json(defaultSubscription);
        }
      } catch (userError) {
        console.error('Error retrieving user for subscription:', userError);
        // Return default subscription instead of an error
        const defaultSubscription = { 
          id: 0, 
          status: 'inactive',
          userId: 0,
          startDate: new Date(),
          endDate: new Date(),
          razorpayCustomerId: null,
          razorpaySubId: null
        };
        return res.json(defaultSubscription);
      }
    } catch (error) {
      console.error('Error in subscription endpoint:', error);
      // Return default subscription instead of an error to prevent app from breaking
      const defaultSubscription = { 
        id: 0, 
        status: 'inactive',
        userId: 0,
        startDate: new Date(),
        endDate: new Date(),
        razorpayCustomerId: null,
        razorpaySubId: null
      };
      return res.json(defaultSubscription);
    }
  });

  app.post('/api/user/subscription/cancel/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get user's subscription
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      // Update subscription status to 'cancelled'
      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        status: 'cancelled',
      });
      
      // Update user's subscription status
      await storage.updateUser(user.id, {
        isSubscribed: false,
      });
      
      // Sync the updated subscription status to Firebase
      runSync('users').catch(err => console.error('Error syncing after subscription cancellation:', err));
      runSync('subscriptions').catch(err => console.error('Error syncing subscriptions:', err));
      
      return res.json({
        success: true,
        subscription: updatedSubscription,
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  const httpServer = createServer(app);

  // Check if user is authenticated
  const isAuthenticated = async (req: Request, res: Response, next: Function) => {
    // Manual type assertion for Express with Passport
    interface AuthenticatedRequest extends Request {
      isAuthenticated(): boolean;
      user?: any;
    }
    const authReq = req as AuthenticatedRequest;
    
    // If user is already authenticated through session, pass through
    if (authReq.isAuthenticated && authReq.isAuthenticated() && authReq.user) {
      return next();
    }
    
    // Otherwise check for Firebase auth token
    const uid = req.headers['x-user-uid'] as string;
    if (uid) {
      return next();
    }
    
    // For development and testing only
    if (process.env.NODE_ENV === 'development') {
      const devEmail = req.headers['x-dev-user-email'] as string;
      if (devEmail) {
        try {
          const user = await storage.getUserByEmail(devEmail);
          if (user) {
            console.log(`Development mode: Using user ${devEmail} for testing`);
            return next();
          }
        } catch (err) {
          console.warn('Error getting test user:', err);
        }
      }
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Check if user is admin
  const isAdmin = async (req: Request, res: Response, next: Function) => {
    // First check if authenticated
    // Manual type assertion for Express with Passport
    interface AuthenticatedRequest extends Request {
      isAuthenticated(): boolean;
      user?: any;
    }
    const authReq = req as AuthenticatedRequest;
    
    // Regular authentication methods
    let user = null;
    
    // Session auth
    if (authReq.isAuthenticated && authReq.isAuthenticated() && authReq.user) {
      user = authReq.user;
    }
    
    // Firebase auth
    if (!user) {
      const uid = req.headers['x-user-uid'] as string;
      if (uid) {
        user = await storage.getUserByUid(uid);
      }
    }
    
    // Dev auth for testing
    if (!user && process.env.NODE_ENV === 'development') {
      const devEmail = req.headers['x-dev-user-email'] as string;
      if (devEmail) {
        try {
          user = await storage.getUserByEmail(devEmail);
          if (user) {
            console.log(`Development mode: Using admin user ${devEmail} for testing`);
          }
        } catch (err) {
          console.warn('Error getting test admin user:', err);
        }
      }
    }
    
    // Check admin status
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  };

  // User Routes
  app.post("/api/users", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid user data", errors: validationResult.error.errors });
      }

      const userData = validationResult.data;
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Generate a referral code if not provided
      if (!userData.referralCode) {
        userData.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }

      // Create user
      const user = await storage.createUser(userData);
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/me", isAuthenticated, async (req, res) => {
    try {
      const uid = req.headers['x-user-uid'] as string;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user subscription
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      // Get user claims
      const claims = await storage.getUserClaims(user.id);
      
      res.json({
        ...user,
        password: undefined,
        subscription,
        claims
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Subscription Routes
  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertSubscriptionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid subscription data", errors: validationResult.error.errors });
      }

      const subscriptionData = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUser(subscriptionData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create subscription
      const subscription = await storage.createSubscription(subscriptionData);
      
      // Update user subscription status
      await storage.updateUser(user.id, { isSubscribed: true });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", isAuthenticated, async (req, res) => {
    try {
      const subscriptionId = parseInt(req.params.id);
      if (isNaN(subscriptionId)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }
      
      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const uid = req.headers['x-user-uid'] as string;
      const user = await storage.getUserByUid(uid);
      
      if (!user || (user.id !== subscription.userId && !user.isAdmin)) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this subscription" });
      }
      
      const updatedSubscription = await storage.updateSubscription(subscriptionId, req.body);
      
      // If subscription status is changed, update user subscription status
      if (req.body.status && req.body.status !== subscription.status) {
        await storage.updateUser(subscription.userId, { 
          isSubscribed: req.body.status === 'active'
        });
      }
      
      res.json(updatedSubscription);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.post("/api/razorpay/webhook", async (req, res) => {
    try {
      // In a real app, verify Razorpay webhook signature here
      const event = req.body;
      
      if (event.event === 'subscription.authenticated') {
        // User has successfully subscribed
        const razorpaySubId = event.payload.subscription.id;
        
        // Find subscription by Razorpay ID
        const subscription = await storage.getSubscriptionByRazorpayId(razorpaySubId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, { 
            status: 'active' 
          });
          
          // Update user subscription status
          await storage.updateUser(subscription.userId, { isSubscribed: true });
        }
      } else if (event.event === 'subscription.cancelled' || event.event === 'subscription.expired') {
        // Subscription cancelled or expired
        const razorpaySubId = event.payload.subscription.id;
        
        // Find subscription by Razorpay ID
        const subscription = await storage.getSubscriptionByRazorpayId(razorpaySubId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, { 
            status: event.event === 'subscription.cancelled' ? 'cancelled' : 'expired' 
          });
          
          // Update user subscription status
          await storage.updateUser(subscription.userId, { isSubscribed: false });
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error handling Razorpay webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Reward Routes
  app.get("/api/rewards", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = createTimeoutPromise<any[]>();
      
      // Race the actual query against the timeout
      const rewards = await Promise.race([
        storage.getAllRewards().catch(error => {
          console.error("Error in getAllRewards:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we have a valid array response
      if (!rewards || !Array.isArray(rewards)) {
        console.log("No rewards found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.get("/api/rewards/upcoming", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = createTimeoutPromise<any[]>();
      
      // Race the actual query against the timeout
      const rewards = await Promise.race([
        storage.getUpcomingRewards().catch(error => {
          console.error("Error in getUpcomingRewards:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout for upcoming rewards:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we have a valid array response
      if (!rewards || !Array.isArray(rewards)) {
        console.log("No upcoming rewards found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching upcoming rewards:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.get("/api/rewards/past", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any[]>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      // Race the actual query against the timeout
      const rewards = await Promise.race([
        storage.getPastRewards().catch(error => {
          console.error("Error in getPastRewards:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout for past rewards:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we have a valid array response
      if (!rewards || !Array.isArray(rewards)) {
        console.log("No past rewards found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching past rewards:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.get("/api/rewards/current", async (req, res) => {
    try {
      // Generate default reward object for fallback
      const defaultReward = {
        id: 0,
        week: `${new Date().getFullYear()}-W${Math.floor((new Date().getDate() + new Date().getDay()) / 7) + 1}`,
        prizeName: "Coming Soon",
        prizeValue: 0,
        prizeType: "unspecified",
        sponsor: null,
        createdAt: new Date(),
        imageUrl: null
      };
      
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      // Race the actual query against the timeout
      const reward = await Promise.race([
        storage.getCurrentReward().catch(error => {
          console.error("Error in getCurrentReward:", error);
          return null; // Return null on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout for current reward:", error);
        return null; // Return null on race error or timeout
      });
      
      // Return the reward if it exists
      if (reward) {
        return res.json(reward);
      }
      
      // If no current reward found, return default empty reward
      console.log("No current reward found, returning default empty reward");      
      return res.json(defaultReward);
    } catch (error) {
      console.error("Error fetching current reward:", error);
      
      // Return default reward instead of error to prevent app from breaking
      const defaultReward = {
        id: 0,
        week: `${new Date().getFullYear()}-W${Math.floor((new Date().getDate() + new Date().getDay()) / 7) + 1}`,
        prizeName: "Coming Soon",
        prizeValue: 0,
        prizeType: "unspecified",
        sponsor: null,
        createdAt: new Date(),
        imageUrl: null
      };
      
      return res.json(defaultReward);
    }
  });

  app.post("/api/rewards", isAdmin, async (req, res) => {
    try {
      const validationResult = insertRewardSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid reward data", errors: validationResult.error.errors });
      }

      const rewardData = validationResult.data;
      
      // Check if reward for this week already exists
      const existingReward = await storage.getRewardByWeek(rewardData.week);
      if (existingReward) {
        return res.status(409).json({ message: "Reward for this week already exists" });
      }
      
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      console.error("Error creating reward:", error);
      res.status(500).json({ message: "Failed to create reward" });
    }
  });

  app.patch("/api/rewards/:id", isAdmin, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      const updatedReward = await storage.updateReward(rewardId, req.body);
      res.json(updatedReward);
    } catch (error) {
      console.error("Error updating reward:", error);
      res.status(500).json({ message: "Failed to update reward" });
    }
  });

  app.delete("/api/rewards/:id", isAdmin, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      const success = await storage.deleteReward(rewardId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete reward" });
      }
    } catch (error) {
      console.error("Error deleting reward:", error);
      res.status(500).json({ message: "Failed to delete reward" });
    }
  });

  // Draw Routes
  app.get("/api/draws", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any[]>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      // Race the actual query against the timeout
      const draws = await Promise.race([
        storage.getAllDraws().catch(error => {
          console.error("Error in getAllDraws:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout for all draws:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we have a valid array response
      if (!draws || !Array.isArray(draws)) {
        console.log("No draws found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(draws);
    } catch (error) {
      console.error("Error fetching draws:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.get("/api/draws/past", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any[]>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      // Race the actual query against the timeout
      const draws = await Promise.race([
        storage.getPastDraws().catch(error => {
          console.error("Error in getPastDraws:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout for past draws:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we have a valid array response
      if (!draws || !Array.isArray(draws)) {
        console.log("No past draws found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(draws);
    } catch (error) {
      console.error("Error fetching past draws:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.get("/api/draws/winners", async (req, res) => {
    try {
      // Add a timeout to prevent long-hanging connections
      const timeoutPromise = new Promise<any[]>((_, reject) => {
        setTimeout(() => reject(new Error("Firebase timeout reached")), 5000);
      });
      
      // Race the actual query against the timeout
      const drawsWithWinners = await Promise.race([
        storage.getDrawsWithWinners().catch(error => {
          console.error("Error in getDrawsWithWinners:", error);
          return []; // Return empty array on specific function error
        }),
        timeoutPromise
      ]).catch(error => {
        console.error("Promise.race error or timeout:", error);
        return []; // Return empty array on race error or timeout
      });
      
      // Check if we got a valid response
      if (!drawsWithWinners || !Array.isArray(drawsWithWinners)) {
        console.log("No winners found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      // Mask winner emails for privacy
      const maskedDraws = drawsWithWinners.map(draw => {
        if (!draw) return {}; // Handle null/undefined draws
        
        try {
          if (draw.winner && draw.winner.email) {
            const email = draw.winner.email;
            const atIndex = email.indexOf("@");
            // Handle case where email might not have @ symbol
            const maskedEmail = atIndex > 0 
              ? email.charAt(0) + "****" + email.substring(atIndex)
              : "****@example.com"; // Fallback if email format is invalid
              
            return { 
              ...draw, 
              winner: { 
                ...draw.winner, 
                email: maskedEmail,
                password: undefined 
              } 
            };
          }
          return draw;
        } catch (e) {
          console.error("Error processing draw winner:", e);
          // Return basic draw without winner details if there's an error
          const safeDrawData = {
            id: draw.id,
            week: draw.week || "unknown",
            timestamp: draw.timestamp
          };
          return safeDrawData;
        }
      });
      
      res.json(maskedDraws);
    } catch (error) {
      console.error("Error fetching winners:", error);
      // Return empty array instead of error to prevent app from breaking
      res.status(200).json([]);
    }
  });

  app.post("/api/draws", isAdmin, async (req, res) => {
    try {
      const validationResult = insertDrawSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid draw data", errors: validationResult.error.errors });
      }

      const drawData = validationResult.data;
      
      // Check if draw for this week already exists
      const existingDraw = await storage.getDrawByWeek(drawData.week);
      if (existingDraw) {
        return res.status(409).json({ message: "Draw for this week already exists" });
      }
      
      // If no winner specified, select a random winner from active subscribers
      if (!drawData.winnerId) {
        const activeSubscribers = await storage.getActiveSubscribers();
        if (activeSubscribers.length > 0) {
          const randomIndex = Math.floor(Math.random() * activeSubscribers.length);
          drawData.winnerId = activeSubscribers[randomIndex].id;
        }
      }
      
      const draw = await storage.createDraw(drawData);
      res.status(201).json(draw);
    } catch (error) {
      console.error("Error creating draw:", error);
      res.status(500).json({ message: "Failed to create draw" });
    }
  });

  app.patch("/api/draws/:id", isAdmin, async (req, res) => {
    try {
      const drawId = parseInt(req.params.id);
      if (isNaN(drawId)) {
        return res.status(400).json({ message: "Invalid draw ID" });
      }
      
      const draw = await storage.getDraw(drawId);
      if (!draw) {
        return res.status(404).json({ message: "Draw not found" });
      }
      
      const updatedDraw = await storage.updateDraw(drawId, req.body);
      res.json(updatedDraw);
    } catch (error) {
      console.error("Error updating draw:", error);
      res.status(500).json({ message: "Failed to update draw" });
    }
  });

  // Claim Routes
  app.get("/api/claims", isAdmin, async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      
      // Check if we have a valid array response
      if (!claims || !Array.isArray(claims)) {
        console.log("No claims found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(claims);
    } catch (error) {
      console.error("Error fetching claims:", error);
      // Return empty array instead of error to prevent app from breaking
      res.json([]);
    }
  });

  app.get("/api/claims/pending", isAdmin, async (req, res) => {
    try {
      const pendingClaims = await storage.getPendingClaims();
      
      // Check if we have a valid array response
      if (!pendingClaims || !Array.isArray(pendingClaims)) {
        console.log("No pending claims found or invalid response format, returning empty array");
        return res.json([]);
      }
      
      res.json(pendingClaims);
    } catch (error) {
      console.error("Error fetching pending claims:", error);
      // Return empty array instead of error to prevent app from breaking
      res.json([]);
    }
  });

  app.get("/api/users/:userId/claims", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const uid = req.headers['x-user-uid'] as string;
      const user = await storage.getUserByUid(uid);
      
      if (!user || (user.id !== userId && !user.isAdmin)) {
        return res.status(403).json({ message: "Forbidden: Not authorized to view these claims" });
      }
      
      try {
        const claims = await storage.getUserClaims(userId);
        
        // Verify we have a valid array response
        if (!claims || !Array.isArray(claims)) {
          console.log(`No claims found or invalid response format for user ${userId}, returning empty array`);
          return res.json([]);
        }
        
        res.json(claims);
      } catch (claimsError) {
        console.error("Error fetching user claims data:", claimsError);
        // Return empty array instead of error to prevent app from breaking
        res.json([]);
      }
    } catch (error) {
      console.error("Error in user claims endpoint:", error);
      // Return empty array instead of error to prevent app from breaking
      res.json([]);
    }
  });

  app.post("/api/claims", isAuthenticated, async (req, res) => {
    try {
      const validationResult = insertClaimSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid claim data", errors: validationResult.error.errors });
      }

      const claimData = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUser(claimData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if reward exists
      const reward = await storage.getReward(claimData.rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if user has already claimed this reward
      const existingClaim = await storage.getClaimByUserAndReward(claimData.userId, claimData.rewardId);
      if (existingClaim) {
        return res.status(409).json({ message: "You have already claimed this reward" });
      }
      
      // Set initial status to pending
      claimData.status = claimData.status || 'pending';
      
      const claim = await storage.createClaim(claimData);
      
      // Update the draw to mark the reward as claimed
      const draw = await storage.getDrawByWeek(reward.week);
      if (draw) {
        await storage.updateDraw(draw.id, { claimed: true });
      }
      
      res.status(201).json(claim);
    } catch (error) {
      console.error("Error creating claim:", error);
      res.status(500).json({ message: "Failed to create claim" });
    }
  });

  app.patch("/api/claims/:id", isAdmin, async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      if (isNaN(claimId)) {
        return res.status(400).json({ message: "Invalid claim ID" });
      }
      
      const claim = await storage.getClaim(claimId);
      if (!claim) {
        return res.status(404).json({ message: "Claim not found" });
      }
      
      const updatedClaim = await storage.updateClaim(claimId, req.body);
      res.json(updatedClaim);
    } catch (error) {
      console.error("Error updating claim:", error);
      res.status(500).json({ message: "Failed to update claim" });
    }
  });

  return httpServer;
}
