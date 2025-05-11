import { useState } from 'react';
import Layout from '@/components/Layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openCategory, setOpenCategory] = useState<string>('general');
  
  const breadcrumbItems = [
    {
      href: "/faq",
      label: "FAQ",
      current: true,
    },
  ];

  const faqCategories = [
    {
      id: 'general',
      title: 'General Information',
      faqs: [
        {
          question: 'What is Chillar Club?',
          answer: 'Chillar Club is a subscription-based rewards platform that offers its members the chance to win exciting rewards every week. For a small monthly fee, members get access to weekly draws for various prizes ranging from mobile recharges to gadgets and vouchers.'
        },
        {
          question: 'How much does the membership cost?',
          answer: 'Chillar Club membership costs ₹199 per month. You can pay using various payment methods including UPI, credit/debit cards, and net banking.'
        },
        {
          question: 'Is Chillar Club available across India?',
          answer: 'Yes, Chillar Club is available to residents across all states and union territories in India who are 18 years or older.'
        },
        {
          question: 'Can I gift a Chillar Club membership to someone?',
          answer: 'Currently, we don\'t offer gift memberships, but we\'re working on adding this feature soon!'
        },
      ]
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      faqs: [
        {
          question: 'How do I cancel my subscription?',
          answer: 'You can cancel your subscription at any time from your profile page. Navigate to the "Subscription" tab and click on "Cancel Subscription". Your membership benefits will continue until the end of your current billing period.'
        },
        {
          question: 'Will I get a refund if I cancel my subscription?',
          answer: 'We don\'t offer refunds for partial months, but your subscription benefits will continue until the end of your current billing period even after cancellation.'
        },
        {
          question: 'How do I update my payment method?',
          answer: 'You can update your payment method from your profile page under the "Subscription" tab. Click on "Update Payment Method" to add a new card or select a different payment option.'
        },
        {
          question: 'What happens if my payment fails?',
          answer: 'If your payment fails, we\'ll attempt to charge your account again in 24 hours. If payment continues to fail, your subscription will be paused until a successful payment is made. We\'ll send you email notifications about payment issues.'
        },
      ]
    },
    {
      id: 'rewards',
      title: 'Rewards & Draws',
      faqs: [
        {
          question: 'How often are the reward draws conducted?',
          answer: 'Reward draws are conducted weekly. Results are announced every Sunday at 8 PM IST.'
        },
        {
          question: 'What types of rewards can I win?',
          answer: 'Rewards range from mobile recharges, e-commerce vouchers (Amazon, Flipkart, etc.), food vouchers (Swiggy, Zomato), movie tickets, gadgets, and more! The reward type changes every week.'
        },
        {
          question: 'How will I know if I\'ve won?',
          answer: 'Winners are announced on our website and mobile app. You\'ll also receive an email notification if you win. You can check past winners on the Winners page.'
        },
        {
          question: 'How do I claim my reward?',
          answer: 'If you win, you\'ll receive instructions via email on how to claim your reward. Most rewards are digital and will be sent directly to your registered email address or mobile number. For physical rewards, we\'ll collect your shipping information.'
        },
        {
          question: 'Is there a time limit to claim rewards?',
          answer: 'Yes, rewards must be claimed within 7 days of the announcement. Unclaimed rewards may be forfeited or added to future draws.'
        },
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      faqs: [
        {
          question: 'How do I update my profile information?',
          answer: 'You can update your profile information by going to the Profile page and editing your details. Make sure to keep your contact information current to receive important notifications about rewards.'
        },
        {
          question: 'Can I change my email address?',
          answer: 'Yes, you can change your email address from your Profile page. For security reasons, you\'ll need to verify your new email address before the change takes effect.'
        },
        {
          question: 'What happens if I forget my password?',
          answer: 'You can reset your password using the "Forgot Password" link on the login page. We\'ll send you instructions to reset your password to your registered email address.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'To delete your account, please contact our support team through the "Contact Support" button at the bottom of this page. Note that account deletion is permanent and will cancel any active subscriptions.'
        },
      ]
    },
    {
      id: 'referrals',
      title: 'Referrals & Rewards',
      faqs: [
        {
          question: 'Does Chillar Club have a referral program?',
          answer: 'Yes! You can refer friends and family to join Chillar Club. When they sign up using your referral code, both of you get an additional entry in the next draw, increasing your chances of winning!'
        },
        {
          question: 'Where can I find my referral code?',
          answer: 'Your unique referral code is available on your Dashboard. You can copy it or share directly via WhatsApp, Email, or other social media platforms.'
        },
        {
          question: 'Is there a limit to how many people I can refer?',
          answer: 'There\'s no limit to the number of people you can refer, but you can only earn one additional entry per draw cycle regardless of how many people you refer in that period.'
        },
        {
          question: 'Do my referrals expire?',
          answer: 'No, your referral benefits don\'t expire as long as both you and the person you referred maintain active subscriptions.'
        },
      ]
    },
  ];

  return (
    <Layout>
      <div className="container py-8 max-w-4xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        <div className="flex items-center mb-8">
          <HelpCircle className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Find answers to common questions about Chillar Club. If you need additional help, feel free to contact our support team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {faqCategories.map((category) => (
            <Button 
              key={category.id}
              variant={openCategory === category.id ? "default" : "outline"}
              className="justify-start px-4 py-6 h-auto text-left"
              onClick={() => setOpenCategory(category.id)}
            >
              <span className="font-medium">{category.title}</span>
            </Button>
          ))}
        </div>
        
        <div className="mb-12">
          {faqCategories.map((category) => (
            <div key={category.id} className={`${openCategory === category.id ? 'block' : 'hidden'}`}>
              <h2 className="text-2xl font-semibold mb-6">{category.title}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        
        <Card className="bg-muted/30 border-dashed mb-8">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground">Our support team is here to help you with any other questions you might have.</p>
            </div>
            <a 
              href="mailto:support@chillarclub.in" 
              className="inline-flex items-center"
            >
              <Button className="gap-2">
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FAQ;