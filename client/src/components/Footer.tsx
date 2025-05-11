import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Mail, HelpCircle } from 'lucide-react';
import { CONFIG } from '@/config';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold gradient-text">{CONFIG.APP_NAME}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The easiest way to win digital rewards for just ₹1 per day. Subscribe once, win weekly!
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com/chillarclub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/chillarclub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/chillarclub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-white transition">Home</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-white transition">Dashboard</Link></li>
              <li><Link href="/rewards" className="text-muted-foreground hover:text-white transition">Rewards</Link></li>
              <li><Link href="/winners" className="text-muted-foreground hover:text-white transition">Winners</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li><Link href="/terms" className="text-muted-foreground hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-muted-foreground hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/legal" className="text-muted-foreground hover:text-white transition">Legal Disclaimer</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-white">Contact</h4>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <a href={`mailto:${CONFIG.SUPPORT_EMAIL}`} className="text-muted-foreground hover:text-white transition">
                  {CONFIG.SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center text-muted-foreground">
                <HelpCircle className="mr-2 h-4 w-4" />
                <Link href="/faq" className="text-muted-foreground hover:text-white transition">Help Center</Link>
              </li>
            </ul>
            <div className="mt-4">
              <a href={`mailto:${CONFIG.SUPPORT_EMAIL}`}>
                <button className="px-4 py-2 bg-background rounded-lg text-white text-sm border border-border hover:bg-muted transition">
                  Contact Support
                </button>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between text-sm">
          <p className="text-muted-foreground">© {new Date().getFullYear()} {CONFIG.APP_NAME}. All rights reserved.</p>
          <p className="mt-2 md:mt-0 text-muted-foreground">Payments secured by <span className="text-white">Razorpay</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
