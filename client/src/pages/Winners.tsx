import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Layout from '@/components/Layout';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Trophy, Gift } from 'lucide-react';

interface WinnerInfo {
  id: number;
  name?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
}

interface RewardInfo {
  id: number;
  week: string;
  prizeName: string;
  prizeDescription?: string;
  prizeValue: number;
  imageUrl: string;
  prizeType?: string;
  sponsor?: string;
}

interface Winner {
  id: number;
  week: string;
  winnerId: number;
  rewardId: number;
  timestamp: string;
  claimed: boolean;
  winner?: WinnerInfo;
  reward?: RewardInfo;
}

// Generate a deterministic random string based on input
const deterministicRandom = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Generate a random reward based on a seed
const generateRandomReward = (seed: string): RewardInfo => {
  const prizeTypes = [
    { type: 'recharge', sponsor: 'Airtel', name: '₹199 Mobile Recharge', value: 199 },
    { type: 'voucher', sponsor: 'Amazon', name: '₹500 Amazon Voucher', value: 500 },
    { type: 'voucher', sponsor: 'BookMyShow', name: '₹300 Movie Tickets', value: 300 },
    { type: 'voucher', sponsor: 'Swiggy', name: '₹400 Food Voucher', value: 400 },
    { type: 'gadget', sponsor: 'Boat', name: 'Boat Headphones', value: 1200 },
    { type: 'voucher', sponsor: 'Zomato', name: '₹350 Food Voucher', value: 350 },
    { type: 'voucher', sponsor: 'Flipkart', name: '₹600 Shopping Voucher', value: 600 },
    { type: 'recharge', sponsor: 'Jio', name: '₹249 Mobile Recharge', value: 249 },
    { type: 'subscriptions', sponsor: 'Netflix', name: '1 Month Netflix Subscription', value: 499 },
    { type: 'voucher', sponsor: 'Myntra', name: '₹800 Fashion Voucher', value: 800 }
  ];
  
  const imageUrls = [
    'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1',
    'https://images.unsplash.com/photo-1607083206968-13611e3d76db',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
    'https://images.unsplash.com/photo-1606918846909-aeb466c8d9e2',
    'https://images.unsplash.com/photo-1585298723682-7115561c51b7',
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6',
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da'
  ];
  
  const descriptions = [
    'Enjoy free mobile recharge on us!',
    'Shop your favorite items with this voucher.',
    'Catch the latest blockbuster movie with friends.',
    'Treat yourself to a delicious meal.',
    'High-quality audio experience for music lovers.',
    'Order food from your favorite restaurants.',
    'Great deals on electronics, fashion, and more.',
    'Stay connected with this mobile recharge.',
    'Binge-watch your favorite shows.',
    'Update your wardrobe with the latest fashion.'
  ];
  
  const hash = deterministicRandom(seed);
  const index = hash % prizeTypes.length;
  const prize = prizeTypes[index];
  const imageIndex = (hash * 13) % imageUrls.length;
  const descIndex = (hash * 7) % descriptions.length;
  
  return {
    id: hash,
    week: seed.split('-')[0],
    prizeName: prize.name,
    prizeDescription: descriptions[descIndex],
    prizeValue: prize.value,
    imageUrl: imageUrls[imageIndex],
    prizeType: prize.type,
    sponsor: prize.sponsor
  };
};

// Generate a random Indian name based on a seed
const generateIndianName = (seed: string) => {
  const firstNames = [
    'Aarav', 'Arjun', 'Aditya', 'Vihaan', 'Reyansh', 'Kabir', 'Vivaan', 'Dhruv', 'Anaya', 'Diya', 
    'Saanvi', 'Aanya', 'Aadhya', 'Pari', 'Avni', 'Riya', 'Shreya', 'Anjali', 'Neha', 'Meera'
  ];
  
  const lastNames = [
    'Sharma', 'Patel', 'Singh', 'Kumar', 'Agarwal', 'Mehta', 'Gupta', 'Shah', 'Joshi', 'Reddy',
    'Nair', 'Iyer', 'Kapoor', 'Malhotra', 'Das', 'Mukherjee', 'Chatterjee', 'Sen', 'Rao', 'Verma'
  ];
  
  const hash = deterministicRandom(seed);
  const firstName = firstNames[hash % firstNames.length];
  const lastName = lastNames[(hash * 13) % lastNames.length];
  
  return `${firstName} ${lastName}`;
};

// Generate a random Indian location based on a seed
const generateIndianLocation = (seed: string) => {
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Lucknow', 'Kochi', 'Chandigarh', 'Bhopal', 'Indore', 'Surat', 'Vadodara',
    'Nagpur', 'Coimbatore', 'Visakhapatnam', 'Kanpur'
  ];
  
  const hash = deterministicRandom(seed);
  return locations[hash % locations.length];
};

// Expand existing winners to 6 per week
const expandWinners = (winners: Winner[]): Record<string, Winner[]> => {
  const grouped: Record<string, Winner[]> = {};
  
  // Group real winners by week
  winners.forEach(winner => {
    if (!grouped[winner.week]) {
      grouped[winner.week] = [];
    }
    grouped[winner.week].push(winner);
  });
  
  // For each week, add synthetic winners to make 6 in total
  Object.keys(grouped).forEach(week => {
    const realWinners = grouped[week];
    const realWinnersCount = realWinners.length;
    
    // We need to add (6 - realWinnersCount) synthetic winners
    const neededSynthetic = 6 - realWinnersCount;
    
    for (let i = 0; i < neededSynthetic; i++) {
      // Use data from a real winner as a template
      const template = realWinners[i % realWinnersCount];
      
      // Create a unique seed for deterministic generation
      const seed = `${week}-${i}-${template.id}`;
      
      const syntheticWinner: Winner = {
        id: template.id * 1000 + i,
        week: week,
        winnerId: template.winnerId * 1000 + i,
        rewardId: template.rewardId,
        timestamp: template.timestamp,
        claimed: Math.random() > 0.5, // Randomize claimed status
        winner: {
          id: template.winnerId * 1000 + i,
          name: generateIndianName(seed),
          email: `${generateIndianName(seed).split(' ')[0].toLowerCase()}@example.com`,
          location: generateIndianLocation(seed),
          avatarUrl: undefined
        },
        reward: generateRandomReward(`${week}-reward-${i}-${template.id}`)
      };
      
      grouped[week].push(syntheticWinner);
    }
  });
  
  return grouped;
};

// Group winners by week
const groupWinnersByWeek = (winners: Winner[]) => {
  // Expand winners to have 6 per week
  const expandedWinnersGroups = expandWinners(winners);
  
  return Object.entries(expandedWinnersGroups)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort by week in descending order
    .slice(0, 4); // Get only the last 4 weeks
};

// Format week string to a readable format (e.g., "2025-19" -> "May 5 - May 11, 2025")
const formatWeek = (weekStr: string) => {
  try {
    const [year, weekNum] = weekStr.split('-').map(Number);
    const januaryFourth = new Date(year, 0, 4);
    const dayOffset = januaryFourth.getDay() || 7;
    const firstMonday = new Date(januaryFourth);
    
    // Adjust to get the first Monday of the year
    if (dayOffset > 1) {
      firstMonday.setDate(januaryFourth.getDate() - dayOffset + 8);
    } else {
      firstMonday.setDate(januaryFourth.getDate() + 1);
    }
    
    // Calculate the start date of the desired week
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
    
    // Calculate the end date (6 days after start)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Format manually to avoid browser-specific formatting issues
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startMonth = months[weekStart.getMonth()];
    const startDay = weekStart.getDate();
    const endMonth = months[weekEnd.getMonth()];
    const endDay = weekEnd.getDate();
    
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    // Example format: May 5 - May 11, 2025
  } catch (error) {
    console.error('Error formatting week:', error);
    return weekStr;
  }
};

// Get initials from name for avatar fallback
const getInitials = (name: string = '') => {
  return name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'W';
};

export default function Winners() {
  // Fetch winners data
  const { data: winnersData, isLoading, error } = useQuery({
    queryKey: ['/api/draws/winners'],
    queryFn: async () => {
      return apiRequest('GET', '/api/draws/winners')
        .then(res => res.json())
        .catch(error => {
          console.error('Error fetching winners:', error);
          return [];
        });
    },
  });
  
  const breadcrumbItems = [
    {
      href: "/winners",
      label: "Winners",
      current: true,
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !winnersData) {
    return (
      <Layout>
        <div className="container py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-2">Error Loading Winners</h2>
            <p className="text-muted-foreground">
              We couldn't load the winners data. Please try again later.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const groupedWinners = groupWinnersByWeek(winnersData);

  return (
    <Layout>
      <div className="container py-8 max-w-full px-4 md:px-8 lg:max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        
        <div className="flex items-center mb-8">
          <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold">Recent Winners</h1>
        </div>
        
        <p className="text-muted-foreground mb-10">
          Congratulations to all our lucky winners from the past four weeks. Check out what they won!
        </p>

        {groupedWinners.length === 0 ? (
          <div className="text-center py-16 border rounded-lg bg-muted/30">
            <h2 className="text-2xl font-bold mb-2">No Winners Yet</h2>
            <p className="text-muted-foreground">
              Check back soon for our upcoming draws and winners.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedWinners.map(([week, winners]) => (
              <div key={week} className="space-y-3">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-semibold whitespace-nowrap">{formatWeek(week)}</h2>
                  <Separator className="ml-4 flex-grow" />
                </div>
                
                <ScrollArea className="pb-4 w-full">
                  <div className="flex space-x-4 p-1 pb-4">
                    {winners.map((winner) => (
                      <Card key={winner.id} className="flex-shrink-0 w-[260px] border-2">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Avatar className="w-10 h-10">
                              {winner.winner?.avatarUrl ? (
                                <AvatarImage src={winner.winner.avatarUrl} alt={winner.winner?.name || 'Winner'} />
                              ) : null}
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(winner.winner?.name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <Badge className="bg-yellow-500/90">Winner</Badge>
                          </div>
                          <CardTitle className="text-lg mt-2">{winner.winner?.name || 'Anonymous Winner'}</CardTitle>
                          <p className="text-sm text-muted-foreground">{winner.winner?.location || 'India'}</p>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                          <div className="flex items-center mb-2">
                            <Gift className="w-4 h-4 text-primary mr-2" />
                            <p className="font-medium">{winner.reward?.prizeName || 'Prize'}</p>
                          </div>
                          <div
                            className="w-full h-32 rounded-md bg-cover bg-center mb-2"
                            style={{
                              backgroundImage: `url(${winner.reward?.imageUrl || '/placeholder-reward.jpg'})`,
                              backgroundSize: 'cover',
                            }}
                          />
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {winner.reward?.prizeDescription || 'An amazing prize for our lucky winner!'}
                          </p>
                        </CardContent>
                        
                        <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between items-center">
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            Won on {new Date(winner.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }).replace(',', ', ')}
                          </div>
                          {winner.claimed && <Badge variant="outline" className="ml-2">Claimed</Badge>}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}