import { Card, CardContent } from "@/components/ui/card";
import { Check, Truck } from "lucide-react";

interface ClaimStatusProps {
  status: 'submitted' | 'approved' | 'fulfilled' | 'rejected';
  rewardName: string;
  rewardValue: number;
  deliveryEstimate?: string;
  rejectionReason?: string;
}

const ClaimStatus = ({
  status,
  rewardName,
  rewardValue,
  deliveryEstimate = 'Within 24-48 hours',
  rejectionReason,
}: ClaimStatusProps) => {
  // Calculate progress percentage based on status
  let progress = 0;
  if (status === 'submitted') progress = 33;
  else if (status === 'approved') progress = 66;
  else if (status === 'fulfilled') progress = 100;
  
  // Status message based on current status
  let statusMessage = '';
  if (status === 'submitted') {
    statusMessage = `Your claim for ${rewardName} has been submitted. We're reviewing it now.`;
  } else if (status === 'approved') {
    statusMessage = `Your claim has been approved! We're preparing your ${rewardName} and will deliver it to your email soon.`;
  } else if (status === 'fulfilled') {
    statusMessage = `Your ${rewardName} has been delivered to your email. Enjoy!`;
  } else if (status === 'rejected') {
    statusMessage = `We're sorry, but your claim for ${rewardName} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`;
  }
  
  return (
    <Card className="mt-8 bg-card rounded-xl shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Claim Status</h3>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status !== 'rejected' ? 'gradient-bg' : 'bg-muted'}`}>
                <Check className="text-white h-5 w-5" />
              </div>
              <p className="mt-2 text-sm text-white text-center">Submitted</p>
            </div>
            
            <div className="flex-grow mx-4 h-1 bg-muted">
              <div 
                className={`h-full ${status !== 'rejected' ? 'gradient-bg' : 'bg-error'}`} 
                style={{ width: `${status !== 'rejected' ? 100 : 0}%` }}
              />
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${status === 'approved' || status === 'fulfilled' ? 'gradient-bg' : 'bg-muted'}`}
              >
                <Check className="text-white h-5 w-5" />
              </div>
              <p className={`mt-2 text-sm text-center ${status === 'approved' || status === 'fulfilled' ? 'text-white' : 'text-muted-foreground'}`}>
                Approved
              </p>
            </div>
            
            <div className="flex-grow mx-4 h-1 bg-muted">
              <div 
                className="h-full gradient-bg" 
                style={{ width: `${status === 'fulfilled' ? 100 : 0}%` }}
              />
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                ${status === 'fulfilled' ? 'gradient-bg' : 'bg-muted'}`}
              >
                <Truck className={`h-5 w-5 ${status === 'fulfilled' ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <p className={`mt-2 text-sm text-center ${status === 'fulfilled' ? 'text-white' : 'text-muted-foreground'}`}>
                Fulfilled
              </p>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${status === 'rejected' ? 'bg-error/20' : 'bg-background/40'}`}>
            <p className={`${status === 'rejected' ? 'text-error' : 'text-white'}`}>{statusMessage}</p>
            {(status === 'approved' || status === 'submitted') && deliveryEstimate && (
              <p className="mt-2 text-sm text-muted-foreground">Expected delivery: {deliveryEstimate}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimStatus;
