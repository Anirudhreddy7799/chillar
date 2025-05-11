import { Card, CardContent } from "@/components/ui/card";
import useCountdown from "@/hooks/useCountdown";
import { formatDate } from "@/lib/utils";

interface CountdownWidgetProps {
  drawDate: string;
}

const CountdownWidget = ({ drawDate }: CountdownWidgetProps) => {
  const targetDate = new Date(drawDate);
  const countdown = useCountdown(targetDate);
  
  const formatCountdownDigit = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };
  
  return (
    <Card className="bg-card rounded-xl shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Next Draw Countdown</h2>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="countdown-segment bg-background p-2 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {formatCountdownDigit(countdown.days)}
            </div>
            <div className="text-xs text-muted-foreground">Days</div>
          </div>
          <div className="countdown-segment bg-background p-2 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {formatCountdownDigit(countdown.hours)}
            </div>
            <div className="text-xs text-muted-foreground">Hours</div>
          </div>
          <div className="countdown-segment bg-background p-2 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {formatCountdownDigit(countdown.minutes)}
            </div>
            <div className="text-xs text-muted-foreground">Mins</div>
          </div>
          <div className="countdown-segment bg-background p-2 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {formatCountdownDigit(countdown.seconds)}
            </div>
            <div className="text-xs text-muted-foreground">Secs</div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Draw date: {formatDate(drawDate)}
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownWidget;
