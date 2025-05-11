import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';
import { CONFIG } from '@/config';

const Refund = () => {
  useEffect(() => {
    document.title = `Refund Policy | ${CONFIG.APP_NAME}`;
  }, []);

  return (
    <LegalPage title="Refund Policy" lastUpdated="May 10, 2025">
      <h2>1. Introduction</h2>
      <p>
        This Refund Policy explains how Chillar Club ("we," "our," or "us") handles refunds for our subscription-based reward platform. By subscribing to our service, you acknowledge that you have read, understood, and agree to be bound by this Refund Policy.
      </p>

      <h2>2. Subscription Fees</h2>
      <p>
        Chillar Club offers subscription plans that allow members to participate in weekly digital reward draws. Our subscription plans include:
      </p>
      <ul>
        <li>Monthly Plan: ₹30 per month (approximately ₹1 per day)</li>
        <li>Annual Plan: ₹365 per year (approximately ₹1 per day)</li>
      </ul>
      <p>
        All subscription fees are charged in advance for the selected billing cycle. The fees are processed securely through our payment processor, Razorpay.
      </p>

      <h2>3. Refund Eligibility</h2>
      
      <h3>3.1 Cooling-Off Period</h3>
      <p>
        We offer a 7-day cooling-off period from the date of your initial subscription. If you are not satisfied with our service and request a refund within 7 days of your initial subscription payment, we will issue a full refund of your subscription fee.
      </p>
      
      <h3>3.2 Technical Issues</h3>
      <p>
        If you experience significant technical issues that prevent you from accessing or using our platform, and our support team is unable to resolve these issues within a reasonable time frame, you may be eligible for a partial or full refund at our discretion.
      </p>
      
      <h3>3.3 Duplicate Charges</h3>
      <p>
        If you have been charged multiple times for the same subscription period due to a technical error, we will refund the duplicate charges promptly upon verification.
      </p>

      <h2>4. Non-Refundable Circumstances</h2>
      <p>
        The following circumstances are generally not eligible for refunds:
      </p>
      <ul>
        <li>Requests made after the 7-day cooling-off period</li>
        <li>Subscription cancellations after participating in one or more reward draws</li>
        <li>Dissatisfaction with draw results or not winning rewards</li>
        <li>Accidental subscriptions or failure to cancel a subscription before automatic renewal</li>
        <li>Changes in personal circumstances or financial situation</li>
        <li>Violations of our Terms & Conditions leading to account termination</li>
      </ul>

      <h2>5. Prorated Refunds</h2>
      <p>
        We do not offer prorated refunds for partially used subscription periods. When you cancel your subscription, you will continue to have access to our platform until the end of your current billing cycle, after which your subscription will not renew.
      </p>

      <h2>6. How to Request a Refund</h2>
      <p>
        To request a refund, please follow these steps:
      </p>
      <ol>
        <li>Send an email to {CONFIG.SUPPORT_EMAIL} with the subject line "Refund Request"</li>
        <li>Include your full name, email address associated with your account, and subscription details</li>
        <li>Provide a clear explanation of why you are requesting a refund</li>
        <li>Include any relevant information or documentation supporting your refund request</li>
      </ol>

      <h2>7. Refund Processing</h2>
      <p>
        Once we receive your refund request, we will:
      </p>
      <ol>
        <li>Review your request within 2-3 business days</li>
        <li>Verify your account details and payment history</li>
        <li>Determine if your request meets our refund eligibility criteria</li>
        <li>Notify you of our decision via email</li>
      </ol>
      <p>
        If your refund request is approved, the refund will be processed through the original payment method used for the subscription. Refunds typically take 5-10 business days to appear in your account, depending on your payment provider's policies.
      </p>

      <h2>8. Cancellation vs. Refund</h2>
      <p>
        Cancelling your subscription is different from requesting a refund:
      </p>
      <ul>
        <li>Cancellation: Stops future automatic renewals but allows you to continue using the service until the end of your current billing cycle</li>
        <li>Refund: Returns some or all of the money you have paid, subject to this Refund Policy</li>
      </ul>
      <p>
        To cancel your subscription without requesting a refund, you can do so at any time through your account settings on our platform.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We reserve the right to modify this Refund Policy at any time. Changes will become effective immediately upon posting the updated policy on our website. Your continued use of our service after any changes indicates your acceptance of the modified Refund Policy.
      </p>

      <h2>10. Contact Information</h2>
      <p>
        If you have any questions or concerns about this Refund Policy or our service, please contact our customer support team:
      </p>
      <p>
        Email: {CONFIG.SUPPORT_EMAIL}<br />
        Chillar Club<br />
        Mumbai, India
      </p>
    </LegalPage>
  );
};

export default Refund;