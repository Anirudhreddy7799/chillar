import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-background opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block gradient-text">₹1/day =</span>
                <span className="block text-white mt-1">Weekly Surprise Rewards</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Subscribe to Chillar Club for just ₹30/month and automatically enter weekly draws to win exciting rewards - no games, no tasks, just rewards!
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/join?mode=register">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto gradient-bg px-8 py-3 rounded-lg text-white font-medium text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 neon-glow"
                  >
                    Join Now
                  </Button>
                </Link>
                <p className="mt-3 text-sm text-gray-400">
                  *No credit card required until you choose to subscribe
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full animate-float">
              <img 
                src="https://images.unsplash.com/photo-1627163439134-7a8c47e08208?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2032&q=80" 
                alt="Glowing reward box" 
                className="w-full rounded-2xl shadow-2xl neon-glow" 
              />
              <div className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                Win Weekly!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
