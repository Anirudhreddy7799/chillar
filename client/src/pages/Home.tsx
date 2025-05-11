import { useEffect } from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import RewardsShowcase from '@/components/home/RewardsShowcase';
import RecentWinners from '@/components/home/RecentWinners';
import FAQ from '@/components/home/FAQ';
import CTASection from '@/components/home/CTASection';
import { CONFIG } from '@/config';

const Home = () => {
  // Update document title and meta description for SEO
  useEffect(() => {
    document.title = `${CONFIG.APP_NAME} - ₹1/day = Weekly Surprise Rewards`;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 
      `Subscribe to ${CONFIG.APP_NAME} for just ₹30/month and automatically enter weekly draws to win exciting rewards - no games, no tasks, just rewards!`
    );
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${CONFIG.APP_NAME} - ₹1/day = Weekly Surprise Rewards`);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', 
      `Subscribe to ${CONFIG.APP_NAME} for just ₹30/month and automatically enter weekly draws to win exciting rewards - no games, no tasks, just rewards!`
    );
  }, []);

  return (
    <Layout>
      <div id="home-page">
        <HeroSection />
        <HowItWorks />
        <RewardsShowcase />
        <RecentWinners />
        <FAQ />
        <CTASection />
      </div>
    </Layout>
  );
};

export default Home;
