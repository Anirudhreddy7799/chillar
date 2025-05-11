import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, MessageSquare, Mail, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralWidgetProps {
  referralCode: string;
}

const ReferralWidget = ({ referralCode }: ReferralWidgetProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Referral code has been copied to clipboard",
          duration: 2000,
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy referral code",
          variant: "destructive",
          duration: 2000,
        });
      });
  };
  
  const shareReferral = async () => {
    const shareText = `Join Chillar Club with my referral code ${referralCode} and get a chance to win exciting weekly rewards! Sign up here: https://chillarclub.in/join?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Chillar Club',
          text: shareText,
          url: `https://chillarclub.in/join?ref=${referralCode}`,
        });
        toast({
          title: "Shared successfully",
          description: "Thanks for sharing Chillar Club!",
          duration: 2000,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      copyToClipboard();
    }
  };
  
  const shareViaWhatsApp = () => {
    const shareText = `Join Chillar Club with my referral code ${referralCode} and get a chance to win exciting weekly rewards! Sign up here: https://chillarclub.in/join?ref=${referralCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const shareViaEmail = () => {
    const subject = "Join Chillar Club and win weekly rewards!";
    const body = `Hi there,\n\nI wanted to invite you to join Chillar Club, a platform where you can win exciting weekly rewards for just ₹1/day!\n\nUse my referral code ${referralCode} when signing up: https://chillarclub.in/join?ref=${referralCode}\n\nCheers!`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };
  
  // Format the referral code with a space in the middle for better readability
  const formattedCode = referralCode.length > 3 
    ? `${referralCode.slice(0, 3)} ${referralCode.slice(3)}`
    : referralCode;

  return (
    <Card className="bg-card rounded-xl shadow-lg">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Invite Friends</h2>
        
        <p className="text-muted-foreground text-sm mb-3">
          Share your referral code with friends and get rewards together when they join and subscribe!
        </p>
        
        <div className="mb-5">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
          <div className="bg-background/40 rounded-lg p-3 flex items-center justify-between border border-gray-600">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-wide select-all">{formattedCode}</span>
              <span className="text-xs text-muted-foreground mt-1">Click to copy</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-9 px-3 transition-all duration-200 ${isCopied ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'text-secondary hover:text-secondary-light hover:bg-background/60'}`} 
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-medium">Copied</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  <span className="text-xs font-medium">Copy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1 flex flex-col items-center justify-center h-16 p-2 bg-gradient-to-br from-purple-600/30 to-indigo-700/30 border-purple-500/50 hover:bg-gradient-to-br hover:from-purple-600/40 hover:to-indigo-700/40 transition duration-200 text-white"
            onClick={shareReferral}
          >
            <Share2 className="mb-1.5 h-5 w-5 text-purple-300" />
            <span className="text-xs font-medium">Share</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 flex flex-col items-center justify-center h-16 p-2 bg-gradient-to-br from-green-600/30 to-emerald-700/30 border-green-500/50 hover:bg-gradient-to-br hover:from-green-600/40 hover:to-emerald-700/40 transition duration-200 text-white"
            onClick={shareViaWhatsApp}
          >
            <MessageSquare className="mb-1.5 h-5 w-5 text-green-300" />
            <span className="text-xs font-medium">WhatsApp</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 flex flex-col items-center justify-center h-16 p-2 bg-gradient-to-br from-blue-600/30 to-cyan-700/30 border-blue-500/50 hover:bg-gradient-to-br hover:from-blue-600/40 hover:to-cyan-700/40 transition duration-200 text-white"
            onClick={shareViaEmail}
          >
            <Mail className="mb-1.5 h-5 w-5 text-blue-300" />
            <span className="text-xs font-medium">Email</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralWidget;
