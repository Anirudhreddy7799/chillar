import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Clock } from "lucide-react";
import useCountdown from "@/hooks/useCountdown";

interface CurrentRewardProps {
  prizeName: string;
  prizeValue: number;
  description: string;
  imageUrl: string;
  drawDate: string;
}

const CurrentReward = ({
  prizeName,
  prizeValue,
  description,
  imageUrl,
  drawDate
}: CurrentRewardProps) => {
  const targetDate = new Date(drawDate);
  const countdown = useCountdown(targetDate);
  
  // Format countdown for display
  const formattedCountdown = countdown.isComplete 
    ? "Draw in progress!" 
    : `${countdown.days} days, ${countdown.hours} hours`;

  return (
    <Card className="bg-card rounded-xl shadow-lg relative overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: `url('https://pixabay.com/get/g383be529f8ce0db8dd375d3f44d17994d430300b8d72c9db44f8a982feb303e023dcbd01fa0280b2f2a25becf3183957b25615d2fbedfd8e4bc8a5668174f409_1280.jpg')`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}
      />
      
      <CardContent className="p-6 relative z-10">
        <h2 className="text-xl font-bold text-white mb-4">This Week's Reward</h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <img 
            src={imageUrl} 
            alt={prizeName} 
            className="w-full md:w-32 h-32 object-cover rounded-lg shadow-lg" 
          />
          
          <div className="flex-grow">
            <h3 className="text-2xl font-bold gradient-text">{formatCurrency(prizeValue)} {prizeName}</h3>
            <p className="text-muted-foreground mt-1">{description}</p>
            
            <div className="mt-4 flex items-center">
              <Clock className="text-warning mr-2 h-5 w-5" />
              <p className="text-sm text-muted-foreground">
                Winner announced in: <span className="font-medium text-white">{formattedCountdown}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentReward;
