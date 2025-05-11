import { Card, CardContent } from "@/components/ui/card";
import { maskEmail } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";

interface WinnerCardProps {
  email: string;
  location?: string;
  rewardName: string;
  rewardValue: number;
  date: string;
  imageUrl: string;
}

const WinnerCard = ({
  email,
  location = "India",
  rewardName,
  rewardValue,
  date,
  imageUrl,
}: WinnerCardProps) => {
  const maskedEmail = maskEmail(email);
  const avatarLetter = email.charAt(0).toUpperCase();
  const colorClasses = [
    "bg-primary",
    "bg-secondary", 
    "bg-accent", 
    "bg-primary-light"
  ];
  
  // Determine avatar color based on first letter (for visual variety)
  const colorClass = colorClasses[avatarLetter.charCodeAt(0) % colorClasses.length];
  
  return (
    <Card className="flex-none w-80 overflow-hidden shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center mb-4">
          <Avatar className={colorClass}>
            <AvatarFallback>{avatarLetter}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-white">{maskedEmail}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>
        
        <div className="bg-background/50 p-3 rounded-lg mb-3">
          <p className="text-white">
            Won <span className="font-bold text-accent">{rewardName}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {date}
          </p>
        </div>
        
        <img 
          src={imageUrl} 
          alt="Winner celebration" 
          className="w-full h-32 object-cover rounded-lg" 
        />
      </CardContent>
    </Card>
  );
};

export default WinnerCard;
