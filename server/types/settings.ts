// Types for settings
export interface DrawSettings {
  isAutoDrawEnabled: boolean;
  drawDayOfWeek: number; // 0-6 for Sunday-Saturday
  drawHour: number; // 0-23 for 24-hour format
  notificationDaysBefore: number;
  notificationEmail: string;
  backupDrawEnabled: boolean;
  maxDrawAttempts: number;
}

export interface AppSettings {
  appName: string;
  supportEmail: string;
  adminEmails: string;
  baseUrl: string;
  testModeEnabled: boolean;
  subscriptionPrice: number;
}

export interface PaymentSettings {
  razorpayKeyId?: string;
  razorpaySecret?: string;
  razorpayPlanId?: string;
  razorpayWebhookSecret?: string;
  testModeEnabled?: boolean;
  // Add any other payment-related settings here
}
