import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Shield, Headset } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl relative">
          {/* Background overlay with neon gradient */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          <div className="relative z-10 py-12 px-6 md:px-16 lg:px-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to start winning weekly rewards?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
              Join Chillar Club today for just ₹30/month and get automatic entries into all our weekly draws - no effort required!
            </p>
            
            <div className="mt-8 sm:flex sm:justify-center">
              <div className="rounded-lg shadow">
                <Link href="/join?mode=register">
                  <Button
                    size="lg"
                    className="w-full flex items-center justify-center px-8 py-3 gradient-bg rounded-lg text-white font-medium text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 neon-glow"
                  >
                    <span>Join Chillar Club</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link href="/join?mode=login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full flex items-center justify-center px-8 py-3 rounded-lg text-white font-medium text-lg"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-muted-foreground/80 flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                Terms & Conditions
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-muted-foreground/80 flex items-center">
                <Shield className="mr-1 h-4 w-4" />
                Privacy Policy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-muted-foreground/80 flex items-center">
                <Headset className="mr-1 h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
