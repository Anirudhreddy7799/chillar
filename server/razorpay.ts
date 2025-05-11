import Razorpay from 'razorpay';
import { storage } from './storage';
import { log } from './vite';
import env from './env';

// Use the environment utility to determine if we're in development mode
// and to get the Razorpay API keys with proper fallbacks
const isDevelopment = env.isDev();
const useDevPayments = env.useDevPayments();

// Get Razorpay keys from environment with fallbacks for development
const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || (useDevPayments ? 'rzp_test_development_mode' : '');
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || (useDevPayments ? 'development_mode_secret' : '');

// Mock Razorpay implementation for development
class MockRazorpay {
  customers = {
    create: async (data: any) => {
      log(`[MOCK] Creating customer: ${JSON.stringify(data)}`, 'razorpay');
      return {
        id: 'mock_cust_' + Date.now(),
        name: data.name,
        email: data.email,
        contact: data.contact
      };
    },
    fetch: async (id: string) => {
      log(`[MOCK] Fetching customer: ${id}`, 'razorpay');
      return {
        id,
        name: 'Mock Customer',
        email: 'mock@example.com',
        contact: '1234567890'
      };
    },
    all: async () => {
      log(`[MOCK] Listing all customers`, 'razorpay');
      return {
        items: []
      };
    }
  };
  
  orders = {
    create: async (data: any) => {
      log(`[MOCK] Creating order: ${JSON.stringify(data)}`, 'razorpay');
      return {
        id: 'mock_order_' + Date.now(),
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt
      };
    }
  };
  
  subscriptions = {
    create: async (data: any) => {
      log(`[MOCK] Creating subscription: ${JSON.stringify(data)}`, 'razorpay');
      return {
        id: 'mock_sub_' + Date.now(),
        customer_id: data.customer_id,
        plan_id: data.plan_id,
        status: 'created'
      };
    },
    fetch: async (id: string) => {
      log(`[MOCK] Fetching subscription: ${id}`, 'razorpay');
      return {
        id,
        status: 'active',
        current_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    cancel: async (id: string) => {
      log(`[MOCK] Cancelling subscription: ${id}`, 'razorpay');
      return {
        id,
        status: 'cancelled'
      };
    }
  };
  
  plans = {
    create: async (data: any) => {
      log(`[MOCK] Creating plan: ${JSON.stringify(data)}`, 'razorpay');
      return {
        id: 'mock_plan_' + Date.now(),
        item: {
          name: data.item.name,
          amount: data.item.amount,
          currency: data.item.currency,
          description: data.item.description
        },
        period: data.period,
        interval: data.interval
      };
    },
    all: async () => {
      log(`[MOCK] Listing all plans`, 'razorpay');
      return {
        items: []
      };
    }
  };
}

// Initialize Razorpay based on environment
// Use mock implementation in development mode or when API keys are missing
const razorpay = useDevPayments
  ? new MockRazorpay() as any // Use mock when no real API keys or in development
  : new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Subscription',
    amount: 30,  // ₹30 per month (approx ₹1/day)
    currency: 'INR',
    interval: 'monthly',
    interval_count: 1,
    description: 'Chillar Club Monthly Subscription',
  },
  ANNUAL: {
    id: 'annual',
    name: 'Annual Subscription',
    amount: 365, // ₹365 per year (₹1/day)
    currency: 'INR',
    interval: 'yearly',
    interval_count: 1,
    description: 'Chillar Club Annual Subscription',
    discount: 15, // Optional discount for annual plans
  }
};

// Create a subscription plan in Razorpay (if it doesn't exist already)
// Type definitions for Razorpay responses
interface RazorPayPlan {
  id: string;
  period: string;
  interval: number;
  item: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
  };
}

export async function createSubscriptionPlan(plan: typeof SUBSCRIPTION_PLANS.MONTHLY) {
  try {
    // First check if plan already exists
    const plans = await razorpay.plans.all();
    const existingPlan = plans.items.find((p: any) => 
      p.interval === plan.interval && 
      p.interval_count === plan.interval_count && 
      p.item.name === plan.name
    );
    
    if (existingPlan) {
      log(`Plan already exists: ${existingPlan.id}`, 'razorpay');
      return existingPlan as RazorPayPlan;
    }

    // Create a new plan
    const newPlan = await razorpay.plans.create({
      period: plan.interval as "monthly" | "yearly" | "weekly" | "daily",
      interval: plan.interval_count,
      item: {
        name: plan.name,
        description: plan.description,
        amount: plan.amount * 100, // Convert to paise
        currency: plan.currency,
      }
    });
    
    log(`Created new plan: ${newPlan.id}`, 'razorpay');
    return newPlan as RazorPayPlan;
  } catch (error) {
    log(`Error creating subscription plan: ${error}`, 'razorpay');
    throw error;
  }
}

// Type definitions for Razorpay responses
interface RazorpayCustomer {
  id: string;
  name: string;
  email: string;
  contact: string;
}

interface RazorpaySubscription {
  id: string;
  status: string;
  plan_id: {
    item: {
      amount: number;
      currency: string;
    }
  };
}

// Create a subscription for a user
export async function createSubscription(userId: number, planId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Create a customer if not exists
    let customerId = '';
    try {
      const customers = await razorpay.customers.all();
      const existingCustomer = customers.items.find((c: any) => c.email === user.email);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Extract user name and phone safely
        let userName = user.email.split('@')[0]; // Default fallback
        let userPhone = ''; // Default fallback
        
        // Safe access to profile data
        if (user.profile && typeof user.profile === 'object') {
          const profile = user.profile as Record<string, any>;
          
          if (profile.name && typeof profile.name === 'string') {
            userName = profile.name;
          }
          
          if (profile.phone && typeof profile.phone === 'string') {
            userPhone = profile.phone;
          }
        }
                        
        const userData = {
          name: userName,
          email: user.email,
          contact: userPhone,
          notes: {
            userId: user.id.toString(),
          }
        };
        
        const newCustomer = await razorpay.customers.create(userData);
        customerId = (newCustomer as RazorpayCustomer).id;
      }
    } catch (error) {
      log(`Error managing customer: ${error}`, 'razorpay');
      throw error;
    }

    // Create the subscription with type safety
    const params: any = {
      plan_id: planId,
      customer_id: customerId, // Allowing this non-standard property
      total_count: 12, // Bill for 12 cycles (modify based on plan)
      notes: {
        userId: user.id.toString(),
      }
    };
    
    const subscription = await razorpay.subscriptions.create(params);
    const typedSubscription = subscription as unknown as RazorpaySubscription;

    // Safe access to properties
    const subscriptionId = typedSubscription.id;
    const subscriptionStatus = typedSubscription.status;
    
    // Calculate amount safely
    let amount = 30; // Default amount
    try {
      if (typedSubscription.plan_id && typedSubscription.plan_id.item) {
        const amountInPaise = typedSubscription.plan_id.item.amount;
        amount = Number(amountInPaise) / 100; // Convert paise to rupees
      }
    } catch (err) {
      log(`Error parsing subscription amount: ${err}`, 'razorpay');
    }

    // Store subscription details in our database
    await storage.createSubscription({
      userId: user.id,
      razorpaySubId: subscriptionId,
      razorpayCustomerId: customerId,
      planId: planId,
      status: subscriptionStatus,
      startDate: new Date(),
      endDate: null, // This will be updated once payment is confirmed
      amount: amount,
      currency: 'INR',
      isActive: false, // Will be set to true once payment is confirmed
      metadata: JSON.stringify(subscription),
    });

    return typedSubscription;
  } catch (error) {
    log(`Error creating subscription: ${error}`, 'razorpay');
    throw error;
  }
}

// Define Order response type
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

// Create a one-time payment for a subscription
export async function createOrder(userId: number, planType: 'MONTHLY' | 'ANNUAL') {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const plan = SUBSCRIPTION_PLANS[planType];
    const amountInPaise = Math.round(plan.amount * 100); // Convert to paise and ensure it's an integer
    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: plan.currency,
      receipt: `receipt_order_${userId}_${Date.now()}`,
      notes: {
        userId: user.id.toString(),
        planType,
      },
    });
    
    const typedOrder = order as unknown as RazorpayOrder;

    return {
      orderId: typedOrder.id,
      amount: Number(typedOrder.amount) / 100, // Convert paise back to rupees for display
      currency: typedOrder.currency || 'INR',
      userId,
      planType,
      key: RAZORPAY_KEY_ID,
    };
  } catch (error) {
    log(`Error creating order: ${error}`, 'razorpay');
    throw error;
  }
}

// Verify payment signature
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  try {
    const generatedSignature = require('crypto')
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    log(`Error verifying payment signature: ${error}`, 'razorpay');
    return false;
  }
}

// Handle subscription webhook events
export async function handleWebhookEvent(event: any) {
  const eventType = event.event;
  const payload = event.payload.subscription || event.payload.payment;
  
  if (!payload) {
    log(`Invalid webhook payload`, 'razorpay');
    return false;
  }

  log(`Processing webhook event: ${eventType}`, 'razorpay');

  try {
    // Find the subscription in our database
    let subscription = await storage.getSubscriptionByRazorpayId(payload.id || payload.entity.subscription_id);
    
    if (!subscription) {
      log(`Subscription not found for webhook: ${payload.id || payload.entity.subscription_id}`, 'razorpay');
      return false;
    }

    switch (eventType) {
      case 'subscription.authenticated':
        // Payment was successful, activate the subscription
        await storage.updateSubscription(subscription.id, {
          status: 'active',
          isActive: true,
          endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now as default
          metadata: JSON.stringify(payload),
        });

        // Update user's subscription status
        await storage.updateUser(subscription.userId, {
          isSubscribed: true,
        });
        break;

      case 'subscription.cancelled':
        // Update subscription status
        await storage.updateSubscription(subscription.id, {
          status: 'cancelled',
          isActive: false,
          metadata: JSON.stringify(payload),
        });

        // Update user's subscription status
        await storage.updateUser(subscription.userId, {
          isSubscribed: false,
        });
        break;

      case 'subscription.completed':
        // Subscription completed its lifecycle
        await storage.updateSubscription(subscription.id, {
          status: 'completed',
          isActive: false,
          metadata: JSON.stringify(payload),
        });

        // Update user's subscription status
        await storage.updateUser(subscription.userId, {
          isSubscribed: false,
        });
        break;

      case 'payment.captured':
        // Payment was successful
        const paymentAmount = payload.entity.amount / 100; // Convert paise to rupees
        const isPlanAnnual = paymentAmount >= 300; // Rough check to determine if annual or monthly plan
        const daysToAdd = isPlanAnnual ? 365 : 30;

        await storage.updateSubscription(subscription.id, {
          status: 'active',
          isActive: true,
          endDate: new Date(Date.now() + (daysToAdd * 24 * 60 * 60 * 1000)),
          metadata: JSON.stringify(payload),
        });

        // Update user's subscription status
        await storage.updateUser(subscription.userId, {
          isSubscribed: true,
        });
        break;

      case 'payment.failed':
        // Payment failed, update status but don't deactivate yet
        await storage.updateSubscription(subscription.id, {
          status: 'payment_failed',
          metadata: JSON.stringify(payload),
        });
        break;

      default:
        log(`Unhandled webhook event type: ${eventType}`, 'razorpay');
        break;
    }

    return true;
  } catch (error) {
    log(`Error processing webhook: ${error}`, 'razorpay');
    return false;
  }
}

// Export Razorpay instance for direct usage if needed
export { razorpay };