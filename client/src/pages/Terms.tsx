import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';
import { CONFIG } from '@/config';

const Terms = () => {
  useEffect(() => {
    document.title = `Terms & Conditions | ${CONFIG.APP_NAME}`;
  }, []);

  return (
    <LegalPage title="Terms & Conditions" lastUpdated="May 10, 2025">
      <h2>1. Introduction</h2>
      <p>
        Welcome to Chillar Club. These Terms & Conditions govern your use of our website and services 
        (collectively referred to as the "Service"). By accessing or using our Service, you agree to be 
        bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
      </p>

      <h2>2. Definitions</h2>
      <p>
        <strong>"Service"</strong> refers to the Chillar Club subscription-based rewards platform accessible via our website and mobile applications.<br />
        <strong>"Subscription"</strong> refers to the paid service that allows users to participate in weekly reward draws.<br />
        <strong>"Reward"</strong> refers to the digital items offered to winners of our draws.<br />
        <strong>"User," "You," and "Your"</strong> refer to the person accessing or using the Service.<br />
        <strong>"Company," "We," "Us," and "Our"</strong> refer to Chillar Club.
      </p>

      <h2>3. Account Registration and Eligibility</h2>
      <p>
        To use our Service, you must register for an account and provide certain information. You must be at 
        least 18 years old to create an account. By creating an account, you represent and warrant that:
      </p>
      <ul>
        <li>You are at least 18 years of age</li>
        <li>You are a resident of India</li>
        <li>You are using your real identity</li>
        <li>You will maintain the accuracy of your account information</li>
        <li>You will keep your password confidential</li>
        <li>You will not share your account with anyone else</li>
      </ul>

      <h2>4. Subscription Terms</h2>
      <p>
        Chillar Club operates on a subscription model. By subscribing to our Service, you agree to the following terms:
      </p>
      <ul>
        <li>The subscription fee is ₹1 per day, charged monthly or annually based on your selected plan</li>
        <li>Subscription fees are non-refundable except as provided in our Refund Policy</li>
        <li>Your subscription automatically renews until you cancel it</li>
        <li>You may cancel your subscription at any time through your account settings</li>
        <li>Cancellation takes effect at the end of your current billing cycle</li>
        <li>No partial refunds are issued for the remaining days in a billing cycle after cancellation</li>
      </ul>

      <h2>5. Weekly Draws and Rewards</h2>
      <p>
        Chillar Club conducts weekly draws for current subscribers. The following terms apply to our draws:
      </p>
      <ul>
        <li>Only active subscribers are eligible to win rewards</li>
        <li>Winners are selected randomly from eligible subscribers</li>
        <li>The odds of winning depend on the number of active subscribers</li>
        <li>We reserve the right to verify your identity before distributing rewards</li>
        <li>Digital rewards will be delivered electronically to the email address associated with your account</li>
        <li>Rewards have no cash value and cannot be exchanged or transferred</li>
        <li>Unclaimed rewards expire after 30 days</li>
      </ul>

      <h2>6. Referral Program</h2>
      <p>
        Users may refer friends to join Chillar Club. The following terms apply to our referral program:
      </p>
      <ul>
        <li>Referrers receive benefits only when the referred person becomes a paid subscriber</li>
        <li>Chillar Club reserves the right to modify or terminate the referral program at any time</li>
        <li>Abuse of the referral program, including creating fake accounts, is prohibited</li>
        <li>Referral benefits may change without prior notice</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are owned by Chillar Club and are protected 
        by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, 
        create derivative works of, publicly display, publicly perform, republish, download, store, or transmit 
        any of the material on our Service without our prior written consent.
      </p>

      <h2>8. Prohibited Conduct</h2>
      <p>
        You agree not to engage in any of the following activities:
      </p>
      <ul>
        <li>Using the Service for any illegal purpose</li>
        <li>Creating multiple accounts for the same person</li>
        <li>Manipulating or attempting to manipulate the draw process</li>
        <li>Attempting to access another user's account</li>
        <li>Impersonating any person or entity</li>
        <li>Interfering with or disrupting the Service</li>
        <li>Engaging in any automated use of the system</li>
        <li>Attempting to reverse engineer any portion of the Service</li>
      </ul>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Chillar Club shall not be liable for any indirect, incidental, 
        special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from 
        your access to or use of or inability to access or use the Service. In no event shall our total liability 
        for all claims relating to the Service exceed the amount paid by you to Chillar Club during the 12 months 
        prior to such claim.
      </p>

      <h2>10. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Chillar Club, its affiliates, licensors, and service 
        providers, and its and their respective officers, directors, employees, contractors, agents, licensors, 
        suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, 
        losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to 
        your violation of these Terms or your use of the Service.
      </p>

      <h2>11. Termination</h2>
      <p>
        We may terminate or suspend your account and access to the Service immediately, without prior notice or 
        liability, for any reason, including if you breach the Terms. Upon termination, your right to use the 
        Service will immediately cease. All provisions of the Terms which by their nature should survive termination 
        shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, 
        indemnity, and limitations of liability.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right to update or change our Terms at any time. We will provide notice of any changes 
        by updating the "Last Updated" date at the top of these Terms. Your continued use of the Service after 
        any such changes constitutes your acceptance of the new Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of India, without regard to 
        its conflict of law provisions. Any dispute arising from or relating to the subject matter of these Terms 
        shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
      </p>

      <h2>14. Contact Information</h2>
      <p>
        For questions about these Terms, please contact us at {CONFIG.SUPPORT_EMAIL}.
      </p>
    </LegalPage>
  );
};

export default Terms;