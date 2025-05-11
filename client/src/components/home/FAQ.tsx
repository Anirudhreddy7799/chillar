import { useState } from 'react';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openItem, setOpenItem] = useState<number>(0);

  const faqItems: FAQItem[] = [
    {
      question: 'How much does it cost to join Chillar Club?',
      answer: 'Chillar Club membership costs just ₹30 per month, which is only ₹1 per day. This fee gives you automatic entry into all weekly reward draws during your subscription period.'
    },
    {
      question: 'How are winners selected?',
      answer: 'Winners are randomly selected from all active subscribers using our secure selection algorithm. The selection process is automated and runs every week on a fixed schedule. Every active member has an equal chance of winning.'
    },
    {
      question: 'How do I claim my reward if I win?',
      answer: 'If you\'re selected as a winner, you\'ll receive an immediate email notification. Simply log into your Chillar Club account, go to the "Claim" section, and follow the instructions to receive your reward. Most rewards are fulfilled digitally within 24-48 hours.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time through your account settings. Your membership will remain active until the end of your current billing period, during which you\'ll still be eligible for all draws.'
    },
    {
      question: 'What types of rewards can I win?',
      answer: 'Rewards vary each week but typically include popular digital vouchers (Amazon, Flipkart), mobile recharges, OTT subscriptions, movie tickets, food delivery credits, and more. The weekly reward calendar shows upcoming prizes.'
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-12 md:py-20 bg-muted">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Frequently Asked Questions</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">Everything you need to know about Chillar Club</p>
        </div>
        
        <div className="mt-12 space-y-6">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-card rounded-lg p-6 transition-all duration-200"
            >
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-xl font-semibold text-white">{item.question}</h3>
                <button className="text-muted-foreground focus:outline-none">
                  {openItem === index ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className={`mt-3 text-muted-foreground transition-all duration-300 ${openItem === index ? 'block' : 'hidden'}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/faq" className="inline-flex items-center text-secondary hover:text-secondary-light transition">
            View all FAQs
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
