import { Card, CardContent } from "@/components/ui/card";
import { PersonStanding, Calendar, Gift } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: 'Subscribe',
      description: 'Join Chillar Club for just ₹30/month (₹1/day) and become a member to access weekly rewards.',
      icon: <PersonStanding className="h-6 w-6 text-white" />,
    },
    {
      title: 'Automatic Entry',
      description: 'Once subscribed, you\'re automatically entered into all weekly reward draws - no further action needed!',
      icon: <Calendar className="h-6 w-6 text-white" />,
    },
    {
      title: 'Claim Rewards',
      description: 'You\'ll be notified immediately if you win, then simply claim your reward through the dashboard.',
      icon: <Gift className="h-6 w-6 text-white" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">How Chillar Club Works</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">It's as simple as subscribe and win - no hidden conditions!</p>
        </div>
        
        <div className="mt-12 md:mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="bg-card rounded-xl p-6 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
