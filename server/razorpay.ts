import Razorpay from "razorpay";
import { storage } from "./storage";
import { log } from "./vite";
import env from "./env";
import { calculateSubscriptionEndDate } from "./utils/dates";

// Use the environment utility to determine if we're in development mode
const isDevelopment = env.isDev();
const useDevPayments = env.useDevPayments();

// Get Razorpay keys from environment
const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || "";

// Use development mode if Razorpay keys are missing
const shouldUseMockRazorpay =
  useDevPayments || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

// Mock Razorpay implementation for development
class MockRazorpay {
  customers = {
    create: async (data: any) => {
      log(`[MOCK] Creating customer: ${JSON.stringify(data)}`, "razorpay");
      return {
        id: "mock_cust_" + Date.now(),
        name: data.name,
        email: data.email,
        contact: data.contact,
      };
    },
    fetch: async (id: string) => {
      log(`[MOCK] Fetching customer: ${id}`, "razorpay");
      return {
        id,
        name: "Mock Customer",
        email: "mock@example.com",
        contact: "1234567890",
      };
    },
    all: async () => {
      log(`[MOCK] Listing all customers`, "razorpay");
      return {
        items: [],
      };
    },
  };

  orders = {
    create: async (data: any) => {
      log(`[MOCK] Creating order: ${JSON.stringify(data)}`, "razorpay");
      return {
        id: "mock_order_" + Date.now(),
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
      };
    },
  };

  subscriptions = {
    create: async (data: any) => {
      log(`[MOCK] Creating subscription: ${JSON.stringify(data)}`, "razorpay");
      return {
        id: "mock_sub_" + Date.now(),
        customer_id: data.customer_id,
        plan_id: data.plan_id,
        status: "created",
      };
    },
    fetch: async (id: string) => {
      log(`[MOCK] Fetching subscription: ${id}`, "razorpay");
      return {
        id,
        status: "active",
        current_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };
    },
    cancel: async (id: string) => {
      log(`[MOCK] Cancelling subscription: ${id}`, "razorpay");
      return {
        id,
        status: "cancelled",
      };
    },
  };

  plans = {
    create: async (data: any) => {
      log(`[MOCK] Creating plan: ${JSON.stringify(data)}`, "razorpay");
      return {
        id: "mock_plan_" + Date.now(),
        item: {
          name: data.item.name,
          amount: data.item.amount,
          currency: data.item.currency,
          description: data.item.description,
        },
        period: data.period,
        interval: data.interval,
      };
    },
    all: async () => {
      log(`[MOCK] Listing all plans`, "razorpay");
      return {
        items: [],
      };
    },
  };
}

// Initialize Razorpay based on environment
// Use mock implementation in development mode or when API keys are missing
const razorpay = shouldUseMockRazorpay
  ? (new MockRazorpay() as any) // Use mock when no real API keys or in development
  : new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: "monthly",
    name: "Monthly Subscription",
    amount: 30, // ₹30 per month (approx ₹1/day)
    currency: "INR",
    interval: "monthly",
    interval_count: 1,
    description: "Chillar Club Monthly Subscription",
  },
  ANNUAL: {
    id: "annual",
    name: "Annual Subscription",
    amount: 365, // ₹365 per year (₹1/day)
    currency: "INR",
    interval: "yearly",
    interval_count: 1,
    description: "Chillar Club Annual Subscription",
    discount: 15, // Optional discount for annual plans
  },
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

export async function createSubscriptionPlan(
  plan: typeof SUBSCRIPTION_PLANS.MONTHLY
) {
  try {
    // First check if plan already exists
    const plans = await razorpay.plans.all();
    const existingPlan = plans.items.find(
      (p: any) =>
        p.interval === plan.interval &&
        p.interval_count === plan.interval_count &&
        p.item.name === plan.name
    );

    if (existingPlan) {
      log(`Plan already exists: ${existingPlan.id}`, "razorpay");
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
      },
    });

    log(`Created new plan: ${newPlan.id}`, "razorpay");
    return newPlan as RazorPayPlan;
  } catch (error) {
    log(`Error creating subscription plan: ${error}`, "razorpay");
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
    };
  };
}

// Create or get Razorpay customer for a user
async function getOrCreateCustomer(user: any): Promise<string> {
  try {
    // Check if user already has a razorpay customer ID
    const subscription = await storage.getSubscriptionByUserId(user.id);
    if (subscription?.razorpayCustomerId) {
      return subscription.razorpayCustomerId;
    }

    // Create new customer
    const customer = await razorpay.customers.create({
      name: user.name || user.email.split("@")[0],
      email: user.email,
      contact: user.phone || "",
      notes: {
        userId: user.id,
      },
    });

    const typedCustomer = customer as RazorpayCustomer;
    return typedCustomer.id;
  } catch (error) {
    log(`Error getting/creating customer: ${error}`, "razorpay");
    throw error;
  }
}

// Create a subscription for a user
export async function createSubscription(userId: string, planId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Create or get customer
    const customerId = await getOrCreateCustomer(user);

    // Create the subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 12, // Bill for 12 months
      quantity: 1,
    });

    const typedSubscription = subscription as RazorpaySubscription;
    const subscriptionId = typedSubscription.id;

    // Calculate amount and determine if it's an annual plan
    let amount = 30; // Default amount
    let isAnnualPlan = false;
    try {
      if (typedSubscription.plan_id && typedSubscription.plan_id.item) {
        const amountInPaise = typedSubscription.plan_id.item.amount;
        amount = Number(amountInPaise) / 100; // Convert paise to rupees
        isAnnualPlan = planId.toLowerCase().includes("annual") || amount >= 300;
      }
    } catch (err) {
      log(`Error parsing subscription amount: ${err}`, "razorpay");
    }

    // Set up dates using UTC and convert to ISO strings
    const currentDate = new Date();
    const subscriptionStartDate = new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        currentDate.getUTCDate(),
        currentDate.getUTCHours(),
        currentDate.getUTCMinutes(),
        currentDate.getUTCSeconds()
      )
    );

    // Calculate end date based on plan type
    const subscriptionEndDate = calculateSubscriptionEndDate(
      subscriptionStartDate,
      isAnnualPlan
    );

    // Store subscription details in our database with ISO string dates
    await storage.createSubscription({
      userId: user.id,
      razorpaySubId: subscriptionId,
      razorpayCustomerId: customerId,
      planId: planId,
      status: "created",
      startDate: subscriptionStartDate.toISOString(),
      endDate: subscriptionEndDate.toISOString(),
      amount: amount,
      currency: "INR",
      isActive: false,
      metadata: JSON.stringify(subscription),
    });

    return typedSubscription;
  } catch (error) {
    log(`Error creating subscription: ${error}`, "razorpay");
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
export async function createOrder(
  userId: string,
  planType: "MONTHLY" | "ANNUAL"
) {
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
      currency: typedOrder.currency || "INR",
      userId,
      planType,
      key: shouldUseMockRazorpay ? "mock_key_development" : RAZORPAY_KEY_ID,
      isDevelopment: shouldUseMockRazorpay,
    };
  } catch (error) {
    log(`Error creating order: ${error}`, "razorpay");
    throw error;
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    if (shouldUseMockRazorpay) {
      // In development mode or when missing credentials, always return true
      log(`[MOCK] Verifying payment signature`, "razorpay");
      return true;
    }

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret key is missing");
    }

    const generatedSignature = require("crypto")
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    log(`Error verifying payment signature: ${error}`, "razorpay");
    return false;
  }
}

// Handle subscription webhook events
export async function handleWebhookEvent(event: any) {
  // In development mode, log the event but don't process it
  if (shouldUseMockRazorpay) {
    log(`[MOCK] Received webhook event: ${JSON.stringify(event)}`, "razorpay");
    return true;
  }

  const eventType = event.event;
  const payload = event.payload.subscription || event.payload.payment;

  if (!payload) {
    log(`Invalid webhook payload`, "razorpay");
    return false;
  }

  log(`Processing webhook event: ${eventType}`, "razorpay");

  try {
    // Find the subscription in our database
    let subscription = await storage.getSubscriptionByRazorpayId(
      payload.id || payload.entity.subscription_id
    );

    if (!subscription) {
      log(
        `Subscription not found for webhook: ${payload.id || payload.entity.subscription_id}`,
        "razorpay"
      );
      return false;
    }

    const parseDate = (date: string | Date) => {
      if (date instanceof Date) {
        return date.toISOString();
      }
      return new Date(date).toISOString();
    };

    switch (eventType) {
      case "subscription.authenticated":
        // Payment was successful, activate the subscription
        const isPlanAnnualForAuth =
          subscription.planId?.toLowerCase().includes("annual") ||
          subscription.amount >= 300;

        const startDateForAuth = new Date(subscription.startDate);
        const endDateForAuth = calculateSubscriptionEndDate(
          startDateForAuth,
          isPlanAnnualForAuth
        );

        await storage.updateSubscription(subscription.id, {
          status: "active",
          isActive: true,
          endDate: endDateForAuth.toISOString(),
          metadata: JSON.stringify(payload),
        });

        await storage.updateUser(subscription.userId, {
          isSubscribed: true,
        });
        break;

      case "subscription.cancelled":
        await storage.updateSubscription(subscription.id, {
          status: "cancelled",
          isActive: false,
          metadata: JSON.stringify(payload),
        });

        await storage.updateUser(subscription.userId, {
          isSubscribed: false,
        });
        break;

      case "subscription.completed":
        await storage.updateSubscription(subscription.id, {
          status: "completed",
          isActive: false,
          metadata: JSON.stringify(payload),
        });

        await storage.updateUser(subscription.userId, {
          isSubscribed: false,
        });
        break;

      case "payment.captured":
        const isPlanAnnual =
          subscription.planId?.toLowerCase().includes("annual") ||
          subscription.amount >= 300;

        // Get the current subscription period's start date
        const currentStartDate = parseDate(subscription.startDate);

        // If this is a renewal, use the previous end date as the new start date
        const startDate = subscription.endDate
          ? parseDate(subscription.endDate)
          : currentStartDate;

        // Calculate end date using shared function
        const endDate = calculateSubscriptionEndDate(
          new Date(startDate),
          isPlanAnnual
        );

        await storage.updateSubscription(subscription.id, {
          status: "active",
          isActive: true,
          startDate: startDate,
          endDate: endDate.toISOString(),
          metadata: JSON.stringify(payload),
        });

        await storage.updateUser(subscription.userId, {
          isSubscribed: true,
        });
        break;

      case "payment.failed":
        await storage.updateSubscription(subscription.id, {
          status: "payment_failed",
          metadata: JSON.stringify(payload),
        });
        break;

      default:
        log(`Unhandled webhook event type: ${eventType}`, "razorpay");
        break;
    }

    return true;
  } catch (error) {
    log(`Error processing webhook: ${error}`, "razorpay");
    return false;
  }
}

// Export Razorpay instance for direct usage if needed
export { razorpay };
