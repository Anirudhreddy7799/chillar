import { useEffect } from 'react';
import LegalPage from '@/components/LegalPage';
import { CONFIG } from '@/config';

const Legal = () => {
  useEffect(() => {
    document.title = `Legal Disclaimer | ${CONFIG.APP_NAME}`;
  }, []);

  return (
    <LegalPage title="Legal Disclaimer" lastUpdated="May 10, 2025">
      <h2>1. General Information</h2>
      <p>
        This Legal Disclaimer ("Disclaimer") applies to the Chillar Club platform, including all services, content, and functions available through our website and applications (collectively referred to as the "Platform"). By accessing or using our Platform, you acknowledge that you have read, understood, and agree to be bound by this Disclaimer.
      </p>

      <h2>2. Not a Gambling Service</h2>
      <p>
        Chillar Club is a subscription-based reward platform. Our service operates as follows:
      </p>
      <ul>
        <li>Users pay a fixed subscription fee (₹1 per day)</li>
        <li>All active subscribers are automatically entered into weekly draws</li>
        <li>Winners are randomly selected to receive digital rewards</li>
        <li>No additional purchase or payment is required to participate in draws beyond the subscription fee</li>
      </ul>
      <p>
        Our platform is <strong>not a gambling service</strong> for the following reasons:
      </p>
      <ul>
        <li>Subscribers pay a fixed fee regardless of outcome</li>
        <li>There is no possibility of winning money or monetary equivalents</li>
        <li>All rewards are digital items with no cash value</li>
        <li>Subscribers receive ongoing platform access and features in exchange for their subscription, regardless of whether they win rewards</li>
      </ul>

      <h2>3. Age Restrictions and Compliance</h2>
      <p>
        Chillar Club is intended for use by individuals who are at least 18 years of age. By using our Platform, you represent and warrant that you are at least 18 years old. We comply with all applicable laws and regulations regarding age restrictions for subscription services in India.
      </p>

      <h2>4. No Guarantee of Rewards</h2>
      <p>
        While we conduct regular draws to distribute rewards to our subscribers, we do not guarantee that any particular subscriber will win a reward. The chance of winning depends on the number of active subscribers at the time of each draw. Winners are selected through a fair and random process, but individual results may vary.
      </p>

      <h2>5. External Links and Third-Party Content</h2>
      <p>
        Our Platform may contain links to third-party websites, applications, or content that are not owned or controlled by Chillar Club. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and privacy policy of any third-party website you visit through links on our Platform.
      </p>

      <h2>6. Accuracy of Information</h2>
      <p>
        We strive to provide accurate and up-to-date information on our Platform. However, we make no warranties or representations about the accuracy, reliability, completeness, or timeliness of the content provided. Any reliance you place on such information is strictly at your own risk.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, Chillar Club and its directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
      </p>
      <ul>
        <li>Your access to or use of or inability to access or use the Platform</li>
        <li>Any conduct or content of any third party on the Platform</li>
        <li>Any content obtained from the Platform</li>
        <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        <li>Technical failures or interruptions in service</li>
        <li>Errors, inaccuracies, or omissions in content or information provided</li>
      </ul>
      <p>
        In no event shall our total liability to you for all claims exceed the amount you have paid to us during the preceding 12 months.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Chillar Club and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:
      </p>
      <ul>
        <li>Your use of and access to the Platform</li>
        <li>Your violation of any term of our Terms & Conditions or this Disclaimer</li>
        <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
        <li>Any claim that your actions caused damage to a third party</li>
      </ul>

      <h2>9. Changes to This Disclaimer</h2>
      <p>
        We reserve the right to modify or replace this Disclaimer at any time at our sole discretion. If we make material changes to this Disclaimer, we will notify you by posting the new Disclaimer on our Platform and updating the "Last Updated" date. Your continued use of the Platform after any such changes constitutes your acceptance of the new Disclaimer.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        This Disclaimer shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising from or relating to this Disclaimer shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
      </p>

      <h2>11. Severability</h2>
      <p>
        If any provision of this Disclaimer is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
      </p>

      <h2>12. Contact Information</h2>
      <p>
        If you have any questions about this Legal Disclaimer, please contact us at:
      </p>
      <p>
        Email: {CONFIG.SUPPORT_EMAIL}<br />
        Chillar Club<br />
        Mumbai, India
      </p>
    </LegalPage>
  );
};

export default Legal;