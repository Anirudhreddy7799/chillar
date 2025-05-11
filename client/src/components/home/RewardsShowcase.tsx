import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';

interface Reward {
  id: number;
  prizeName: string;
  prizeValue: number;
  prizeType: string;
  sponsor: string;
  week: string;
  imageUrl: string;
}

const RewardsShowcase = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await apiRequest('GET', '/api/rewards/upcoming', undefined);
        const data = await response.json();
        setRewards(data.slice(0, 3)); // Show only the first 3 rewards
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError("Failed to load rewards. Please try again later.");
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Fallback data in case API is not available yet
  const fallbackRewards = [
    {
      id: 1,
      prizeName: "Amazon Gift Card",
      prizeValue: 500,
      prizeType: "voucher",
      sponsor: "Amazon",
      week: "2023-29",
      imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      prizeName: "Mobile Recharge",
      prizeValue: 199,
      prizeType: "recharge",
      sponsor: "Airtel",
      week: "2023-30",
      imageUrl: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      prizeName: "Movie Tickets",
      prizeValue: 300,
      prizeType: "voucher",
      sponsor: "BookMyShow",
      week: "2023-31",
      imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1450&q=80"
    }
  ];

  const displayRewards = rewards.length > 0 ? rewards : fallbackRewards;

  return (
    <section id="rewards" className="py-12 md:py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Weekly Rewards</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">New exciting rewards every week - here's a preview of what you could win!</p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="bg-card rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <CardContent className="p-5">
                  <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-error">{error}</p>
            </div>
          ) : (
            displayRewards.map((reward) => (
              <Card key={reward.id} className="bg-card rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <img 
                  src={reward.imageUrl} 
                  alt={reward.prizeName} 
                  className="w-full h-48 object-cover" 
                />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-white">{reward.prizeName}</h3>
                    <span className="text-accent font-bold">{formatCurrency(reward.prizeValue)}</span>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {reward.prizeType === 'voucher' 
                      ? `Use it on ${reward.sponsor}!` 
                      : reward.prizeType === 'recharge'
                      ? 'Recharge any mobile number with a premium plan!'
                      : 'Exciting reward waiting for you!'}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Next draw: Coming soon
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/rewards" className="inline-flex items-center text-secondary hover:text-secondary-light transition">
            View all upcoming rewards
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RewardsShowcase;
