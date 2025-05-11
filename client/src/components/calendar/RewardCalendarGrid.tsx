import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatDate, formatWeekDateRange, getCurrentWeekString } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import RewardCard from "@/components/rewards/RewardCard";
import { Badge } from "@/components/ui/badge";

interface Reward {
  id: number;
  week: string;
  prizeName: string;
  prizeValue: number;
  prizeType: string;
  sponsor: string | null;
  imageUrl: string | null;
}

interface DrawWithWinner {
  week: string;
  winner?: {
    email: string;
  };
}

interface RewardCalendarGridProps {
  initialRewards?: Reward[];
  initialDraws?: DrawWithWinner[];
}

const RewardCalendarGrid = ({ initialRewards, initialDraws }: RewardCalendarGridProps) => {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards || []);
  const [draws, setDraws] = useState<DrawWithWinner[]>(initialDraws || []);
  const [loading, setLoading] = useState(!initialRewards || !initialDraws);
  const [error, setError] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentWeek] = useState<string>(getCurrentWeekString);
  
  useEffect(() => {
    // Only fetch if initial data wasn't provided
    if (!initialRewards || !initialDraws) {
      fetchData();
    }
  }, [initialRewards, initialDraws]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rewardsResponse, drawsResponse] = await Promise.all([
        apiRequest('GET', '/api/rewards', undefined),
        apiRequest('GET', '/api/draws/winners', undefined)
      ]);
      
      const rewardsData = await rewardsResponse.json();
      const drawsData = await drawsResponse.json();
      
      // Always set to empty arrays if we get falsy or non-array responses
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setDraws(Array.isArray(drawsData) ? drawsData : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("Failed to load reward calendar data. Please try again later.");
      // Use empty arrays when there's an error
      setRewards([]);
      setDraws([]);
      setLoading(false);
    }
  };
  
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentYearMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month;
    
    if (direction === 'prev') {
      if (month === 1) {
        newYear = year - 1;
        newMonth = 12;
      } else {
        newMonth = month - 1;
      }
    } else {
      if (month === 12) {
        newYear = year + 1;
        newMonth = 1;
      } else {
        newMonth = month + 1;
      }
    }
    
    setCurrentYearMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };
  
  const getMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };
  
  // Helper to get winner email for a specific week
  const getWinnerEmailForWeek = (week: string): string | undefined => {
    const draw = draws.find(d => d.week === week);
    return draw?.winner?.email;
  };
  
  // Filter and sort rewards
  const sortedRewards = [...rewards].sort((a, b) => {
    // Parse the week strings (format: YYYY-WW)
    const [yearA, weekA] = a.week.split('-').map(Number);
    const [yearB, weekB] = b.week.split('-').map(Number);
    
    // Sort by year descending, then by week descending
    if (yearA !== yearB) return yearB - yearA;
    return weekB - weekA;
  });
  
  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold gradient-text">{getMonthName(currentYearMonth)}</h2>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => changeMonth('prev')}
              className="bg-card hover:bg-card/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => changeMonth('next')}
              className="bg-card hover:bg-card/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-12 bg-muted" />
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-error">{error}</p>
          <Button className="mt-4" onClick={fetchData}>Retry</Button>
        </div>
      ) : sortedRewards.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No rewards found for this period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRewards.map((reward, index) => {
            const isActive = reward.week === currentWeek;
            const isPast = reward.week < currentWeek;
            const isUpcoming = reward.week > currentWeek;
            const winnerEmail = getWinnerEmailForWeek(reward.week);
            
            // Only show actual dates for current or past rewards, not upcoming ones
            const displayDate = isActive || isPast 
              ? formatWeekDateRange(reward.week)
              : `Upcoming Reward #${index + 1}`;
            
            return (
              <RewardCard
                key={reward.id}
                id={reward.id}
                title={reward.prizeName}
                value={reward.prizeValue}
                description={
                  reward.prizeType === 'voucher' 
                    ? `Use it to shop from ${reward.sponsor || 'our sponsors'}!` 
                    : reward.prizeType === 'recharge'
                    ? 'Recharge any mobile number with a premium plan!'
                    : `${reward.sponsor || 'Premium'} subscription for a month!`
                }
                imageUrl={reward.imageUrl}
                date={displayDate}
                isActive={isActive}
                isUpcoming={isUpcoming}
                isPast={isPast}
                winnerEmail={isPast ? winnerEmail : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RewardCalendarGrid;
