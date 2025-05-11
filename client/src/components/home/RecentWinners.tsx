import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import WinnerCard from '@/components/rewards/WinnerCard';

interface Winner {
  id: number;
  week: string;
  winner: {
    email: string;
  };
  reward: {
    prizeName: string;
    prizeValue: number;
    imageUrl: string;
  };
  timestamp: string;
}

const RecentWinners = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await apiRequest('GET', '/api/draws/winners', undefined);
        const data = await response.json();
        setWinners(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching winners:", err);
        setError("Failed to load winners. Please try again later.");
        setLoading(false);
      }
    };

    fetchWinners();
  }, []);

  // Fallback data for when API isn't available
  const fallbackWinners = [
    {
      id: 1,
      week: "2023-26",
      winner: { email: "s****@gmail.com" },
      reward: { 
        prizeName: "₹500 Amazon Voucher", 
        prizeValue: 500,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
      },
      timestamp: "2023-07-02"
    },
    {
      id: 2,
      week: "2023-25",
      winner: { email: "r****@outlook.com" },
      reward: { 
        prizeName: "₹199 Mobile Recharge", 
        prizeValue: 199,
        imageUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1073&q=80"
      },
      timestamp: "2023-06-25"
    },
    {
      id: 3,
      week: "2023-24",
      winner: { email: "p****@yahoo.com" },
      reward: { 
        prizeName: "₹300 Movie Tickets", 
        prizeValue: 300,
        imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1459&q=80"
      },
      timestamp: "2023-06-18"
    },
    {
      id: 4,
      week: "2023-23",
      winner: { email: "a****@gmail.com" },
      reward: { 
        prizeName: "₹250 Food Delivery", 
        prizeValue: 250,
        imageUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      },
      timestamp: "2023-06-11"
    }
  ];

  const displayWinners = winners.length > 0 ? winners : fallbackWinners;

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340; // Approximate width of each card + gap
      const currentScroll = carouselRef.current.scrollLeft;
      
      carouselRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="winners" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Recent Winners</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-300">Meet the lucky Chillar Club members who recently won rewards!</p>
        </div>
        
        <div className="mt-12 relative">
          <div className="overflow-hidden px-2">
            {loading ? (
              <div className="flex space-x-6">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="flex-none w-80 bg-card rounded-lg overflow-hidden shadow-lg p-5">
                    <div className="h-12 bg-muted animate-pulse rounded mb-4" />
                    <div className="h-20 bg-muted animate-pulse rounded mb-3" />
                    <div className="h-32 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-error">{error}</p>
              </div>
            ) : (
              <div ref={carouselRef} className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
                {displayWinners.map((winner) => (
                  <WinnerCard
                    key={winner.id}
                    email={winner.winner.email}
                    location="India"
                    rewardName={winner.reward.prizeName}
                    rewardValue={winner.reward.prizeValue}
                    date={new Date(winner.timestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    imageUrl={winner.reward.imageUrl}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Carousel navigation controls */}
          <button 
            className="absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center focus:outline-none hidden md:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="text-white" />
          </button>
          <button 
            className="absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center focus:outline-none hidden md:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentWinners;
