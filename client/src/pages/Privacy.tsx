import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';
import { CONFIG } from '@/config';

const Privacy = () => {
  useEffect(() => {
    document.title = `Privacy Policy | ${CONFIG.APP_NAME}`;
  }, []);

  return (
    <LegalPage title="Privacy Policy" lastUpdated="May 10, 2025">
      <h2>1. Introduction</h2>
      <p>
        Chillar Club ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subscription-based reward platform.
      </p>
      <p>
        We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
      </p>

      <h2>2. Information We Collect</h2>
      
      <h3>2.1 Personal Information</h3>
      <p>
        We may collect personal information that you voluntarily provide to us when you register for our platform, express interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect may include:
      </p>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Date of birth</li>
        <li>Location/address</li>
        <li>Payment information</li>
        <li>Profile picture (optional)</li>
      </ul>

      <h3>2.2 Derivative Information</h3>
      <p>
        When you use our platform, we automatically collect certain information about your device and usage, including:
      </p>
      <ul>
        <li>IP address</li>
        <li>Browser type</li>
        <li>Operating system</li>
        <li>Access times</li>
        <li>Pages viewed</li>
        <li>Referring website addresses</li>
        <li>Other technical information</li>
      </ul>

      <h3>2.3 Financial Information</h3>
      <p>
        We collect financial information (such as payment method details) when you subscribe to our service. This information is stored by our payment processor (Razorpay), and we only retain limited information such as subscription status and history.
      </p>

      <h2>3. How We Use Your Information</h2>
      <p>
        We may use the information we collect for various purposes, including to:
      </p>
      <ul>
        <li>Create and manage your account</li>
        <li>Process subscription payments</li>
        <li>Provide and maintain our service</li>
        <li>Notify you about changes to our service</li>
        <li>Enable participation in our reward draws</li>
        <li>Send you reward notifications and delivery</li>
        <li>Respond to your inquiries and provide customer support</li>
        <li>Process referrals and associated rewards</li>
        <li>Send you marketing and promotional communications (with opt-out options)</li>
        <li>Analyze usage patterns and improve our service</li>
        <li>Prevent fraudulent activities and enforce our terms</li>
      </ul>

      <h2>4. Disclosure of Your Information</h2>
      <p>
        We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
      </p>

      <h3>4.1 By Law or to Protect Rights</h3>
      <p>
        We may disclose your information when we believe disclosure is appropriate to comply with the law, enforce our site policies, or protect our or others' rights, property, or safety.
      </p>

      <h3>4.2 Third-Party Service Providers</h3>
      <p>
        We may share your information with third-party service providers who perform services on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
      </p>

      <h3>4.3 Marketing Communications</h3>
      <p>
        With your consent, we may share your information with third parties for marketing purposes.
      </p>

      <h3>4.4 Business Transfers</h3>
      <p>
        If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
      </p>

      <h2>5. Security of Your Information</h2>
      <p>
        We use administrative, technical, and physical security measures to protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.
      </p>
      <p>
        Your password is an important part of our security system, and it is your responsibility to protect it. We recommend using a unique password for your Chillar Club account that is not used for other online accounts.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy unless a longer retention period is required or permitted by law.
      </p>

      <h2>7. Your Privacy Rights</h2>
      <p>
        You have the right to:
      </p>
      <ul>
        <li>Access, update, or delete the information we have on you</li>
        <li>Object to our processing of your information</li>
        <li>Request that we limit the processing of your information</li>
        <li>Request a copy of your information</li>
        <li>Opt-out of marketing communications</li>
      </ul>
      <p>
        To exercise these rights, please contact us using the information provided in Section 11.
      </p>

      <h2>8. Third-Party Websites</h2>
      <p>
        Our platform may contain links to third-party websites and applications of interest. Once you leave our platform, we cannot be responsible for the protection and privacy of any information you provide to these external sites. You should exercise caution and look at the privacy statement applicable to the website in question.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        Our platform is not intended for individuals under the age of 18. We do not knowingly collect data from or market to children under 18 years of age. If we learn that personal information from users less than 18 years of age has been collected, we will take reasonable measures to delete such data from our records.
      </p>

      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>11. Contact Information</h2>
      <p>
        If you have questions or concerns about this Privacy Policy, please contact us at:
      </p>
      <p>
        Email: {CONFIG.SUPPORT_EMAIL}<br />
        Chillar Club<br />
        Mumbai, India
      </p>
    </LegalPage>
  );
};

export default Privacy;