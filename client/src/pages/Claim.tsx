import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/Layout';
import ClaimForm from '@/components/claim/ClaimForm';
import ClaimStatus from '@/components/claim/ClaimStatus';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { CONFIG } from '@/config';

const Claim = () => {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [userReward, setUserReward] = useState<any | null>(null);
  const [userClaim, setUserClaim] = useState<any | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmittedClaim, setHasSubmittedClaim] = useState(false);
  
  // Set document title
  useEffect(() => {
    document.title = `Claim Your Reward | ${CONFIG.APP_NAME}`;
  }, []);
  
  // Check if user is logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/join?mode=login');
    }
  }, [currentUser, loading, navigate]);
  
  // Fetch user's current reward and claim status
  useEffect(() => {
    const fetchUserRewardAndClaim = async () => {
      if (!currentUser) return;
      
      try {
        // In a real app, we would call API endpoints to check if user has won
        // and if they have any pending claims
        const [userResponse, currentRewardResponse] = await Promise.all([
          apiRequest('GET', '/api/users/me', undefined),
          apiRequest('GET', '/api/rewards/current', undefined)
        ]);
        
        const userData = await userResponse.json();
        
        // Check if user has any claims
        if (userData.claims && userData.claims.length > 0) {
          const latestClaim = userData.claims[0]; // Assuming sorted by date
          setUserClaim(latestClaim);
          
          // If they have a claim, also get the reward details
          if (latestClaim.reward) {
            setUserReward(latestClaim.reward);
          } else if (latestClaim.rewardId) {
            // Fetch reward details if not included in the claim
            const rewardResponse = await apiRequest('GET', `/api/rewards/${latestClaim.rewardId}`, undefined);
            const rewardData = await rewardResponse.json();
            setUserReward(rewardData);
          }
        } else {
          // If no claims found, check if there's a current reward the user has won
          // This logic would depend on your backend implementation
          // For now, just use the current reward as a placeholder
          if (currentRewardResponse.ok) {
            const currentReward = await currentRewardResponse.json();
            setUserReward(currentReward);
          }
        }
      } catch (err) {
        console.error("Error fetching user reward/claim data:", err);
        setError("Failed to load your reward information. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };
    
    if (!loading && currentUser) {
      fetchUserRewardAndClaim();
    }
  }, [currentUser, loading, hasSubmittedClaim]);
  
  // Fallback data for development
  const fallbackReward = {
    id: 2,
    prizeName: "Amazon Gift Card",
    prizeValue: 500,
    prizeType: "voucher",
    sponsor: "Amazon",
    description: "Use it to shop from millions of products on Amazon!",
    imageUrl: "https://images.unsplash.com/photo-1607083206968-13611e3d76db",
  };
  
  const handleClaimSubmitted = () => {
    setHasSubmittedClaim(true);
  };
  
  if (loading || dataLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  const displayReward = userReward || fallbackReward;
  
  // Calculate claim deadline (7 days after the draw date)
  const getClaimDeadline = () => {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + 7);
    return deadline.toISOString();
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="bg-card rounded-xl shadow-lg">
            <CardContent className="p-6 text-center">
              <p className="text-error mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : hasSubmittedClaim || userClaim ? (
          <>
            {/* Show claim status if user has submitted a claim */}
            <ClaimStatus
              status={userClaim?.status || 'submitted'}
              rewardName={displayReward.prizeName}
              rewardValue={displayReward.prizeValue}
              deliveryEstimate="Within 24-48 hours"
              rejectionReason={userClaim?.status === 'rejected' ? "This reward has already been claimed." : undefined}
            />
          </>
        ) : (
          <>
            {/* Show claim form if user hasn't submitted a claim yet */}
            <ClaimForm
              rewardId={displayReward.id}
              rewardName={displayReward.prizeName}
              rewardValue={displayReward.prizeValue}
              rewardDescription={displayReward.description}
              rewardImageUrl={displayReward.imageUrl}
              drawDate={new Date().toISOString()}
              claimDeadline={getClaimDeadline()}
              onClaimSubmitted={handleClaimSubmitted}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Claim;
