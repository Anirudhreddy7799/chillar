import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RewardCardProps {
  id: number;
  title: string;
  value: number;
  description: string;
  imageUrl?: string | null;
  date: string;
  isActive?: boolean;
  isUpcoming?: boolean;
  isPast?: boolean;
  winnerEmail?: string;
}

const RewardCard = ({
  id,
  title,
  value,
  description,
  imageUrl,
  date,
  isActive = false,
  isUpcoming = false,
  isPast = false,
  winnerEmail,
}: RewardCardProps) => {
  return (
    <Card className={`overflow-hidden shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl
      ${isActive ? 'border-2 border-primary animate-pulse-glow' : 'opacity-100'}
      ${isPast ? 'opacity-80' : 'opacity-100'}
    `}>
      <div className={`p-4 ${isActive ? 'gradient-bg' : isUpcoming ? 'bg-accent/20' : 'bg-muted'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center">
            {isActive ? 'Current Week' : isUpcoming ? 'Coming Soon' : 'Past'}
            {isUpcoming && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-accent/30 text-accent-foreground">
                Mystery
              </span>
            )}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/30 text-white">
            {date}
          </span>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {imageUrl && typeof imageUrl === 'string' ? (
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full sm:w-24 h-24 object-cover rounded-lg shadow-lg" 
            />
          ) : (
            <div className="w-full sm:w-24 h-24 bg-muted rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-white">{title || "Coming Soon"}</h3>
              <span className="text-accent font-bold">{formatCurrency(value || 0)}</span>
            </div>
            <p className="text-muted-foreground mb-4">{description || "Stay tuned for more details."}</p>
            
            {winnerEmail ? (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  Winner: <span className="font-medium text-white">{winnerEmail}</span>
                </p>
              </div>
            ) : isActive ? (
              <div className="mt-4 flex items-center">
                <span className="material-icons text-warning mr-2">schedule</span>
                <p className="text-sm text-muted-foreground">
                  Drawing soon
                </p>
              </div>
            ) : isUpcoming ? (
              <div className="mt-4 flex items-center">
                <span className="material-icons text-muted-foreground mr-2">schedule</span>
                <p className="text-sm text-muted-foreground">
                  Coming up
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardCard;
